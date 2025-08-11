import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Communication_Session } from './communication_session';

@NgModule({
  declarations: [
    Communication_Session,
  ],
  imports: [
    IonicPageModule.forChild(Communication_Session),
  ],
  exports: [
    Communication_Session
  ]
})
export class Communication_SessionModule {}