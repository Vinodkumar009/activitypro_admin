import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashWalletReport } from './cashwalletreport';

@NgModule({
  declarations: [
    CashWalletReport,
  ],
  imports: [
    IonicPageModule.forChild(CashWalletReport),
  ],
  exports: [
    CashWalletReport
  ]
})
export class CashWalletReportModule {}