import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberprofilePage } from './memberprofile';
import { CallNumber } from '@ionic-native/call-number';
@NgModule({
  declarations: [
    MemberprofilePage,
  ],
  imports: [
    IonicPageModule.forChild(MemberprofilePage),
  ],
  providers: [
    CallNumber
  ]
})
export class MemberprofilePageModule {}
