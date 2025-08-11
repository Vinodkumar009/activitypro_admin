import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMembershipSession } from './addmembershipsession';

@NgModule({
  declarations: [
    Type2AddMembershipSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMembershipSession),
  ],
  exports: [
    Type2AddMembershipSession
  ]
})
export class Type2AddMembershipSessionModule {}