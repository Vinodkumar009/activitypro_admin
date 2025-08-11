import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ReportBooking } from './reportbooking';

@NgModule({
  declarations: [
    Type2ReportBooking,
  ],
  imports: [
    IonicPageModule.forChild(Type2ReportBooking),
  ],
  exports: [
    Type2ReportBooking
  ]
})
export class Type2ReportBookingModule {}