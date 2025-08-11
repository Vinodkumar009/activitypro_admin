import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeleteVenue } from './deletevenue';

@NgModule({
  declarations: [
    DeleteVenue,
  ],
  imports: [
    IonicPageModule.forChild(DeleteVenue),
  ],
  exports: [
    DeleteVenue
  ]
})
export class Type2VenueModule {}