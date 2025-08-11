import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingTermSessionsPage } from './pending-term-sessions';

@NgModule({
  declarations: [
    PendingTermSessionsPage,
  ],
  imports: [
    IonicPageModule.forChild(PendingTermSessionsPage),
  ],
})
export class PendingTermSessionsPageModule {}
