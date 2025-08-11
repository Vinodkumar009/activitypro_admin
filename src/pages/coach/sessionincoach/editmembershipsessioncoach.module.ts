import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachEditMembershipSession } from './editmembershipsessioncoach';
import { CallNumber } from '@ionic-native/call-number';

@NgModule({
  declarations: [
    CoachEditMembershipSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachEditMembershipSession),
  ],
  exports: [
    CoachEditMembershipSession
  ],
  providers:[
    CallNumber
  ],
})
export class CoachEditMembershipSessionModule {}