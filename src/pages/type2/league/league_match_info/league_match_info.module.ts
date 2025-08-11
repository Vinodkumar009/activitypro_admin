import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeagueMatchInfoPage } from './league_match_info';

@NgModule({
  declarations: [
    LeagueMatchInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(LeagueMatchInfoPage),
  ],
})
export class LeagueMatchInfoPageModule { }
