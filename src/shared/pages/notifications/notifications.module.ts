import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationsPage } from './notifications';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    NotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationsPage),
    HttpModule
  ],
  exports: [
    NotificationsPage
  ]
})
export class NotificationsPageModule {}
