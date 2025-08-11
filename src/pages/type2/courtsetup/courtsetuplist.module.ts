import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtSetupList } from './courtsetuplist';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
@NgModule({
  declarations: [
    Type2CourtSetupList,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtSetupList),
    SharedmoduleModule
  ],
  exports: [
    Type2CourtSetupList
  ]
})
export class Type2CourtSetupListModule {}