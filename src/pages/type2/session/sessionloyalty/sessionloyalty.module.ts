import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionLoyalty } from './sessionloyalty';


@NgModule({
  declarations: [
    SessionLoyalty,
  ],
  imports: [
    IonicPageModule.forChild(SessionLoyalty),
  ],
  exports: [
    SessionLoyalty
  ]
})
export class SessionLoyaltyModule {}