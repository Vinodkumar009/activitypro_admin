import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisResultInputPage } from './result_input';

@NgModule({
    declarations: [
        TennisResultInputPage,
    ],
    imports: [
        IonicPageModule.forChild(TennisResultInputPage),
    ],
})
export class TennisResultInputPageModule { }