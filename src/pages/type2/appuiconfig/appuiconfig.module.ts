import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppuIconfig } from './appuiconfig';

@NgModule({
  declarations: [
    AppuIconfig,
  ],
  imports: [
    IonicPageModule.forChild(AppuIconfig),
  ],
  exports: [
    AppuIconfig
  ]
})
export class AppuiconfigPageModule {}
