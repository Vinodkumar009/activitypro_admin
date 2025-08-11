import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2DiscountDetails } from './applydiscount';

@NgModule({
  declarations: [
    Type2DiscountDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2DiscountDetails),
  ],
  exports: [
    Type2DiscountDetails
  ]
})
export class Type2DiscountDetailsModule {}