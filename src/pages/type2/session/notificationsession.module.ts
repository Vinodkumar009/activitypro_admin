import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2NotificationSession } from './notificationsession';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Type2NotificationSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2NotificationSession),
    HttpModule
  ],
  exports: [
    Type2NotificationSession
  ]
})
export class Type2NotificationSessionModule {}