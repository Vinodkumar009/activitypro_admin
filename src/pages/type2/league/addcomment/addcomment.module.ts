import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddcommentPage } from './addcomment';

@NgModule({
  declarations: [
    AddcommentPage,
  ],
  imports: [
    IonicPageModule.forChild(AddcommentPage),
  ],
})
export class AddcommentPageModule {}
