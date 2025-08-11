import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TemplatelistPage } from './templatelist';

@NgModule({
  declarations: [
    TemplatelistPage,
  ],
  imports: [
    IonicPageModule.forChild(TemplatelistPage),
  ],
})
export class TemplatelistPageModule {}
