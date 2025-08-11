import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HolidayCampMembers } from './holidaycampmembers';

@NgModule({
  declarations: [
    HolidayCampMembers,
  ],
  imports: [
    IonicPageModule.forChild(HolidayCampMembers),
  ],
  exports: [
    HolidayCampMembers
  ]
})
export class HolidayCampMembersModule {}