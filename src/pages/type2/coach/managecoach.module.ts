import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ManageCoach } from './managecoach';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
@NgModule({
  declarations: [
    Type2ManageCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2ManageCoach),
  ],
  exports: [
    Type2ManageCoach
  ],
  providers:[Camera,File]
})
export class Type2ManageCoachModule {}