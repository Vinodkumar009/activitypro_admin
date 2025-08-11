import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateteamPage } from './createteam';
import { TeamImageUploadService } from '../team_image_upload/team_image_upload.service';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';


@NgModule({
  declarations: [
    CreateteamPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateteamPage),
  ],
  providers: [TeamImageUploadService, Camera, File]
})
export class CreateteamPageModule { }
