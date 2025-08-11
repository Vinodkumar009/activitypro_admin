import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HolidayCampPaymentDetails } from './holidaycamppaymentdetails';

@NgModule({
  declarations: [
    HolidayCampPaymentDetails,
  ],
  imports: [
    IonicPageModule.forChild(HolidayCampPaymentDetails),
  ],
  exports: [
    HolidayCampPaymentDetails
  ]
})
export class HolidayCampPaymentDetailsModule {}