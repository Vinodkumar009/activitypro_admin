import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamchatPage } from './teamchat';

@NgModule({
  declarations: [
    TeamchatPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamchatPage),
  ],
})
export class TeamchatPageModule {}
