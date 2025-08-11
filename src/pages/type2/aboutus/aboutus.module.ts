import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { AboutUsPage } from './aboutus';
import { InAppBrowser } from '@ionic-native/in-app-browser';
@NgModule({
  declarations: [AboutUsPage],
  imports: [IonicPageModule.forChild(AboutUsPage)],
  providers: [FirebaseService,CommonService,SharedServices,InAppBrowser ],
})
export class AboutUsPageModule { }