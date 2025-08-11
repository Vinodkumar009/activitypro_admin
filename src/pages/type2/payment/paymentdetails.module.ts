import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentDetails } from './paymentdetails';

@NgModule({
  declarations: [
    PaymentDetails,
  ],
  imports: [
    IonicPageModule.forChild(PaymentDetails),
  ],
  exports: [
    PaymentDetails
  ]
})
export class PaymentDetailsModule {}