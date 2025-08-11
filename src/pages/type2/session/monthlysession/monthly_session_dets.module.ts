import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlySessionDetails } from './monthly_session_dets';
import { CallNumber } from '@ionic-native/call-number';
@NgModule({
  declarations: [
    MonthlySessionDetails,
  ],
  imports: [
    IonicPageModule.forChild(MonthlySessionDetails),
  ],
  providers:[CallNumber]
})
export class MonthlySessionDetailsModule {}
