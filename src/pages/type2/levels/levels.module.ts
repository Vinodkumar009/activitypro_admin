import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LevelsPage } from './levels';

@NgModule({
  declarations: [
    LevelsPage,
  ],
  imports: [
    IonicPageModule.forChild(LevelsPage),
  ],
})
export class LevelsPageModule {}
