import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { RecurringBookingDetail } from './recurringbookingdetail';
@NgModule({
  declarations: [
    RecurringBookingDetail,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(RecurringBookingDetail),
  ],
  providers: [
    CallNumber
  ]

})
export class ActiveBookingDetailModule {

  
}
