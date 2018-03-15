import { Component, NgZone } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-auto-complete',
  templateUrl: 'auto-complete.html',
})
export class AutoCompletePage {

  autocompleteItems;
  autocomplete;
  ctr: HTMLElement = document.getElementById("q");
  service = new google.maps.places.AutocompleteService();
  geocoder = new google.maps.Geocoder();

  constructor(public viewCtrl: ViewController, private zone: NgZone) {
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  chooseItem(item: any) {
    this.geocoder.geocode({
      'placeId': item.place_id
    }, (responses) => {
      this.viewCtrl.dismiss({
        description: item.description,
        latitude: responses[0].geometry.location.lat(),
        longitude: responses[0].geometry.location.lng()
      });
    });
  }

  updateSearch() {
    if ( this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let that = this;
    this.service.getPlacePredictions({
      input: that.autocomplete.query,
      componentRestrictions: { country: 'IN'}
    }, (predictions, status) => {
      that.autocompleteItems = [];
      that.zone.run(function () {
        predictions = predictions || [];
        predictions.forEach(function(prediction) {
          that.autocompleteItems.push(prediction);
        });
      });
    });
  }

}


























