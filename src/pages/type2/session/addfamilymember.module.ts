import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMemberFamilySession } from './addfamilymember';

@NgModule({
  declarations: [
    Type2AddMemberFamilySession,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMemberFamilySession),
  ],
  exports: [
    Type2AddMemberFamilySession
  ]
})
export class Type2AddMemberFamilySessionModule {}