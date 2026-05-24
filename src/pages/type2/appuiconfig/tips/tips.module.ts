import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TipsPage } from './tips';

@NgModule({
  declarations: [
    TipsPage,
  ],
  imports: [
    IonicPageModule.forChild(TipsPage),
  ],
})
export class TipsPageModule {}
