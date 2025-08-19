import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisSummaryTennisPage } from './tennis_summary_tennis';

@NgModule({
  declarations: [
    TennisSummaryTennisPage,
  ],
  imports: [
    IonicPageModule.forChild(TennisSummaryTennisPage),
  ],
})
export class TennisSummaryTennisPageModule { }