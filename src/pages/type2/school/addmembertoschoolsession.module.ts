import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMemberSchoolSession } from './addmembertoschoolsession';

@NgModule({
  declarations: [
    Type2AddMemberSchoolSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMemberSchoolSession),
  ],
  exports: [
    Type2AddMemberSchoolSession
  ]
})
export class Type2AddMemberSchoolSessionModule {}