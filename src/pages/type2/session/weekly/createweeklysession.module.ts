import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateweeklysessionPage } from './createweeklysession';
import { WheelSelector } from '@ionic-native/wheel-selector';
@NgModule({
  declarations: [
    CreateweeklysessionPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateweeklysessionPage),
  ],
  providers:[
    WheelSelector
  ]
})
export class CreateweeklysessionPageModule {}
