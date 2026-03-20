import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2SchoolSessionNotifications } from './schoolsessionnotification';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Type2SchoolSessionNotifications,
  ],
  imports: [
    IonicPageModule.forChild(Type2SchoolSessionNotifications),
    HttpModule
  ],
  exports: [
    Type2SchoolSessionNotifications
  ]
})
export class Type2SchoolSessionNotificationsModule {}