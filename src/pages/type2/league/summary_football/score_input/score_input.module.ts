import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScoreInputPage } from './score_input';

@NgModule({
  declarations: [
    ScoreInputPage,
  ],
  imports: [
    IonicPageModule.forChild(ScoreInputPage),
  ],
})
export class ScoreInputPageModule { }
