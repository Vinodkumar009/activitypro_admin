import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { HelpSupportPage } from './helpsupport';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';

@NgModule({
  declarations: [HelpSupportPage],
  imports: [IonicPageModule.forChild(HelpSupportPage)],
   providers: [FirebaseService,CommonService,SharedServices, ],
})
export class HelpSupportPageModule { }