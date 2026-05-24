import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StaffattendancePage } from './staffattendance';

@NgModule({
  declarations: [
    StaffattendancePage,
  ],
  imports: [
    IonicPageModule.forChild(StaffattendancePage),
  ],
})
export class StaffattendancePageModule {}
