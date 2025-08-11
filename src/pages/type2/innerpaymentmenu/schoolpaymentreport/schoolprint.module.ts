import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchoolReportPrint } from './schoolprint';

@NgModule({
  declarations: [
    SchoolReportPrint,
  ],
  imports: [
    IonicPageModule.forChild(SchoolReportPrint),
  ],
})
export class SchoolReportPrintPageModule {}
