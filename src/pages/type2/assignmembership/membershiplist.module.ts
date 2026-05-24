import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2MembershipList } from './membershiplist';

@NgModule({
  declarations: [
    Type2MembershipList,
  ],
  imports: [
    IonicPageModule.forChild(Type2MembershipList),
  ],
  exports: [
    Type2MembershipList
  ]
})
export class Type2MembershipListModule {}