import { Injectable } from '@angular/core';
import { LoadingController } from "ionic-angular";
import { Http, Headers, Response, RequestOptions } from "@angular/http";
import { InAppBrowser } from '@ionic-native/in-app-browser'
import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";

@Injectable()
export class UberAPI {
  private client_secret: string = 'KKK141RhfC16CYmxIb1DMUQJFR13hVwM75Ludq87';
  private client_id: string = 'bK56q3MBUH-vu7me2H_IH0KVZD1X0LIt';
  private redirect_uri: string = 'http://localhost/callback';
  private scopes: string = 'profile history places request';
  private UBERSANDBOXAPIURL = 'https://sandbox-api.uber.com/v1.2/';
  private TOKENKEY = 'token';
  private loader;
  private token;

  constructor( private http: Http,
               private storage: Storage,
               private loadingCtrl: LoadingController,
               private inAppBrowser: InAppBrowser ) {
    this.storage.get(this.TOKENKEY).then((token) => {
      this.token = token;
    });
  }

  private createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Bearer ' + this.token);
    headers.append('Accept-Language', 'en_US');
    headers.append('Content-Type', 'application/json');
  }

  isAuthenticated(): Observable<boolean> {
    this.showLoader('Authenticating ...');
    return new Observable<boolean>((observer) => {
      this.storage.ready().then(() => {
        this.storage.get(this.TOKENKEY).then((token) => {
          observer.next((!!token)); // !! -> converts truthy falsy to boolean.
          observer.complete();
          this.hideLoader();
        });
      });
    });
  }

  logout(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.storage.ready().then(() => {
        this.storage.set(this.TOKENKEY, undefined);
        this.token = undefined;
        observer.next(true);
        observer.complete();
      });
    });
  }

  auth(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.storage.ready().then(() => {
        let browser = this.inAppBrowser.create(
          `https://login.uber.com/oauth/v2/authorize?
          client_id=${this.client_id}&
          response_type=code&scope=${this.scopes}&
          redirect_uri=${this.redirect_uri}`, '_blank',
          'location=no,clearsessioncache=yes,clearcache=yes');
        browser.on('loadstart').subscribe((event) => {
          let url = event.url;
          if(url.indexOf(this.redirect_uri) === 0) {
            browser.close();
            let resp = (url).split("?")[1];
            let responseParameters = resp.split("&");
            var parameterMap: any = {};
            for ( var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] =
                responseParameters[i].split("=")[1];
            }

            let headers = new Headers({
              'Content-type': "application/x-www-form-urlencoded"
            });
            let options = new RequestOptions({ headers: headers});
            let data =
              `client_secret=${this.client_secret}
              &client_id=${this.client_id}&grant_type=
              authorization_code&redirect_uri=
              ${this.redirect_uri}&code=${parameterMap.code}`;
            return this.http.post('https://login.uber.com/oauth/v2/token', data, options)
              .subscribe((data) => {
                let respJson: any = data.json();
                this.storage.set(this.TOKENKEY, respJson.access_token);
                this.token = respJson.access_token;
                observer.next(true);
                observer.complete();
              });
          }
        });
      });
    });
  }

  getMe(): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(this.UBERSANDBOXAPIURL + 'history', {
      headers: headers
    });
  }

  getPaymentMethods(): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(this.UBERSANDBOXAPIURL + 'payment-methods', {
      headers: headers
    });
  }

  getProducts(lat: Number, lon: Number): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(this.UBERSANDBOXAPIURL + 'products?latitude='
      + lat + '&longitude=' + lon, {
      headers: headers
    });
  }

  requestRideEstimates( start_lat: Number, end_lat: Number,
                        start_lon: Number, end_lon: Number): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(this.UBERSANDBOXAPIURL + 'requests/estimate', {
      "start_latitude": start_lat,
      "start_longitude": start_lon,
      "end_latitude": end_lat,
      "end_longitude": end_lon
    }, { headers: headers});
  }

  requestRide( product_id: string, fare_id: string, start_lat: Number,
               end_lat: Number, start_lon: Number, end_lon: Number): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(this.UBERSANDBOXAPIURL + 'requests', {
      "product_id": product_id,
      "fare_id": fare_id,
      "start_latitude": start_lat,
      "start_longitude": start_lon,
      "end_latitude": end_lat,
      "end_longitude": end_lon
    }, { headers: headers});
  }

  getCurrentRides(lat: Number, lon: Number): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(this.UBERSANDBOXAPIURL + 'requests/current', {
      headers: headers
    });
  }

  cancelCurrentRide(): Observable<Response> {
    this.showLoader();
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.delete(this.UBERSANDBOXAPIURL + 'requests/current', {
      headers: headers
    });
  }

  private showLoader(text?: string) {
    this.loader = this.loadingCtrl.create({
      content: text || 'Loading...'
    });
    this.loader.present();
  }

  public hideLoader() {
    this.loader.dismiss();
  }

}
