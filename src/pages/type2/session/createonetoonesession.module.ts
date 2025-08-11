import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateOneToOneSession } from './createonetoonesession';

@NgModule({
  declarations: [
    Type2CreateOneToOneSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateOneToOneSession),
  ],
  exports: [
    Type2CreateOneToOneSession
  ]
})
export class Type2CreateOneToOneSessionModule {}