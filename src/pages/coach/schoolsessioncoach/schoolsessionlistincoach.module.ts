import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachSchoolSessionList } from './schoolsessionlistincoach';

@NgModule({
  declarations: [
    CoachSchoolSessionList,
  ],
  imports: [
    IonicPageModule.forChild(CoachSchoolSessionList),
  ],
  exports: [
    CoachSchoolSessionList
  ]
})
export class CoachSchoolSessionListModule {}