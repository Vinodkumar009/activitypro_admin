import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarModule } from 'ionic3-calendar-en';
import { BookingCourt } from './bookingcourt';



@NgModule({
  declarations: [
    BookingCourt
    
  ],
  imports: [
    IonicPageModule.forChild(BookingCourt),
  
  ],
 
})
export class BookingCourtModule {}
