import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachPayment } from './paymentcoach';

@NgModule({
  declarations: [
    CoachPayment,
  ],
  imports: [
    IonicPageModule.forChild(CoachPayment),
  ],
  exports: [
    CoachPayment
  ]
})
export class CoachPaymentModule {}