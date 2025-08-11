import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MailToMemberByAdminPage } from './mailtomemberbyadmin';

import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    MailToMemberByAdminPage,
  ],
  imports: [
    IonicPageModule.forChild(MailToMemberByAdminPage),
    HttpModule
  ],
  exports: [
    MailToMemberByAdminPage
  ]
})
export class MailToMemberByAdminPageModule {}