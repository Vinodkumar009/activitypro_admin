import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMemberOneToOneSession } from './addmemberonetoone';

@NgModule({
  declarations: [
    Type2AddMemberOneToOneSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMemberOneToOneSession),
  ],
  exports: [
    Type2AddMemberOneToOneSession
  ]
})
export class Type2AddMemberOneToOneSessionModule {}