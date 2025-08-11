import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';


import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HelpSupportEmailPage } from './helpsupportemail';
import { Http } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [HelpSupportEmailPage],
  imports: [ HttpClientModule,IonicPageModule.forChild(HelpSupportEmailPage)],
   providers: [FirebaseService,CommonService, SharedServices ],
})
export class HelpSupportEmailPageModule {}