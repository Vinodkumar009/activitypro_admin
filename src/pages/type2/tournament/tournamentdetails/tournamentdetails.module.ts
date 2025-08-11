import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TournamentDetailsPage } from './tournamentdetails';
import { CallNumber } from '@ionic-native/call-number';


@NgModule({
  declarations: [
    TournamentDetailsPage,
  ],
  providers:[CallNumber],
  imports: [
    IonicPageModule.forChild(TournamentDetailsPage),
  ],
  exports: [
    TournamentDetailsPage
  ]
})
export class TournamentDetailsPageModule {}
