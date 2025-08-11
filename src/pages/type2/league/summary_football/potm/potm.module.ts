import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PotmPage } from './potm';

@NgModule({
  declarations: [
    PotmPage,
  ],
  imports: [
    IonicPageModule.forChild(PotmPage),
  ],
})
export class PotmPageModule { }
