import { NgModule } from '@angular/core';
import { IonicPageModule, FabContainer } from 'ionic-angular';
import { GroupsessiondetailsPage } from './groupsessiondetails';
import { CallNumber } from '@ionic-native/call-number';
@NgModule({
  declarations: [
    GroupsessiondetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupsessiondetailsPage),
  ],providers:[
    CallNumber,
    FabContainer
  ]
})
export class GroupsessiondetailsPageModule {}
