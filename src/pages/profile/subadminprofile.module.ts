import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubAdminProfile } from './subadminprofile';

@NgModule({
  declarations: [
    SubAdminProfile,
  ],
  imports: [
    IonicPageModule.forChild(SubAdminProfile),
  ],
  exports: [
    SubAdminProfile
  ]
})
export class ProfileModule { }