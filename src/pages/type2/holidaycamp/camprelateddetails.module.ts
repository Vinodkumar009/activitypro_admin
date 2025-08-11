import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampRelatedDetailsPage } from './camprelateddetails';
// import { PaymentDetailsModal } from "./paymentdetailsmodal";

import { CallNumber } from '@ionic-native/call-number';
@NgModule({
  declarations: [CampRelatedDetailsPage],
  imports: [IonicPageModule.forChild(CampRelatedDetailsPage)],
  providers: [
    CallNumber
  ]
})
export class CampRelatedDetailsPageModule { }