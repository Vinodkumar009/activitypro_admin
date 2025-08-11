import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Fixpage } from './fixes';

@NgModule({
  declarations: [
    Fixpage,
  ],
  imports: [
    IonicPageModule.forChild(Fixpage),
  ],
  exports: [
    Fixpage
  ]
})
export class FixpageModule {}