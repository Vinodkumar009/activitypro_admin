import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlysessionPage } from './createmonthlysession';

import { WheelSelector } from '@ionic-native/wheel-selector';
@NgModule({
  declarations: [
    MonthlysessionPage,
  ],
  imports: [
    IonicPageModule.forChild(MonthlysessionPage),
  ],
  providers:[
    WheelSelector
  ]
})
export class MonthlysessionPageModule {}
