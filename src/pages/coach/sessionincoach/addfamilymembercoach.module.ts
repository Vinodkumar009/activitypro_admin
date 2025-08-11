import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachAddMemberFamilySession } from './addfamilymembercoach';

@NgModule({
  declarations: [
    CoachAddMemberFamilySession,
  ],
  imports: [
    IonicPageModule.forChild(CoachAddMemberFamilySession),
  ],
  exports: [
    CoachAddMemberFamilySession
  ]
})
export class CoachAddMemberFamilySessionModule {}