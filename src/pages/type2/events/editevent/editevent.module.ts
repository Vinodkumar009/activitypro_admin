import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditeventPage } from './editevent';
import { Camera } from '@ionic-native/camera';
import { File, FileEntry } from '@ionic-native/file';
import { Chooser } from '@ionic-native/chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
@NgModule({
  declarations: [
    EditeventPage,
  ],
  imports: [
    IonicPageModule.forChild(EditeventPage),
  ],
  providers:[Camera,File,Chooser,FileOpener,FileTransfer]
})
export class EditeventPageModule {}
