import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditweeklysessionPage } from './editweeklysession';
import { WheelSelector } from '@ionic-native/wheel-selector';
@NgModule({
  declarations: [
    EditweeklysessionPage,
  ],
  imports: [
    IonicPageModule.forChild(EditweeklysessionPage),
  ],
  providers:[
    WheelSelector
  ]
})
export class EditweeklysessionPageModule {}
