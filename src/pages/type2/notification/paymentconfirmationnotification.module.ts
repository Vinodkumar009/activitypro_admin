import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PaymentConfirmationNotification } from './paymentconfirmationnotification';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Type2PaymentConfirmationNotification,
  ],
  imports: [
    IonicPageModule.forChild(Type2PaymentConfirmationNotification),
    HttpModule
  ],
  exports: [
    Type2PaymentConfirmationNotification
  ]
})
export class Type2PaymentConfirmationNotificationModule {}