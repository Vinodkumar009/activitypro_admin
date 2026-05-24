import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { AddstafftoteamPage } from './addstafftoteam';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    AddstafftoteamPage,
  ],
  imports: [
    IonicPageModule.forChild(AddstafftoteamPage),
    SharedComponentsModule
  ],
  providers:[
    CommonService,
    FirebaseService
  ]
})
export class AddstafftoteamPageModule {}
