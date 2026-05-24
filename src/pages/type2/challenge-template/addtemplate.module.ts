import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddtemplatePage } from './addtemplate';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
@NgModule({
  declarations: [
    AddtemplatePage,
  ],
  imports: [
    IonicPageModule.forChild(AddtemplatePage),
  ],
  providers:[FirebaseService,CommonService]
})
export class AddtemplatePageModule {}
