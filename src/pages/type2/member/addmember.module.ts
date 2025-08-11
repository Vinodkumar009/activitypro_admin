import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMember } from './addmember';

@NgModule({
  declarations: [
    Type2AddMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMember),
  ],
  exports: [
    Type2AddMember
  ]
})
export class Type2AddMemberModule {}