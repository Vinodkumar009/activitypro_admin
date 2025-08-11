import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddHoliday } from './addholiday';

@NgModule({
  declarations: [
    Type2AddHoliday,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddHoliday),
  ],
  exports: [
    Type2AddHoliday
  ]
})
export class Type2AddHolidayModule {}