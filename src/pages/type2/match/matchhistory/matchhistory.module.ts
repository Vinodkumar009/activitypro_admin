import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchhistoryPage } from './matchhistory';

@NgModule({
  declarations: [
    MatchhistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchhistoryPage),
  ],
})
export class MatchhistoryPageModule {}
