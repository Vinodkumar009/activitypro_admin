import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MembershipSetupPage } from './membershipsetup';

@NgModule({
  declarations: [
    MembershipSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(MembershipSetupPage),
  ],
  exports: [
    MembershipSetupPage
  ]
})
export class MembershipSetupPageModule {}