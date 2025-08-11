import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachNotification } from './notificationcoach';
import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    CoachNotification,
  ],
  imports: [
    IonicPageModule.forChild(CoachNotification),
    HttpModule
  ],
  exports: [
    CoachNotification
  ]
})
export class CoachNotificationModule {}