import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationDetails } from './notificationdetails';
// import { PaymentDetailsModal } from "./paymentdetailsmodal";

@NgModule({
  declarations: [NotificationDetails],
  imports: [IonicPageModule.forChild(NotificationDetails)],
})
export class NotificationDetailsModule { }