import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachPaymentDetailsForGroup } from './updatepaymentdetailsforgroupcoach';

@NgModule({
  declarations: [
    CoachPaymentDetailsForGroup,
  ],
  imports: [
    IonicPageModule.forChild(CoachPaymentDetailsForGroup),
  ],
  exports: [
    CoachPaymentDetailsForGroup
  ]
})
export class CoachPaymentDetailsForGroupModule {}