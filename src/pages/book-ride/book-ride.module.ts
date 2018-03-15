import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookRidePage } from './book-ride';

@NgModule({
  declarations: [
    BookRidePage,
  ],
  imports: [
    IonicPageModule.forChild(BookRidePage),
  ],
})
export class BookRidePageModule {}
