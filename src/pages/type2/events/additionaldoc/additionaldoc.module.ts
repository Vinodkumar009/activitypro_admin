import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdditionaldocPage } from './additionaldoc';
import { Camera } from '@ionic-native/camera';
import { Chooser } from '@ionic-native/chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer } from '@ionic-native/file-transfer';

@NgModule({
  declarations: [
    AdditionaldocPage,
  ],
  imports: [
    IonicPageModule.forChild(AdditionaldocPage),
  ],
  providers:[Camera,File,Chooser,FileOpener,FileTransfer]
})
export class AdditionaldocPageModule {}
