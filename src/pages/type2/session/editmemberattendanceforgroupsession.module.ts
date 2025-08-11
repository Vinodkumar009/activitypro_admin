import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditMemberAttendance } from './editmemberattendanceforgroupsession';

@NgModule({
  declarations: [
    Type2EditMemberAttendance,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditMemberAttendance),
  ],
  exports: [
    Type2EditMemberAttendance
  ]
})
export class Type2EditMemberAttendanceModule {}