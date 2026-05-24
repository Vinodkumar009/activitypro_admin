import { NgModule } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { IonicPageModule } from 'ionic-angular';
import { Createtip } from './createtip';

@NgModule({
  declarations: [
    Createtip,
  ],
  imports: [
    IonicPageModule.forChild(Createtip),
  ],
  providers:[Camera]
})
export class CreatetipModule {}
