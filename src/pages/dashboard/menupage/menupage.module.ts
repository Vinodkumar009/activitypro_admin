import { NgModule } from '@angular/core';
import { IonicPageModule, IonicModule } from 'ionic-angular';


import { MenupagePage } from './menupage';

@NgModule({
  declarations: [
    MenupagePage,
  ],
  imports: [
    IonicPageModule.forChild( MenupagePage),
  ],
  exports: [
    MenupagePage
  ]
})
export class  MenupagePageModule {}