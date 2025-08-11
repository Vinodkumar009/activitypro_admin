import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Report } from './report';

@NgModule({
  declarations: [
    Type2Report,
  ],
  imports: [
    IonicPageModule.forChild(Type2Report),
  ],
  exports: [
    Type2Report
  ]
})
export class Type2ReportModule {}