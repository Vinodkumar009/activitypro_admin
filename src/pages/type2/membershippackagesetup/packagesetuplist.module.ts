import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2MembershipPackageList } from './packagesetuplist';

@NgModule({
  declarations: [
    Type2MembershipPackageList,
  ],
  imports: [
    IonicPageModule.forChild(Type2MembershipPackageList),
  ],
  exports: [
    Type2MembershipPackageList
  ]
})
export class Type2MembershipPackageListModule {}