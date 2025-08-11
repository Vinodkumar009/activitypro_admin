import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberWalletReport } from './memberwalletreport';

@NgModule({
  declarations: [
    MemberWalletReport,
  ],
  imports: [
    IonicPageModule.forChild(MemberWalletReport),
  ],
  exports: [
    MemberWalletReport
  ]
})
export class MemberWalletReportModule {}