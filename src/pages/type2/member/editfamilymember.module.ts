import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditFamilyMember } from './editfamilymember';

@NgModule({
  declarations: [
    Type2EditFamilyMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditFamilyMember),
  ],
  exports: [
    Type2EditFamilyMember
  ]
})
export class Type2EditFamilyMemberModule {}