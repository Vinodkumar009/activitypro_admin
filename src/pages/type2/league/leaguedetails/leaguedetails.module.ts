import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeaguedetailsPage } from './leaguedetails';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    LeaguedetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(LeaguedetailsPage),
  ],
  providers: [ThemeService],
})
export class LeaguedetailsPageModule {}
