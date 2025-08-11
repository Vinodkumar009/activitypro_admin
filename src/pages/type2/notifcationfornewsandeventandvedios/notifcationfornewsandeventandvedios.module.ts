import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotifcationfornewsandeventandvediosPage } from './notifcationfornewsandeventandvedios';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    NotifcationfornewsandeventandvediosPage,
  ],
  imports: [
    IonicPageModule.forChild(NotifcationfornewsandeventandvediosPage),
    HttpModule
  ],
})
export class NotifcationfornewsandeventandvediosPageModule {}
