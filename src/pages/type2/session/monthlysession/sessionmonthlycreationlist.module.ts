import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionMonthlyCreationList } from './sessionmonthlycreationlist';

@NgModule({
  declarations: [
    SessionMonthlyCreationList,
  ],
  imports: [
    IonicPageModule.forChild(SessionMonthlyCreationList),
  ],
})
export class SessionMonthlyCreationListModule {}
