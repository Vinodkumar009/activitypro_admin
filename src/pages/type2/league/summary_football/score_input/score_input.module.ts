import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScoreInputPage } from './score_input';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    ScoreInputPage,
  ],
  imports: [
    IonicPageModule.forChild(ScoreInputPage),
    SharedComponentsModule
  ],
})
export class ScoreInputPageModule { }
