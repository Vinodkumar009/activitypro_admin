import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { ActiveBookingDetail } from './activebookingdetail';

@NgModule({
  declarations: [
    ActiveBookingDetail,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(ActiveBookingDetail),
  ],
  providers: [
    CallNumber
  ]

})
export class ActiveBookingDetailModule {

  
}
