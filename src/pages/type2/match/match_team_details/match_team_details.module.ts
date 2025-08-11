import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchTeamDetailsPage } from './match_team_details';

@NgModule({
  declarations: [
    MatchTeamDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchTeamDetailsPage),
  ],
})
export class MatchTeamDetailsPageModule { }
