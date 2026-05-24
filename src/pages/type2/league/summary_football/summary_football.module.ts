import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SummaryFootballPage } from './summary_football';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    SummaryFootballPage,
  ],
  imports: [
    IonicPageModule.forChild(SummaryFootballPage),
    SharedComponentsModule
  ],
})
export class SummaryFootballPageModule { }
