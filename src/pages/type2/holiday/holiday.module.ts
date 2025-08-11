import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Holiday } from './holiday';

@NgModule({
  declarations: [
    Type2Holiday,
  ],
  imports: [
    IonicPageModule.forChild(Type2Holiday),
  ],
  exports: [
    Type2Holiday
  ]
})
export class Type2HolidayModule {}