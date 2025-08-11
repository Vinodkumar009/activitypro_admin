import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Apollo } from 'apollo-angular';
import { HttpClientModule } from '@angular/common/http';
import { PerformanceReport } from './performancereport';
@NgModule({
  declarations: [
    PerformanceReport,
  ],
  imports: [
    IonicPageModule.forChild(PerformanceReport),
    HttpClientModule,
  ],
  providers:[Apollo]
})
export class PerformanceReportModule {}
