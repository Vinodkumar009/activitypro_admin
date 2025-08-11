import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateHolidayCampPaymentDetails } from './updateholidaycamppaymentdetails';

@NgModule({
  declarations: [
    UpdateHolidayCampPaymentDetails,
  ],
  imports: [
    IonicPageModule.forChild(UpdateHolidayCampPaymentDetails),
  ],
  exports: [
    UpdateHolidayCampPaymentDetails
  ]
})
export class UpdateHolidayCampPaymentDetailsModule {}