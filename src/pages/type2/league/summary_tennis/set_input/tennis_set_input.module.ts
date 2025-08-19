import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisSetInputPage } from './tennis_set_input';

@NgModule({
  declarations: [
    TennisSetInputPage,
  ],
  imports: [
    IonicPageModule.forChild(TennisSetInputPage),
  ],
})
export class TennisSetInputPageModule { }