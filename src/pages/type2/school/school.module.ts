import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2School } from './school';

@NgModule({
  declarations: [
    Type2School,
  ],
  imports: [
    IonicPageModule.forChild(Type2School),
  ],
  exports: [
    Type2School
  ]
})
export class Type2SchoolModule {}