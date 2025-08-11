import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachProfile } from './coachprofile';
import { CoachProfileDetailsModule } from './coachprofiledetail.module';
@NgModule({
  declarations: [
    CoachProfile,
  ],
  imports: [
    IonicPageModule.forChild(CoachProfile),
    CoachProfileDetailsModule
  ],
  exports: [
    CoachProfile
  ]
})
export class CoachProfileModule {}