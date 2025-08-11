import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2SelectCoachLevel } from './selectcoachlevel';

@NgModule({
  declarations: [
    Type2SelectCoachLevel,
  ],
  imports: [
    IonicPageModule.forChild(Type2SelectCoachLevel),
  ],
  exports: [
    Type2SelectCoachLevel
  ]
})
export class Type2SelectCoachLevelModule {}