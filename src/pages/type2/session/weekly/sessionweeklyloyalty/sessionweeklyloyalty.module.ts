import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionWeeklyLoyalty } from './sessionweeklyloyalty';


@NgModule({
  declarations: [
    SessionWeeklyLoyalty,
  ],   
  imports: [
    IonicPageModule.forChild(SessionWeeklyLoyalty),
  ],
  exports: [
    SessionWeeklyLoyalty
  ]
})
export class SessionWeeklyLoyaltyModule {}