import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamdetailsPage } from './teamdetails';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    TeamdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamdetailsPage),
    SharedComponentsModule
  ],
})
export class TeamdetailsPageModule {}
