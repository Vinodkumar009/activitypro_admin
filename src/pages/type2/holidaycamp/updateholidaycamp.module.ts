import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2UpdateHolidayCamp } from './updateholidaycamp';

@NgModule({
  declarations: [
    Type2UpdateHolidayCamp,
  ],
  imports: [
    IonicPageModule.forChild(Type2UpdateHolidayCamp),
  ],
  exports: [
    Type2UpdateHolidayCamp
  ]
})
export class Type2UpdateHolidayCampModule {}