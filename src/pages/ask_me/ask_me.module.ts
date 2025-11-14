import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AskMePage } from './ask_me';

@NgModule({
  declarations: [
    AskMePage,
  ],
  imports: [
    IonicPageModule.forChild(AskMePage),
  ],
})
export class AskMePageModule { }
