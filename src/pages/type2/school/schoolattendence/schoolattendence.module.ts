import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchoolattendencePage } from './schoolattendence';

@NgModule({
  declarations: [
    SchoolattendencePage,
  ],
  imports: [
    IonicPageModule.forChild(SchoolattendencePage),
  ],
})
export class SchoolattendencePageModule {}
