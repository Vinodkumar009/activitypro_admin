import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { ShowmembershipPage } from './showmembership';
@NgModule({
  declarations: [
    ShowmembershipPage,
  ],
  imports: [
    IonicPageModule.forChild(ShowmembershipPage),
  ],
  providers: [
    CallNumber
  ]
})
export class ShowmembershipPageModule {}
