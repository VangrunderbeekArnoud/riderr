import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { BookRidePage } from "../pages/book-ride/book-ride";
import { AutoCompletePage } from "../pages/auto-complete/auto-complete";
import { ProfilePage } from "../pages/profile/profile";
import { HistoryPage } from "../pages/history/history";
import { PaymentMethodsPage } from "../pages/payment-methods/payment-methods";

import { UberAPI } from "../services/uber.services";
import { IonicStorageModule } from "@ionic/storage";
import { Diagnostic } from '@ionic-native/diagnostic';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    BookRidePage,
    AutoCompletePage,
    ProfilePage,
    HistoryPage,
    PaymentMethodsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    BookRidePage,
    AutoCompletePage,
    ProfilePage,
    HistoryPage,
    PaymentMethodsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UberAPI,
    Storage,
    Diagnostic,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
