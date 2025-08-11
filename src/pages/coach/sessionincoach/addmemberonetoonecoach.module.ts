import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachAddMemberOneToOneSession } from './addmemberonetoonecoach';

@NgModule({
  declarations: [
    CoachAddMemberOneToOneSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachAddMemberOneToOneSession),
  ],
  exports: [
    CoachAddMemberOneToOneSession
  ]
})
export class CoachAddMemberOneToOneSessionModule {}