import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PaymentDetailsForWeekly } from './updatepaymentsforweekly';


@NgModule({
  declarations: [
    Type2PaymentDetailsForWeekly,
  ],
  imports: [
    IonicPageModule.forChild(Type2PaymentDetailsForWeekly),
  ],
  exports: [
    Type2PaymentDetailsForWeekly
  ]
})
export class Type2PaymentDetailsForWeeklyModule {}