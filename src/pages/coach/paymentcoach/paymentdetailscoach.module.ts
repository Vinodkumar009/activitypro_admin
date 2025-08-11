import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachPaymentDetails } from './paymentdetailscoach';

@NgModule({
  declarations: [
    CoachPaymentDetails,
  ],
  imports: [
    IonicPageModule.forChild(CoachPaymentDetails),
  ],
  exports: [
    CoachPaymentDetails
  ]
})
export class CoachPaymentDetailsModule {}