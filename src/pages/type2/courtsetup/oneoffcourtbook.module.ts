import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2OneoffCourtBook } from './oneoffcourtbook';

@NgModule({
  declarations: [
    Type2OneoffCourtBook,
  ],
  imports: [
    IonicPageModule.forChild(Type2OneoffCourtBook),
  ],
  exports: [
    Type2OneoffCourtBook
  ]
})
export class Type2OneoffCourtBookModule {}