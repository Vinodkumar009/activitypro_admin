import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMemberHolidayCamp } from './addmembertocamp';

@NgModule({
  declarations: [
    Type2AddMemberHolidayCamp,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMemberHolidayCamp),
  ],
  exports: [
    Type2AddMemberHolidayCamp
  ]
})
export class Type2AddMemberHolidayCampModule {}