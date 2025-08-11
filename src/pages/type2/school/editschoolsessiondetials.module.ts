import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditSchoolSessionDetails } from './editschoolsessiondetials';

@NgModule({
  declarations: [
    Type2EditSchoolSessionDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditSchoolSessionDetails),
  ],
  exports: [
    Type2EditSchoolSessionDetails
  ]
})
export class Type2EditSchoolSessionDetailsModule {}