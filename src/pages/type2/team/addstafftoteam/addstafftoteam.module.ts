import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { AddstafftoteamPage } from './addstafftoteam';

@NgModule({
  declarations: [
    AddstafftoteamPage,
  ],
  imports: [
    IonicPageModule.forChild(AddstafftoteamPage),
  ],
  providers:[
    CommonService,
    FirebaseService
  ]
})
export class AddstafftoteamPageModule {}
