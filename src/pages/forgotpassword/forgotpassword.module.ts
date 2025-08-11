import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ForgotPassword } from './forgotpassword';

@NgModule({
  declarations: [
    ForgotPassword,
  ],
  imports: [
    IonicPageModule.forChild(ForgotPassword),
  ],
  exports: [
    ForgotPassword
  ]
})
export class ForgotPasswordModule { }