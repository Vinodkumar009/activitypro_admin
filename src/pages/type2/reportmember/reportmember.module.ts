import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ReportMember } from './reportmember';

@NgModule({
  declarations: [
    Type2ReportMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2ReportMember),
  ],
  exports: [
    Type2ReportMember
  ]
})
export class Type2ReportMemberModule {}