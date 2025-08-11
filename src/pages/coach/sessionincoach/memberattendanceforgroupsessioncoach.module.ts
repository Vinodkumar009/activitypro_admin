import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachMemberAttendance } from './memberattendanceforgroupsessioncoach';

@NgModule({
  declarations: [
    CoachMemberAttendance,
  ],
  imports: [
    IonicPageModule.forChild(CoachMemberAttendance),
  ],
  exports: [
    CoachMemberAttendance
  ]
})
export class CoachMemberAttendanceModule {}