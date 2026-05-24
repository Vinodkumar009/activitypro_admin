import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Appimage } from './appimage';
import { Camera } from '@ionic-native/camera';
@NgModule({
  declarations: [
    Appimage,
  ],
  imports: [
    IonicPageModule.forChild(Appimage),
  ],
  providers:[Camera]
})
export class AppimagePageModule {}
