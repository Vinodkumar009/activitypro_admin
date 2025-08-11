import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Venue } from './venue';

@NgModule({
  declarations: [
    Type2Venue,
  ],
  imports: [
    IonicPageModule.forChild(Type2Venue),
  ],
  exports: [
    Type2Venue
  ]
})
export class Type2VenueModule {}