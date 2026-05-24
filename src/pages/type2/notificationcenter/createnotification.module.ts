import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateNotification } from './createnotification';
@NgModule({
  declarations: [CreateNotification],
  imports: [IonicPageModule.forChild(CreateNotification)],
})
export class CreateNotificationModule { }