import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2BankDetailsList } from './bankdetailslist';
import { CommentForEmptinessPage } from '../commentforemptiness/commentforemptiness';

@NgModule({
  declarations: [
    Type2BankDetailsList,
   
  ],
  imports: [
    IonicPageModule.forChild(Type2BankDetailsList),
  ],
  exports: [
    Type2BankDetailsList
  ]
})
export class Type2BankDetailsListModule {}