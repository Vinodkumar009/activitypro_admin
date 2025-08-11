import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventdescPage } from './eventdesc';

@NgModule({
  declarations: [
    EventdescPage,
  ],
  imports: [
    IonicPageModule.forChild(EventdescPage),
  ],
})
export class EventdescPageModule {}
