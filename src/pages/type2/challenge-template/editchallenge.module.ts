import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Editchallenge } from './editchallenge';
import { Camera } from '@ionic-native/camera';
@NgModule({
  declarations: [
    Editchallenge,
  ],
  imports: [
    IonicPageModule.forChild(Editchallenge),
  ],
  providers:[Camera]
})
export class EditchallengePageModule {}
