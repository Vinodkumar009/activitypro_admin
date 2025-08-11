import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Apollo } from 'apollo-angular';
import { ChallengeDetails } from './challengedetails';
@NgModule({
  declarations: [
    ChallengeDetails,
  ],
  imports: [
    IonicPageModule.forChild(ChallengeDetails),
  ],
  providers:[Apollo]
})
export class ChallengeDetailsModule {}
