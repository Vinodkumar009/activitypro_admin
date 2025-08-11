import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtBooking } from './courtbooking';

@NgModule({
  declarations: [
    Type2CourtBooking,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtBooking),
  ],
  exports: [
    Type2CourtBooking
  ]
})
export class Type2CourtBookingModule {}