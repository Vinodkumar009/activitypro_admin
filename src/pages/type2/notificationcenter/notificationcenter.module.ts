import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationCenter } from './notificationcenter';
@NgModule({
  declarations: [NotificationCenter],
  imports: [IonicPageModule.forChild(NotificationCenter)],
})
export class NotificationCenterModule { }