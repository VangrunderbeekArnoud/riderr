import { Component } from '@angular/core';
import {
  Platform,
  NavController,
  AlertController,
  ModalController,
  Events, Modal
} from 'ionic-angular';
import { UberAPI } from "../../services/uber.services";
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';
import { AutoCompletePage } from '../auto-complete/auto-complete';

@Component({
  selector: 'page-book-ride',
  templateUrl: 'book-ride.html',
})
export class BookRidePage {

  private map: GoogleMap;
  private products;
  private fromGeo;
  private toGeo;
  private selectedProduct;
  private isRideInProgress: boolean = false;
  private currentRideInfo;

  constructor(private navCtrl: NavController,
              private uberApi: UberAPI,
              private platform: Platform,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private diagnostic: Diagnostic,
              private geoLocation: Geolocation,
              private googleMaps: GoogleMap,
              public events: Events) {
  }

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.requestPerms();
      this.events.subscribe('menu:opened', () => {
        this.map.setClickable(false);
      });
      this.events.subscribe('menu:closed', () => {
        this.map.setClickable(true);
      });
    });
  }

  private requestPerms() {
    let that = this;
    function success(statuses) {
      for ( var permission in statuses) {
        switch ( statuses[permission]) {
          case that.diagnostic.permissionStatus.GRANTED:
            that.fetCords();
            break;
          case that.diagnostic.permissionStatus.NOT_REQUESTED:
            console.log("Permission to use " + permission + " has not been requested yet");
            break;
          case that.diagnostic.permissionStatus.DENIED:
            console.log("Permission denied to use " + permission + " - ask again?");
            break;
          case that.diagnostic.permissionStatus.DENIED_ALWAYS:
            console.log("Permission permanently denied to use " + permission + " = guess we won't be using it then !");
            break;
        }
      }
    }
    function error(error) {
      console.log(error);
    }
    this.diagnostic.requestRuntimePermissions([
      that.diagnostic.permission.ACCESS_FINE_LOCATION,
      that.diagnostic.permission.ACCESS_COURSE_LOCATION
    ]).then(success).catch(error)
  }

  private isExecuted = false;
  private fetCords() {
    if ( this.isExecuted) return;
    this.isExecuted = true;
    this.geoLocation.getCurrentPosition().then((resp) => {
      this.fromGeo = resp.coords;
      this.uberApi.getProducts(this.fromGeo.latitude, this.fromGeo.longitude).subscribe((data) => {
        this.uberApi.hideLoader();
        this.products = data.json().products;
      });
      this.uberApi.getCurrentRides(this.fromGeo.latitude, this.fromGeo.longitude).subscribe((crrRides) => {
        this.currentRideInfo = crrRides.json();
        this.isRideInProgress = true;
        this.uberApi.hideLoader();
        this.loadMap(this.fromGeo.latitude, this. fromGeo.longitude);
      }, (err) => {
        if ( err.status === 404) {
          // no rides available
        }
        this.isRideInProgress = false;
        this.uberApi.hideLoader();
        this.loadMap(this.fromGeo.latitude, this.fromGeo.longitude);
      });
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  private loadMap(lat: number, lon: number) {
    let element: HTMLElement = document.getElementById('map');
    element.innerHTML = '';
    this.map = undefined;
    this.map = this.googleMaps.create(element);
    let ccrLoc: latLng = new LatLng(lat, lon);
    let position: CameraPosition = {
      target: ccrLoc,
      zoom: 18,
      tilt: 30
    };
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.map.moveCamera(position);
      let markerOptions: MarkerOptions = {
        position: ccrLoc,
        draggable: true,
        title: this.isRideInProgress ? 'Ride in progress' : 'Select destination >',
        infoClick: (() => {
          if ( !this.isRideInProgress) {
            this.selectDestination();
          }
        }),
        markerClick: (() => {
          if ( !this.isRideInProgress) {
            this.selectDestination();
          }
        })
      };
    });
    this.map.addMarker(markerOptions)
      .then((marker: Marker) => {
        marker.showInfoWindow();
      });
    this.uberApi.hideLoader();
  }

  private productClick(product) {
    for ( let i = 0; i < this.products.length; i++) {
      if ( this.products[i].product_id === product.product_id) {
        this.products[i].isSelected = true;
      } else {
        this.products[i].isSelected = false;
      }
    }
    this.selectedProduct = product;
  }

  private selectDestination() {
    if ( this.isRideInProgress) {
      this.map.setClickable(false);
      let alert = this.alertCtrl.create({
        title: 'Only one ride !',
        subTitle: 'You can book only one ride at a time',
        buttons: ['Ok']
      });
      alert.onDidDismiss(() => {
        this.map.setClickable(true);
      });
      alert.present();
    } else {
      if ( !this.selectedProduct) {
        this.map.setClickable(false);
        let alert = this.alertCtrl.create({
          title: 'Select ride',
          subTitle: 'Select a ride type to continue ( Pool or Go or X)',
          buttons: ['Ok']
        });
        alert.onDidDismiss(() => {
          this.map.setClickable(true);
        });
        alert.present();
      } else {
        this.map.setClickable(false);
        let modal = this.modalCtrl.create(AutoCompletePage);
        modal.onDidDismiss((data) => {
          this.map.setClickable(true);
          this.toGeo = data;
          this
            .uberApi
            .requestRideEstimates(this.fromGeo.latitude,
              this.toGeo.latitude, this.fromGeo.longitude,
              this.toGeo.longitude)
            .subscribe((data) => {
              this.uberApi.hideLoader();
              this.processRideFares(data.json());
            });
        });
        modal.present();
      }
    }
  }

  private processRideFares(fareInfo: any) {
    console.log('fareInfo', fareInfo);
    this.map.setClickable(false);
    let confirm = this.alertCtrl.create({
      title: 'Book Ride?',
      message: 'The fare for this ride would be '
      + fareInfo.fare.value
      + ' ' + fareInfo.currency_code + '.\n And it will take approximately '
      + (fareInfo.trip.duration_estimate /60) + ' mins.',
      buttons: [
        {
          text: 'No',
          handler: () => { this.map.setClickable(true);}
        },
        {
          text: 'Yes',
          handler: () => {
            this.map.setClickable(true);
            this.uberApi.requestRide(this.selectedProduct.product_id,
              fareInfo.fare.fare_id, this.fromGeo.latitude,
              this.toGeo.latitude, this.fromGeo.longitude, this.toGeo.longitude)
              .subscribe((rideInfo) => {
                this.uberApi.hideLoader();
                this.isRideInProgress = true;
                this.currentRideInfo = rideInfo.json();
              });
          }
        }
      ]
    });
    confirm.present();
  }

  private cancelRide() {
    this.uberApi.cancelCurrentRide().subscribe((cancelInfo) => {
      this.uberApi.hideLoader();
      this.isRideInProgress = false;
      this.currentRideInfo = undefined;
    });
  }

}



















