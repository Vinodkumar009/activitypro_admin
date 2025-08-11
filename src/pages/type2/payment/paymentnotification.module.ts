import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PaymentNotification } from './paymentnotification';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Type2PaymentNotification,
  ],
  imports: [
    IonicPageModule.forChild(Type2PaymentNotification),
    HttpModule
  ],
  exports: [
    Type2PaymentNotification
  ]
})
export class Type2PaymentNotificationModule {}