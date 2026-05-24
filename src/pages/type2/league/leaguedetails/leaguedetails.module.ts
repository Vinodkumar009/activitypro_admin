import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeaguedetailsPage } from './leaguedetails';
import { ThemeService } from '../../../../services/theme.service';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    LeaguedetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(LeaguedetailsPage),
    SharedComponentsModule
  ],
  providers: [ThemeService],
})
export class LeaguedetailsPageModule {}
