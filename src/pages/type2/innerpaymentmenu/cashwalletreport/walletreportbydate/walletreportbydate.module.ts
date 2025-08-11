import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletReportByDate } from './walletreportbydate';

@NgModule({
  declarations: [
    WalletReportByDate,
  ],
  imports: [
    IonicPageModule.forChild(WalletReportByDate),
  ],
  exports: [
    WalletReportByDate
  ]
})
export class WalletReportByDateModule {}