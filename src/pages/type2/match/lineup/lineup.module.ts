import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LineupPage } from './lineup';
import { HttpService } from '../../../../services/http.service';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
    declarations: [
        LineupPage,
    ],
    imports: [
        IonicPageModule.forChild(LineupPage),
        SharedComponentsModule,
    ],
    providers: [HttpService]
})
export class LineupPageModule { }

