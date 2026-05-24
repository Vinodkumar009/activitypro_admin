import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Createchallenge } from './createchallenge';
import { Camera } from '@ionic-native/camera';
@NgModule({
  declarations: [
    Createchallenge,
  ],
  imports: [
    IonicPageModule.forChild(Createchallenge),
  ],
  providers:[Camera]
})
export class CreatechallengePageModule {}
