import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CopyCamp } from './copycamp';
import { WheelSelector } from '@ionic-native/wheel-selector';
@NgModule({
  declarations: [
    Type2CopyCamp,
  ],
  imports: [
    IonicPageModule.forChild(Type2CopyCamp),
  ],
  providers:[
    WheelSelector
  ]
})
export class CopycampPageModule {}
