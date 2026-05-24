import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2MembershipConfigList } from './membershipconfiglist';

@NgModule({
  declarations: [
    Type2MembershipConfigList,
  ],
  imports: [
    IonicPageModule.forChild(Type2MembershipConfigList),
  ],
  exports: [
    Type2MembershipConfigList
  ]
})
export class Type2MembershipConfigListModule {}