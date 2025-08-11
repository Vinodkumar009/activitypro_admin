import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2VenueAssignCoach } from './venueassigntocoach';

@NgModule({
  declarations: [
    Type2VenueAssignCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2VenueAssignCoach),
  ],
  exports: [
    Type2VenueAssignCoach
  ]
})
export class Type2VenueAssignCoachModule {}