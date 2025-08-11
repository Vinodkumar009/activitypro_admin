import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VideomenueslistingPage } from './videomenueslisting';
import { HttpModule } from '@angular/http';
import { SocialSharing } from '@ionic-native/social-sharing';
@NgModule({
  declarations: [
    VideomenueslistingPage
  ],
  imports: [
    IonicPageModule.forChild(VideomenueslistingPage),
    HttpModule
  ],
  providers:[SocialSharing]
})
export class VideomenueslistingPageModule {}
