import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateTournamentPage } from './createtournament';


@NgModule({
  declarations: [
    CreateTournamentPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateTournamentPage),
  ],
  exports: [
    CreateTournamentPage
  ]
})
export class CreateTournamentPageModule {}
