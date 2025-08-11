import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachManageSession } from './managesessioncoach';

@NgModule({
  declarations: [
    CoachManageSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachManageSession),
  ],
  exports: [
    CoachManageSession
  ]
})
export class CoachManageSessionModule {}