import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateCopySession } from './createcopysession';

@NgModule({
  declarations: [
    CreateCopySession,
  ],
  imports: [
    IonicPageModule.forChild(CreateCopySession),
  ],
  exports: [
    CreateCopySession
  ]
})
export class CreateCopySessionModule {}