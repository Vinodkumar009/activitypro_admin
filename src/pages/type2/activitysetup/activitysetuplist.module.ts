import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ActivitySetupList } from './activitysetuplist';

@NgModule({
  declarations: [
    Type2ActivitySetupList,
  ],
  imports: [
    IonicPageModule.forChild(Type2ActivitySetupList),
  ],
  exports: [
    Type2ActivitySetupList
  ]
})
export class Type2ActivitySetupListModule {}