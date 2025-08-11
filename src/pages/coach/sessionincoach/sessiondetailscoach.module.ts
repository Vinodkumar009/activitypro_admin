import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachSessionDetails } from './sessiondetailscoach';

@NgModule({
  declarations: [
    CoachSessionDetails,
  ],
  imports: [
    IonicPageModule.forChild(CoachSessionDetails),
  ],
  exports: [
    CoachSessionDetails
  ]
})
export class CoachSessionDetailsModule {}