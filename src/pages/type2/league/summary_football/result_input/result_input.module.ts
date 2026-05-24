import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultInputPage } from './result_input';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    ResultInputPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultInputPage),
    SharedComponentsModule
  ],
})
export class ScoreInputPageModule { }
