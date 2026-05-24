import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditPromotion } from './editpromotion';

@NgModule({
  declarations: [
    Type2EditPromotion,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditPromotion),
  ],
  exports: [
    Type2EditPromotion
  ]
})
export class Type2EditPromotionModule {}