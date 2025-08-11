import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthsListModal } from './monthslistmodal';


@NgModule({
  declarations: [
    MonthsListModal,
  ],
  imports: [
    IonicPageModule.forChild(MonthsListModal),
  ],
  exports: [
    MonthsListModal
  ]
})
export class membershipMemberListingModule {}