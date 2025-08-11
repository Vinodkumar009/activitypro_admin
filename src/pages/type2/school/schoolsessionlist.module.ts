import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2SchoolSessionList } from './schoolsessionlist';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
@NgModule({
  declarations: [
    Type2SchoolSessionList,
  ],
  imports: [
    IonicPageModule.forChild(Type2SchoolSessionList),
    SharedmoduleModule
  ],
  exports: [
    Type2SchoolSessionList
  ], 
})
export class Type2SchoolSessionListModule {}