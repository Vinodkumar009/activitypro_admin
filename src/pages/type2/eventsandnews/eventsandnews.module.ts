import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsandnewsPage } from './eventsandnews';
import { HttpModule } from '@angular/http';
import { SocialSharing } from '@ionic-native/social-sharing';
@NgModule({
  declarations: [
    EventsandnewsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventsandnewsPage),
    HttpModule
  ],
  providers:[SocialSharing]
})
export class EventsandnewsPageModule {}
