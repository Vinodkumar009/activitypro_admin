import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2MemberAttendance } from './memberattendanceforgroupsession';

@NgModule({
  declarations: [
    Type2MemberAttendance,
  ],
  imports: [
    IonicPageModule.forChild(Type2MemberAttendance),
  ],
  exports: [
    Type2MemberAttendance
  ]
})
export class Type2MemberAttendanceModule {}