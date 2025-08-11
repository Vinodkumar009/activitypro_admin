import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditMembershipSession } from './editmembershipsession';

@NgModule({
  declarations: [
    Type2EditMembershipSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditMembershipSession),
  ],
  exports: [
    Type2EditMembershipSession
  ]
})
export class Type2EditMembershipSessionModule {}