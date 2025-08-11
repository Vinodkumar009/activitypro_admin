import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateHolidayCamp } from './createholidaycamp';
import { WheelSelector } from '@ionic-native/wheel-selector';

@NgModule({
  declarations: [
    Type2CreateHolidayCamp,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateHolidayCamp),
  ],
  exports: [
    Type2CreateHolidayCamp
  ],
  providers:[
    WheelSelector
  ]
})
export class Type2CreateHolidayCampModule {}