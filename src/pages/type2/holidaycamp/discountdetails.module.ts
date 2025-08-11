import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CampDiscountList } from './discountdetails';

@NgModule({
  declarations: [
    Type2CampDiscountList,
  ],
  imports: [
    IonicPageModule.forChild(Type2CampDiscountList),
  ],
  exports: [
    Type2CampDiscountList
  ]
})
export class Type2CampDiscountListModule {}