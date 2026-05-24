import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FloodLightListPage } from './floodlightlist';

@NgModule({
  declarations: [
    FloodLightListPage,
    //CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(FloodLightListPage),
  ],
})
export class FloodLightPageModule {}
