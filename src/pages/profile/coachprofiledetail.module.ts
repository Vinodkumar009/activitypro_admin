import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachProfileDetails } from './coachprofiledetail';

@NgModule({
  declarations: [
    CoachProfileDetails,
  ],
  imports: [
    IonicPageModule.forChild(CoachProfileDetails),
  ],
  exports: [
    CoachProfileDetails
  ]
})
export class CoachProfileDetailsModule {}