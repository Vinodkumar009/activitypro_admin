import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ReportSession } from './reportsession';

@NgModule({
  declarations: [
    Type2ReportSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2ReportSession),
  ],
  exports: [
    Type2ReportSession
  ]
})
export class Type2ReportSessionModule {}