import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TournamentSheetPage } from './tournamentsheet';


@NgModule({
    declarations: [
        TournamentSheetPage,
    ],
    imports: [
        IonicPageModule.forChild(TournamentSheetPage),
    ],
    exports: [
        TournamentSheetPage
    ]
})
export class TournamentSheetPageModule { }
