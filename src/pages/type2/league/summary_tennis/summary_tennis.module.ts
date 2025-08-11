import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SummaryTennisPage } from './summary_tennis';

@NgModule({
    declarations: [
        SummaryTennisPage,
    ],
    imports: [
        IonicPageModule.forChild(SummaryTennisPage),
    ],
})
export class SummaryTennisPageModule { }