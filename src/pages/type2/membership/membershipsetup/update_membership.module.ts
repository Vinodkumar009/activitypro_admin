import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateMembershipPage } from './update_membership';

@NgModule({
  declarations: [
    UpdateMembershipPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateMembershipPage),
  ],
  exports: [
    UpdateMembershipPage
  ]
})
export class UpdateMembershipPageModule {}