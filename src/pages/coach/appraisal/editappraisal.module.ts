import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditappraisalPage } from './editappraisal';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    EditappraisalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditappraisalPage),
    Ionic2RatingModule,
  ],
})
export class EditappraisalPageModule {}
