import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { AddMemberTournament } from './addmembertournament';
@NgModule({
    declarations: [
        AddMemberTournament,
    ],
    imports: [
        IonicPageModule.forChild(AddMemberTournament),
        HttpModule
    ],
    exports: [
        AddMemberTournament
    ]
})
export class NotificationTournamnetSessionModule { }