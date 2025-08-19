import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisPotmPage } from './tennis_potm';

@NgModule({
  declarations: [
    TennisPotmPage,
  ],
  imports: [
    IonicPageModule.forChild(TennisPotmPage),
  ],
})
export class TennisPotmPageModule { }