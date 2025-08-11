import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PaymentDetailsForGroup } from './updatepaymentdetailsforgroup';

@NgModule({
  declarations: [
    Type2PaymentDetailsForGroup,
  ],
  imports: [
    IonicPageModule.forChild(Type2PaymentDetailsForGroup),
  ],
  exports: [
    Type2PaymentDetailsForGroup
  ]
})
export class Type2PaymentDetailsForGroupModule {}