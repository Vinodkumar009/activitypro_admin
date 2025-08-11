import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampReportPrint } from './campprint';

@NgModule({
  declarations: [
    CampReportPrint,
  ],
  imports: [
    IonicPageModule.forChild(CampReportPrint),
  ],
})
export class CampReportPrintPageModule {}
