import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditGroupSession } from './editgroupsession';

@NgModule({
  declarations: [
    Type2EditGroupSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditGroupSession),
  ],
  exports: [
    Type2EditGroupSession
  ]
})
export class Type2EditGroupSessionModule {}