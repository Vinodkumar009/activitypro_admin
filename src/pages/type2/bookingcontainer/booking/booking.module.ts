import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingPage } from './booking';
import { CommentForEmptinessPage } from '../../commentforemptiness/commentforemptiness';
@NgModule({
  declarations: [
    BookingPage,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(BookingPage),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BookingPageModule {}
