import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewappraisalPage } from './viewappraisal';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    ViewappraisalPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewappraisalPage),
    Ionic2RatingModule
  ],
})
export class ViewappraisalPageModule {}
