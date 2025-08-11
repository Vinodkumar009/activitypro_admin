import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditGroupSessionMonthly } from './editgroupsessionmonthly';
import { WheelSelector } from '@ionic-native/wheel-selector';

@NgModule({
  declarations: [
    Type2EditGroupSessionMonthly,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditGroupSessionMonthly),
  ],
  exports: [
    Type2EditGroupSessionMonthly
  ],
  providers:[
    WheelSelector
  ]
})
export class Type2EditGroupSessionMonthlyModule {}