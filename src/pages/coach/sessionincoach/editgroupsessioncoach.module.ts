import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachEditGroupSession } from './editgroupsessioncoach';

@NgModule({
  declarations: [
    CoachEditGroupSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachEditGroupSession),
  ],
  exports: [
    CoachEditGroupSession
  ]
})
export class CoachEditGroupSessionModule {}