import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdatePayment } from './updatepayment';




@NgModule({
  declarations: [
    UpdatePayment,
  ],
  imports: [
    IonicPageModule.forChild(UpdatePayment),
  ],
  exports: [
    UpdatePayment
  ]
})
export class UpdatePaymentModule {}