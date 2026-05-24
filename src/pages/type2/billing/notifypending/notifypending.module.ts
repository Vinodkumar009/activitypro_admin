import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NotifyPendingPage } from './notifypending';
@NgModule({
  declarations: [
    NotifyPendingPage,
  ],
  imports: [
    IonicPageModule.forChild(NotifyPendingPage),
    HttpModule
  ],
  exports: [
    NotifyPendingPage
  ]
})
export class NotifyPendingPageModule { }