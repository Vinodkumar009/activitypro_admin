import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoweventsandnewsPage } from './showeventsandnews';
import { SocialSharing } from '@ionic-native/social-sharing';
@NgModule({
  declarations: [
    ShoweventsandnewsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShoweventsandnewsPage),
  ],
  providers:[SocialSharing]
})
export class ShoweventsandnewsPageModule {}
