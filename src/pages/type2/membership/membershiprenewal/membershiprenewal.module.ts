import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import MembershipRenewalPage from './membershiprenewal';

@NgModule({
  declarations: [
    MembershipRenewalPage,
  ],
  imports: [
    IonicPageModule.forChild(MembershipRenewalPage),
  ],
  exports: [
    MembershipRenewalPage,
  ]
})
export class MembershipRenewalPageModule {}