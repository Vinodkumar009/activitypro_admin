import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditHolidayCamp } from './editholidaycamp';
import { WheelSelector } from '@ionic-native/wheel-selector';
@NgModule({
  declarations: [
    Type2EditHolidayCamp,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditHolidayCamp),
  ],
  exports: [
    Type2EditHolidayCamp
  ],
  providers:[
    WheelSelector
  ]
})
export class Type2EditHolidayCampModule {}