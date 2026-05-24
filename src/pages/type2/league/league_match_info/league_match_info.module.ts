import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeagueMatchInfoPage } from './league_match_info';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    LeagueMatchInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(LeagueMatchInfoPage),
    SharedComponentsModule
  ],
})
export class LeagueMatchInfoPageModule { }
