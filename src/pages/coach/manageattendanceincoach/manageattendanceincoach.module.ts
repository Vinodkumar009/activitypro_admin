import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachManageAttendance } from './manageattendanceincoach';

@NgModule({
  declarations: [
    CoachManageAttendance,
  ],
  imports: [
    IonicPageModule.forChild(CoachManageAttendance),
  ],
  exports: [
    CoachManageAttendance
  ]
})
export class CoachManageAttendanceModule {}