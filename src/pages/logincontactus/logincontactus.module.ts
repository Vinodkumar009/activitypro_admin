import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginContactUs } from './logincontactus';

@NgModule({
  declarations: [
    LoginContactUs,
  ],
  imports: [
    IonicPageModule.forChild(LoginContactUs),
  ],
  exports: [
    LoginContactUs
  ]
})
export class LoginContactUsModule { }