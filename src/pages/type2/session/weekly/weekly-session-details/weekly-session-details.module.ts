import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WeeklySessionDetailsPage } from './weekly-session-details';

@NgModule({
  declarations: [
    WeeklySessionDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(WeeklySessionDetailsPage),
  ],
})
export class WeeklySessionDetailsPageModule {}
