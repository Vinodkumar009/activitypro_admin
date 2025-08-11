import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PublishFootballPage } from './publish_football';

@NgModule({
  declarations: [
    PublishFootballPage,
  ],
  imports: [
    IonicPageModule.forChild(PublishFootballPage),
  ],
})
export class PublishFootballPageModule { }
