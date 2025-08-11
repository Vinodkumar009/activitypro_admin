import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Userchallenges } from './userchallenges';

@NgModule({
  declarations: [
    Userchallenges,
  ],
  imports: [
    IonicPageModule.forChild(Userchallenges),
  ],
})
export class UserchallengesPageModule {}
