import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsPage } from './events';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
@NgModule({
  declarations: [
    EventsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventsPage),
    SharedmoduleModule
  ],
})
export class EventsPageModule {}
