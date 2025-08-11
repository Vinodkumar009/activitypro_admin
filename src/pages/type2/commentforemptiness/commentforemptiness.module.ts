import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CommentForEmptinessPage } from './commentforemptiness';
import { NO_ERRORS_SCHEMA } from '@angular/compiler/src/core';

@NgModule({
  declarations: [
    CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentForEmptinessPage),
  ],
 
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CommentForEmptinessPageModule {}