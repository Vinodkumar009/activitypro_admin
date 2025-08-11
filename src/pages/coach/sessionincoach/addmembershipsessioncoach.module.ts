import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachAddMembershipSession } from './addmembershipsessioncoach';

@NgModule({
  declarations: [
    CoachAddMembershipSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachAddMembershipSession),
  ],
  exports: [
    CoachAddMembershipSession
  ]
})
export class CoachAddMembershipSessionModule {}