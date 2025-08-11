import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateSession } from './createsession';

@NgModule({
  declarations: [
    Type2CreateSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateSession),
  ],
  exports: [
    Type2CreateSession
  ]
})
export class Type2CreateSessionModule {}