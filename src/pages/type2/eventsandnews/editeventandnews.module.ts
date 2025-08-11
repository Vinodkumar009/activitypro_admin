import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditeventandnewsPage } from './editeventandnews';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { ImageUploadService } from './imageupload.service';
@NgModule({
  declarations: [
    EditeventandnewsPage,
  ],
  imports: [
    IonicPageModule.forChild(EditeventandnewsPage),
  ],
  providers:[Camera,File,ImageUploadService]
})
export class EditeventandnewsPageModule {}
