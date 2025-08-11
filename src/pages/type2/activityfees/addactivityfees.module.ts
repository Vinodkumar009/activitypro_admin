import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddActivityFeesList } from './addactivityfees';

@NgModule({
  declarations: [
    Type2AddActivityFeesList,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddActivityFeesList),
  ],
  exports: [
    Type2AddActivityFeesList
  ]
})
export class Type2AddActivityFeesListModule {}