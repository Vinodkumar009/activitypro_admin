import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RenewalMembershipPrintPage } from './renewalmembershipprint';


@NgModule({
  declarations: [
    RenewalMembershipPrintPage,
  ],
  imports: [
    IonicPageModule.forChild(RenewalMembershipPrintPage),
  ],
  exports: [
    RenewalMembershipPrintPage
  ]
})
export class RenewalMembershipPrintPageModule {}