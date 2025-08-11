import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlySessionReport } from './monthlysesreport';


@NgModule({
  declarations: [
    MonthlySessionReport,
  ],
  imports: [
    IonicPageModule.forChild(MonthlySessionReport),
  ],
  exports: [
    MonthlySessionReport
  ]
})
export class MonthlySessionReportModule {}