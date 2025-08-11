import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlyMembershipSetupPage } from './monthlymembershipsetup';

@NgModule({
  declarations: [
    MonthlyMembershipSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(MonthlyMembershipSetupPage),
  ],
 
})
export class MonthlyMembershipSetupPageModule {}
