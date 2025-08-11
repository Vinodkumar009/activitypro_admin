import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NotificationTournament } from './notificationtournament';
@NgModule({
  declarations: [
    NotificationTournament,
  ],
  imports: [
    IonicPageModule.forChild(NotificationTournament),
    HttpModule
  ],
  exports: [
    NotificationTournament
  ]
})
export class NotificationTournamnetSessionModule {}