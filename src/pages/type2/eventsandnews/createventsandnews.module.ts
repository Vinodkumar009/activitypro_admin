import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateventsandnewsPage } from './createventsandnews';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { ImageUploadService } from './imageupload.service';

@NgModule({
  declarations: [
    CreateventsandnewsPage,  
  ],
  imports: [
    IonicPageModule.forChild(CreateventsandnewsPage),
  ],
  providers:[Camera,File,ImageUploadService]
})
export class CreateventsandnewsPageModule {}
