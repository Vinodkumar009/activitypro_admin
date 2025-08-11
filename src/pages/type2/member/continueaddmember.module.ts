import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ContinueAddMember } from './continueaddmember';

@NgModule({
  declarations: [
    Type2ContinueAddMember,
  ],
  imports: [
    IonicPageModule.forChild(Type2ContinueAddMember),
  ],
  exports: [
    Type2ContinueAddMember
  ]
})
export class Type2ContinueAddMemberModule {}