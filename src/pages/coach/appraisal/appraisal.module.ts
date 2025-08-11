import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppraisalPage } from './appraisal';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    AppraisalPage,
  ],
  imports: [
    IonicPageModule.forChild(AppraisalPage),
    Ionic2RatingModule
  ],
})
export class AppraisalPageModule {}
