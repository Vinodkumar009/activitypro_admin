import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddNewVenue } from './addnewvenue';


@NgModule({
  declarations: [
    AddNewVenue,
  ],
  imports: [
    IonicPageModule.forChild(AddNewVenue),
  ],
  exports: [
    AddNewVenue
  ]
})
export class Type2EditVenueModule {}