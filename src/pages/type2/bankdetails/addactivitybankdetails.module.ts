import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddActivityBankDetails } from './addactivitybankdetails';

@NgModule({
  declarations: [
    Type2AddActivityBankDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddActivityBankDetails),
  ],
  exports: [
    Type2AddActivityBankDetails
  ]
})
export class Type2AddActivityBankDetailsModule {}