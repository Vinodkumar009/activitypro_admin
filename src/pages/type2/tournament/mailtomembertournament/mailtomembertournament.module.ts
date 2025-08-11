import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MailToMemberTournament } from './mailtomembertournament';
@NgModule({
  declarations: [
    MailToMemberTournament,
  ],
  imports: [
    IonicPageModule.forChild(MailToMemberTournament),
    HttpModule
  ],
  exports: [
    MailToMemberTournament
  ]
})
export class MailToMemberTournamentModule {}