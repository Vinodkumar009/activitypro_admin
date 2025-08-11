import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateFamilySession } from './createfamilysession';

@NgModule({
  declarations: [
    Type2CreateFamilySession,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateFamilySession),
  ],
  exports: [
    Type2CreateFamilySession
  ]
})
export class Type2CreateFamilySessionModule {}