import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlyRecord } from './monthlyrecord';



@NgModule({
  declarations: [
    MonthlyRecord,
  ],
  imports: [
    IonicPageModule.forChild(MonthlyRecord),
  ],
  exports: [
    MonthlyRecord
  ]
})
export class MonthlyRecordModule {}