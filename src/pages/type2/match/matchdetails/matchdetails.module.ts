import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchdetailsPage } from './matchdetails';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    MatchdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchdetailsPage),
    SharedComponentsModule
  ],
})
export class MatchdetailsPageModule {}
