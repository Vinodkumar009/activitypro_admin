import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeagueladderPage } from './leagueladder';

@NgModule({
  declarations: [
    LeagueladderPage,
  ],
  imports: [
    IonicPageModule.forChild(LeagueladderPage),
  ],
})
export class LeagueladderPageModule {}
