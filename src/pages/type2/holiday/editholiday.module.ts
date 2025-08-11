import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditHoliday } from './editholiday';

@NgModule({
  declarations: [
    Type2EditHoliday,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditHoliday),
  ],
  exports: [
    Type2EditHoliday
  ]
})
export class Type2EditHolidayModule {}