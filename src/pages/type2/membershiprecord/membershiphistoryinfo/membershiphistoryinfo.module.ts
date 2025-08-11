import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { membershipHistoryInfo } from './membershiphistoryinfo';



@NgModule({
  declarations: [
    membershipHistoryInfo,
  ],
  imports: [
    IonicPageModule.forChild(membershipHistoryInfo),
  ],
  exports: [
    membershipHistoryInfo
  ]
})
export class membershipHistoryInfoModule {}