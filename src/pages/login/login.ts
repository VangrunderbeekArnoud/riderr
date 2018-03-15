import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UberAPI } from "../../services/uber.services";
import { HomePage } from "../home/home";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(private api: UberAPI, private navCtrl: NavController) {
    this.api.isAuthenticated().subscribe((isAuth) => {
      if ( isAuth) {
        this.navCtrl.setRoot(HomePage);
      }
    });
  }

  auth() {
    this.api.auth().subscribe((isAuthSuccess) => {
      this.navCtrl.setRoot(HomePage);
    }, function (error) {
      console.log('Fail!!', error);
    });
  }

}
