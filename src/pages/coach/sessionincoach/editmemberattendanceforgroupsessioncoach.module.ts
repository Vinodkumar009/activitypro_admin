import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachEditMemberAttendance } from './editmemberattendanceforgroupsessioncoach';

@NgModule({
  declarations: [
    CoachEditMemberAttendance,
  ],
  imports: [
    IonicPageModule.forChild(CoachEditMemberAttendance),
  ],
  exports: [
    CoachEditMemberAttendance
  ]
})
export class CoachEditMemberAttendanceModule {}