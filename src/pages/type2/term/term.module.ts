import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Term } from './term';

@NgModule({
  declarations: [
    Type2Term,
  ],
  imports: [
    IonicPageModule.forChild(Type2Term),
  ],
  exports: [
    Type2Term
  ]
})
export class Type2TermModule {}