import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamchatconversationPage } from './teamchatconversation';

@NgModule({
  declarations: [
    TeamchatconversationPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamchatconversationPage),
  ],
})
export class TeamchatconversationPageModule {}
