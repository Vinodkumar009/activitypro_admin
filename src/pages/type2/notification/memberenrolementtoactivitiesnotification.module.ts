import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2MemberEnrolementToActivitiesNotification } from './memberenrolementtoactivitiesnotification';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Type2MemberEnrolementToActivitiesNotification,
  ],
  imports: [
    IonicPageModule.forChild(Type2MemberEnrolementToActivitiesNotification),
    HttpModule
  ],
  exports: [
    Type2MemberEnrolementToActivitiesNotification
  ]
})
export class Type2MemberEnrolementToActivitiesNotificationModule {}