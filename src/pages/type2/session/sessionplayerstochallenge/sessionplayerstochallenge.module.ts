import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionPlayerstoChallenge } from './sessionplayerstochallenge';


@NgModule({
  declarations: [
    SessionPlayerstoChallenge,
  ],
  imports: [
    IonicPageModule.forChild(SessionPlayerstoChallenge),
  ],
  exports: [
    SessionPlayerstoChallenge
  ]
})
export class SessionPlayerstoChallengeModule {}