import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachNotificationSession } from './notificationsessioncoach';
import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    CoachNotificationSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachNotificationSession),
    HttpModule
  ],
  exports: [
    CoachNotificationSession
  ]
})
export class CoachNotificationSessionModule {}