import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditTemplatePage } from './editTemplate';

@NgModule({
  declarations: [
    EditTemplatePage,
  ],
  imports: [
    IonicPageModule.forChild(EditTemplatePage),
  ],
})
export class EditTemplatePageModule {}
