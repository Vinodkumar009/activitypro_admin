import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamdetailsPage } from './teamdetails';

@NgModule({
  declarations: [
    TeamdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamdetailsPage),
  ],
})
export class TeamdetailsPageModule {}
