import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMorePhotosPage } from './addmorephotos';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { ImageUploadService } from '../imageupload.service';
@NgModule({
  declarations: [
    AddMorePhotosPage,
  ],
  imports: [
    IonicPageModule.forChild(AddMorePhotosPage),
  ],
  providers:[Camera,File,ImageUploadService]
})
export class AddMorePhotosPageModule {}
