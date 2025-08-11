import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateSchoolSession } from './createschoolsession';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
@NgModule({
  declarations: [
    Type2CreateSchoolSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateSchoolSession),
    SharedmoduleModule
  ],
  exports: [
    Type2CreateSchoolSession
  ]
})
export class Type2CreateSchoolSessionModule {}