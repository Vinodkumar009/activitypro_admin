import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisScoreInputPage } from './score_input';

@NgModule({
    declarations: [
        TennisScoreInputPage,
    ],
    imports: [
        IonicPageModule.forChild(TennisScoreInputPage),
    ],
})
export class TennisScoreInputPageModule { }