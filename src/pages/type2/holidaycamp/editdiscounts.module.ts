import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditHolidayDiscounts } from './editdiscounts';

@NgModule({
  declarations: [
    Type2EditHolidayDiscounts,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditHolidayDiscounts),
  ],
  exports: [
    Type2EditHolidayDiscounts
  ]
})
export class Type2EditHolidayDiscountsModule {}