import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssignActivityPage } from './assignactivity';



@NgModule({
  declarations: [
    AssignActivityPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignActivityPage),
  ],
  exports: [
    AssignActivityPage
  ]
})
export class Type2EditVenueModule {}