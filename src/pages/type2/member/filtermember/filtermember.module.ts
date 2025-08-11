import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FiltermemberPage } from './filtermember';

@NgModule({
  declarations: [
    FiltermemberPage,
  ],
  imports: [
    IonicPageModule.forChild(FiltermemberPage),
  ],
})
export class FiltermemberPageModule {}
