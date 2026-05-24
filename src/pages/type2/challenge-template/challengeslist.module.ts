import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Challengeslist } from './challengeslist';

@NgModule({
  declarations: [
    Challengeslist,
  ],
  imports: [
    IonicPageModule.forChild(Challengeslist),
  ],
  exports: [
    Challengeslist
  ]
})
export class ChallengeslistPageModule {}
