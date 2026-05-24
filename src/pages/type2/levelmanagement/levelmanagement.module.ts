import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LevelmanagementPage } from './levelmanagement';

@NgModule({
  declarations: [
    LevelmanagementPage,
  ],
  imports: [
    IonicPageModule.forChild(LevelmanagementPage),
  ],
})
export class LevelmanagementPageModule {}
