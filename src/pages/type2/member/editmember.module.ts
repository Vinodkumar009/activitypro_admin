import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditMember } from './editmember';

@NgModule({
  declarations: [
    Type2EditMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditMember),
  ],
  exports: [
    Type2EditMember
  ]
})
export class Type2EditMemberModule {}