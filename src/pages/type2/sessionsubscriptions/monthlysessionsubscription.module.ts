import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlySessionSubscription } from './monthlysessionsubscription';

@NgModule({
  declarations: [
    MonthlySessionSubscription,
  ],
  imports: [
    IonicPageModule.forChild(MonthlySessionSubscription),
  ],
})
export class MonthlySessionSubscriptionPageModule {}
