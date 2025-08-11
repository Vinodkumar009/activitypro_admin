import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { AssignmembershipsPage } from './assignmemberships';
@NgModule({
  declarations: [
    AssignmembershipsPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignmembershipsPage),
  ],
  providers: [
    CallNumber
  ]
})
export class ShowmembershipPageModule {}
