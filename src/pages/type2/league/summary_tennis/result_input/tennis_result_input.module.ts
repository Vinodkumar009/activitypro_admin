import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisResultInputPage } from './tennis_result_input';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    TennisResultInputPage,
  ],
  imports: [
    IonicPageModule.forChild(TennisResultInputPage),
    SharedComponentsModule
  ],
})
export class TennisResultInputPageModule { }
