import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionMonthly } from './sessionmonthly';

@NgModule({
  declarations: [
    SessionMonthly,
  ],
  imports: [
    IonicPageModule.forChild(SessionMonthly),
  ],
})
export class SessionMonthlyModule {}
