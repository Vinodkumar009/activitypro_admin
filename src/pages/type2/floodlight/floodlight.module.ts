import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FloodLightPage } from './floodlight';
@NgModule({
  declarations: [
    FloodLightPage,
    //CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(FloodLightPage),
  ],
})
export class FloodLightPageModule {}
