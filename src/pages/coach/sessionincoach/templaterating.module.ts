import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TemplateratingPage } from './templaterating';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    TemplateratingPage,
  ],
  imports: [
    IonicPageModule.forChild(TemplateratingPage),
    Ionic2RatingModule
  ],
})
export class TemplateratingPageModule {}
