import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AssignMembership } from './assignmembership';

@NgModule({
  declarations: [
    Type2AssignMembership,
  ],
  imports: [
    IonicPageModule.forChild(Type2AssignMembership),
  ],
  exports: [
    Type2AssignMembership
  ]
})
export class Type2AssignMembershipModule {}