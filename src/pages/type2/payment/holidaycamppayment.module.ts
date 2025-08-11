import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HolidayCampPayment } from './holidaycamppayment';

@NgModule({
  declarations: [
    HolidayCampPayment,
  ],
  imports: [
    IonicPageModule.forChild(HolidayCampPayment),
  ],
  exports: [
    HolidayCampPayment
  ]
})
export class HolidayCampPaymentModule {}