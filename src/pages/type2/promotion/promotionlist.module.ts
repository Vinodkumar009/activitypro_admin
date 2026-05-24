import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PromotionList } from './promotionlist';
import { CommentForEmptinessPage } from '../commentforemptiness/commentforemptiness';

@NgModule({
  declarations: [
    Type2PromotionList,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(Type2PromotionList),
  ],
  exports: [
    Type2PromotionList
  ]
})
export class Type2PromotionListModule {}