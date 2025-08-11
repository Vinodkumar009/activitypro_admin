import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EmailSetupList } from './emailsetuplist';
import { CommentForEmptinessPage } from '../commentforemptiness/commentforemptiness';

@NgModule({
  declarations: [
    Type2EmailSetupList,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(Type2EmailSetupList),
  ],
  exports: [
    Type2EmailSetupList
  ]
})
export class Type2EmailSetupListModule {}