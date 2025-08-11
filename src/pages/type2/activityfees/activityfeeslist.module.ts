import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ActivityFeesList } from './activityfeeslist';

@NgModule({
  declarations: [
    Type2ActivityFeesList,
  ],
  imports: [
    IonicPageModule.forChild(Type2ActivityFeesList),
  ],
  exports: [
    Type2ActivityFeesList
  ]
})
export class Type2ActivityFeesListModule {}