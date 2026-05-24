import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMembershipBankDetails } from './addmembershipbankdetails';

@NgModule({
  declarations: [
    Type2AddMembershipBankDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMembershipBankDetails),
  ],
  exports: [
    Type2AddMembershipBankDetails
  ]
})
export class Type2AddMembershipBankDetailsModule {}