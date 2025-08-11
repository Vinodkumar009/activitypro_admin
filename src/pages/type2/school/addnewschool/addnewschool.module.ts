import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddnewSchool } from './addnewschool';

@NgModule({
  declarations: [
    AddnewSchool,
  ],
  imports: [
    IonicPageModule.forChild(AddnewSchool),
  ],
  exports: [
    AddnewSchool
  ]
})
export class AddnewSchoolModule {}