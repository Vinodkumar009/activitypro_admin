import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LineupPage } from './lineup';
import { HttpService } from '../../../../services/http.service';

@NgModule({
    declarations: [
        LineupPage,
    ],
    imports: [
        IonicPageModule.forChild(LineupPage),
    ],
    providers: [HttpService]
})
export class LineupPageModule { }

