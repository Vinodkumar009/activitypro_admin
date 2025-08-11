import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachCreateSession } from './createsessioncoach';

@NgModule({
  declarations: [
    CoachCreateSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachCreateSession),
  ],
  exports: [
    CoachCreateSession
  ]
})
export class CoachCreateSessionModule {}