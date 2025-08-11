import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Payment } from './payment';

@NgModule({
  declarations: [
    Payment,
  ],
  imports: [
    IonicPageModule.forChild(Payment),
  ],
  exports: [
    Payment
  ]
})
export class PaymentModule {}