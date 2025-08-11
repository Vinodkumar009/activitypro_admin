import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachMember } from './membercoach';

import { CallNumber } from '@ionic-native/call-number';
@NgModule({
  declarations: [
    CoachMember,
  ],
  imports: [
    IonicPageModule.forChild(CoachMember),
  ],
  exports: [
    CoachMember
  ],
   providers: [
    CallNumber
  ]
})
export class CoachMemberModule {}