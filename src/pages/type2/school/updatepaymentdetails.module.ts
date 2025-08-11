import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdatePaymentDetails } from './updatepaymentdetails';

@NgModule({
  declarations: [
    UpdatePaymentDetails,
  ],
  imports: [
    IonicPageModule.forChild(UpdatePaymentDetails),
  ],
  exports: [
    UpdatePaymentDetails
  ]
})
export class UpdatePaymentDetailsModule {}