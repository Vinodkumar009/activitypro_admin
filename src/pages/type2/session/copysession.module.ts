import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CopySession } from './copysession';

@NgModule({
  declarations: [
    CopySession,
  ],
  imports: [
    IonicPageModule.forChild(CopySession),
  ],
  exports: [
    CopySession
  ]
})
export class CopySessionModule {}