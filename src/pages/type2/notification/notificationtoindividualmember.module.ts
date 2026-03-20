import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2NotificationToIndividualMember } from './notificationtoindividualmember';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Type2NotificationToIndividualMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2NotificationToIndividualMember),
    HttpModule
  ],
  exports: [
    Type2NotificationToIndividualMember
  ]
})
export class Type2NotificationToIndividualMemberModule {}