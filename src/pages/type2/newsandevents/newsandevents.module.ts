import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2NewsEvents } from './newsandevents';

@NgModule({
  declarations: [
    Type2NewsEvents,
  ],
  imports: [
    IonicPageModule.forChild(Type2NewsEvents),
  ],
  exports: [
    Type2NewsEvents
  ]
})
export class Type2NewsEventsModule {}