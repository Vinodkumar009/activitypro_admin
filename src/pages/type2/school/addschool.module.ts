import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddSchool } from './addschool';

@NgModule({
  declarations: [
    Type2AddSchool,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddSchool),
  ],
  exports: [
    Type2AddSchool
  ]
})
export class Type2AddSchoolModule {}