import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachCreateFamilySession } from './createfamilysessioncoach';

@NgModule({
  declarations: [
    CoachCreateFamilySession,
  ],
  imports: [
    IonicPageModule.forChild(CoachCreateFamilySession),
  ],
  exports: [
    CoachCreateFamilySession
  ]
})
export class CoachCreateFamilySessionModule {}