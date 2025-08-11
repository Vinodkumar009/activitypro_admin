import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import MembershipYearPage from './membershipyear';

@NgModule({
  declarations: [
    MembershipYearPage,
  ],
  imports: [
    IonicPageModule.forChild(MembershipYearPage),
  ],
  exports: [
    MembershipYearPage,
  ]
})
export class MembershipYearPageModule {}