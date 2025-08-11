import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { membershipPaymentSetupPage } from './membershippaymentsetup';


@NgModule({
  declarations: [
    membershipPaymentSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(membershipPaymentSetupPage),
  ],
  exports: [
    membershipPaymentSetupPage
  ]
})
export class membershipPaymentSetupPageModule { }