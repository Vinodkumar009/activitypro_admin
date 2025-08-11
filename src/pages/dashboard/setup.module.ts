import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Setup } from './setup';

@NgModule({
  declarations: [
    Setup,
  ],
  imports: [
    IonicPageModule.forChild(Setup),
  ],
  exports: [
    Setup
  ]
})
export class SetupModule { }