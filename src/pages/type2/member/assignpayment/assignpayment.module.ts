import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { AssignPaymentPage } from './assignpayment';

@NgModule({
  declarations: [
    AssignPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignPaymentPage),
  ],
  providers: [
    CallNumber
  ]
})
export class AssignPaymentPageModule {}
