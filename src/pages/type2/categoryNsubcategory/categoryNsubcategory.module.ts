import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoryNsubcategory } from './categoryNsubcategory';

@NgModule({
  declarations: [
    CategoryNsubcategory,
  ],
  imports: [
    IonicPageModule.forChild(CategoryNsubcategory),
  ],
  exports: [
    CategoryNsubcategory
  ]
})
export class CategoryNsubcategoryModule {}