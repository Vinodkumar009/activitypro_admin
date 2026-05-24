import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisSummaryTennisPage } from './tennis_summary_tennis';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    TennisSummaryTennisPage,
  ],
  imports: [
    IonicPageModule.forChild(TennisSummaryTennisPage),
    SharedComponentsModule
  ],
})
export class TennisSummaryTennisPageModule { }
