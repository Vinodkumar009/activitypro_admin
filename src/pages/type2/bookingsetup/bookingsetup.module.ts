import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingsetupPage } from './bookingsetup';
import { CommentForEmptinessPage } from '../commentforemptiness/commentforemptiness';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
@NgModule({
  declarations: [
    BookingsetupPage,
    //CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(BookingsetupPage),
    SharedmoduleModule
  ],
})
export class BookingsetupPageModule {}
