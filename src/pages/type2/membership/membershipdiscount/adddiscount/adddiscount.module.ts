import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import AddDiscountPage from './adddiscount';

@NgModule({
  declarations: [
    AddDiscountPage,
  ],
  imports: [
    IonicPageModule.forChild(AddDiscountPage),
  ],
  exports: [
    AddDiscountPage,
  ]
})
export class AddDiscountPageModule {}