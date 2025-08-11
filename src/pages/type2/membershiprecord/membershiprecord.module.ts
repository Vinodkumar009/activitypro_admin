import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MembershipRecord } from './membershiprecord';

@NgModule({
  declarations: [
    MembershipRecord,
  ],
  imports: [
    IonicPageModule.forChild(MembershipRecord),
  ],
  exports: [
    MembershipRecord
  ]
})
export class MembershipRecordPageModule {}