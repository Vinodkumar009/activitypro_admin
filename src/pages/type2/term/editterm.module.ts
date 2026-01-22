import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EdiTterm } from './editterm';

@NgModule({
  declarations: [
    Type2EdiTterm,
  ],
  imports: [
    IonicPageModule.forChild(Type2EdiTterm),
  ],
  exports: [
    Type2EdiTterm
  ]
})
export class Type2EdiTtermModule {}