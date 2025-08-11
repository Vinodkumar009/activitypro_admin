import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocationsetupPage } from './locationsetup';

@NgModule({
  declarations: [
    LocationsetupPage,
  ],
  imports: [
    IonicPageModule.forChild(LocationsetupPage),
  ],
  exports: [
    LocationsetupPage
  ]
})
export class LocationsetupPageModule {}
