import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachSession } from './sessioncoach';

@NgModule({
  declarations: [
    CoachSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachSession),
  ],
  exports: [
    CoachSession
  ]
})
export class CoachSessionModule {}