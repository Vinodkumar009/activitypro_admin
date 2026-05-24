import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssignChallenge } from './assignchallenge';

@NgModule({
  declarations: [
    AssignChallenge,
  ],
  imports: [
    IonicPageModule.forChild(AssignChallenge),
  ],
})
export class AssignChallengeModule {}
