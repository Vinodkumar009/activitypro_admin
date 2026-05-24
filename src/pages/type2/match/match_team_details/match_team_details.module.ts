import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchTeamDetailsPage } from './match_team_details';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    MatchTeamDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchTeamDetailsPage),
    SharedComponentsModule
  ],
})
export class MatchTeamDetailsPageModule { }
