import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddFamilyMember } from './addmembertofamily';

@NgModule({
  declarations: [
    Type2AddFamilyMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddFamilyMember),
  ],
  exports: [
    Type2AddFamilyMember
  ]
})
export class Type2AddFamilyMemberModule {}