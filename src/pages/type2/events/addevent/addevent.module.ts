import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddeventPage } from './addevent';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Chooser } from '@ionic-native/chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { EventImageUploadService } from '../imageupload/eventimageupload.service';
@NgModule({
  declarations: [
    AddeventPage,
  ],
  imports: [
    IonicPageModule.forChild(AddeventPage),
  ],
  providers:[EventImageUploadService,Camera,File,Chooser,FileOpener,FileTransfer]
})
export class AddeventPageModule {}




