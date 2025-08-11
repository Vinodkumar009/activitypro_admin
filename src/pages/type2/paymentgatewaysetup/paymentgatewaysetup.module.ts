import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentgatewaysetupPage } from './paymentgatewaysetup';

@NgModule({
  declarations: [
    PaymentgatewaysetupPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentgatewaysetupPage),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PaymentgatewaysetupPageModule {}
