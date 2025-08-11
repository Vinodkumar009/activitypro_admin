import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RenewalMembershipReportPage } from './renewalmembershipreport';

@NgModule({
  declarations: [
    RenewalMembershipReportPage,
  ],
  imports: [
    IonicPageModule.forChild(RenewalMembershipReportPage),
  ],
  exports: [
    RenewalMembershipReportPage
  ]
})
export class RenewalMembershipReportPageModule {}