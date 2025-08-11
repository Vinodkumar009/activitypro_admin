import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Leaderboardlist } from './leaderboardlist';

@NgModule({
  declarations: [
    Leaderboardlist,
  ],
  imports: [
    IonicPageModule.forChild(Leaderboardlist),
  ],
})
export class LeaderboardlistPageModule {}
