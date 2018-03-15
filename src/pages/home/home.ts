import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { BookRidePage } from '../book-ride/book-ride';
import { ProfilePage } from '../profile/profile';
import { HistoryPage } from '../history/history';
import { PaymentsMethodsPage } from '../payment-methods/payment-methods';
import { LoginPage } from '../login/login';
import { UberAPI } from "../../services/uber.services";
import { ViewChild } from "@angular/core";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private rootPage;
  private bookRidePage;
  private profilePage;
  private historyPage;
  private paymentMethodsPage;

  @ViewChild(BookRidePage) bookRide: BookRidePage;

  constructor(private navCtrl: NavController,
              private uberApi: UberAPI,
              public events: Events) {
    this.rootPage = BookRidePage;
    this.bookRidePage = BookRidePage;
    this.profilePage = ProfilePage;
    this.historyPage = HistoryPage;
    this.paymentMethodsPage = PaymentsMethodsPage;
  }

  ionOpened() {
    this.events.publish('menu:opened', '');
  }

  ionClosed() {
    this.events.publish('menu:closed', '');
  }

  ngAfterViewInit() {
    this.uberApi.isAuthenticated().subscribe((isAuth) => {
      if ( !isAuth) {
        this.navCtrl.setRoot(LoginPage);
        return;
      }
    });
  }

  openPage(page) {
    this.rootPage = page;
  }

  logout() {
    this.uberApi.logout().subscribe(() => {
      this.navCtrl.setRoot(LoginPage);
    });
  }

}
