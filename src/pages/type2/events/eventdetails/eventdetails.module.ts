import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventdetailsPage } from './eventdetails';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File, FileEntry } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { Camera } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { EventImageUploadService } from '../imageupload/eventimageupload.service';

@NgModule({
  declarations: [
    EventdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventdetailsPage),
  ],
  providers:[Camera,InAppBrowser, File, FileOpener, FileTransfer,EventImageUploadService]
})
export class EventdetailsPageModule {}
