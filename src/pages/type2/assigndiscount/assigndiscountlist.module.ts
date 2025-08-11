import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AssignDiscountList } from './assigndiscountlist';

@NgModule({
  declarations: [
    Type2AssignDiscountList,
  ],
  imports: [
    IonicPageModule.forChild(Type2AssignDiscountList),
  ],
  exports: [
    Type2AssignDiscountList
  ]
})
export class Type2AssignDiscountListModule {}