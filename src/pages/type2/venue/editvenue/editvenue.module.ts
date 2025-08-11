import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditVenue } from './editvenue';


@NgModule({
  declarations: [
    Type2EditVenue,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditVenue),
  ],
  exports: [
    Type2EditVenue
  ]
})
export class Type2EditVenueModule {}