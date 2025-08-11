import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditperformancePage } from './editperformance';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    EditperformancePage,
   
  ],
  imports: [
    IonicPageModule.forChild(EditperformancePage),
    Ionic2RatingModule
  ],
})
export class EditperformancePageModule {}
