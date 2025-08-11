import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchdetailsPage } from './matchdetails';

@NgModule({
  declarations: [
    MatchdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchdetailsPage),
  ],
})
export class MatchdetailsPageModule {}
