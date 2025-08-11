import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AgecategoryPage } from './agecategory';

@NgModule({
  declarations: [
    AgecategoryPage,
  ],
  imports: [
    IonicPageModule.forChild(AgecategoryPage),
  ],
})
export class AgecategoryPageModule {}
