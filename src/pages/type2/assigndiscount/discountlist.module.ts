import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2DiscountList } from './discountlist';

@NgModule({
  declarations: [
    Type2DiscountList,
  ],
  imports: [
    IonicPageModule.forChild(Type2DiscountList),
  ],
  exports: [
    Type2DiscountList
  ]
})
export class Type2DiscountListModule {}