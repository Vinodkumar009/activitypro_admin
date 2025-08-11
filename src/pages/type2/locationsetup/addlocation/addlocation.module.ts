import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddlocationPage } from './addlocation';


@NgModule({
  declarations: [
    AddlocationPage,
  ],
  imports: [
    IonicPageModule.forChild(AddlocationPage),
  ],
  exports: [
    AddlocationPage
  ]
})
export class LocationsetupPageModule {}
