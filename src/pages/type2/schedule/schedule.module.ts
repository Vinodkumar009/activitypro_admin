import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Schedule } from './schedule';

@NgModule({
  declarations: [
    Type2Schedule,
  ],
  imports: [
    IonicPageModule.forChild(Type2Schedule),
  ],
  exports: [
    Type2Schedule
  ]
})
export class Type2ScheduleModule {}