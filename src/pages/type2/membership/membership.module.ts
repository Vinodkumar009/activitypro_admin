import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MembershipPage } from './membership';

@NgModule({
  declarations: [
    MembershipPage,
  ],
  imports: [
    IonicPageModule.forChild(MembershipPage),
  ],
  exports: [
    MembershipPage
  ]
})
export class MembershipPageModule {}