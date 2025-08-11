import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ManageAttendance } from './manageattendance';

@NgModule({
  declarations: [
    Type2ManageAttendance,
  ],
  imports: [
    IonicPageModule.forChild(Type2ManageAttendance),
  ],
  exports: [
    Type2ManageAttendance
  ]
})
export class Type2ManageAttendanceModule {}