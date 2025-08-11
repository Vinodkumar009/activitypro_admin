import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import MembershipDiscountPage from './membershipdiscount';

@NgModule({
  declarations: [
    MembershipDiscountPage,
  ],
  imports: [
    IonicPageModule.forChild(MembershipDiscountPage),
  ],
  exports: [
    MembershipDiscountPage,
  ]
})
export class MembershipDiscountPageModule {}