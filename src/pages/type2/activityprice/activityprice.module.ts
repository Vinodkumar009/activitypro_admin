import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivityPrice } from './activityprice';

@NgModule({
  declarations: [
    ActivityPrice,
  ],
  imports: [
    IonicPageModule.forChild(ActivityPrice),
  ],
  exports: [
    ActivityPrice
  ]
})
export class Type2DiscountListModule {}