import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditteamPage } from './editteam';
import { TeamImageUploadService } from '../../team/team_image_upload/team_image_upload.service';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    EditteamPage,
  ],
  imports: [
    IonicPageModule.forChild(EditteamPage),
  ],
  providers: [TeamImageUploadService, Camera, File]
})
export class EditteamPageModule { }
