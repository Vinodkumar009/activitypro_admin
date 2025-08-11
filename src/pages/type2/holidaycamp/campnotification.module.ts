import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampNotification } from './campnotification';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    CampNotification,
  ],
  imports: [
    IonicPageModule.forChild(CampNotification),
    HttpModule
  ],
  exports: [
    CampNotification
  ]
})
export class CampNotificationModule {}