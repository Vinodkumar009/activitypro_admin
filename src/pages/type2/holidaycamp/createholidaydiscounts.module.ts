import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateHolidayDiscounts } from './createholidaydiscounts';

@NgModule({
  declarations: [
    Type2CreateHolidayDiscounts,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateHolidayDiscounts),
  ],
  exports: [
    Type2CreateHolidayDiscounts
  ]
})
export class Type2CreateHolidayDiscountsModule {}