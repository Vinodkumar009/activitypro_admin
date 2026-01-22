import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddTerm } from './addterm';

@NgModule({
  declarations: [
    Type2AddTerm,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddTerm),
  ],
  exports: [
    Type2AddTerm
  ]
})
export class Type2AddTermModule {}