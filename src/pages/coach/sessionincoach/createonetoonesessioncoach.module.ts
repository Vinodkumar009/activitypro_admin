import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachCreateOneToOneSession } from './createonetoonesessioncoach';

@NgModule({
  declarations: [
    CoachCreateOneToOneSession,
  ],
  imports: [
    IonicPageModule.forChild(CoachCreateOneToOneSession),
  ],
  exports: [
    CoachCreateOneToOneSession
  ]
})
export class CoachCreateOneToOneSessionModule {}