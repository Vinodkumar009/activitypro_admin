import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
//import { .tsPage } from './.ts';
import { MemberbookingPage } from './memberbooking/memberbooking';
// import { RecuringbookingPage } from './recuringbooking/recuringbooking';
// import { BookingPage } from './booking/booking';
import { BookingcontainerPage } from './bookingcontainer';
import { CommentForEmptinessPage } from '../commentforemptiness/commentforemptiness';

import { CalendarModule } from 'ionic3-calendar-en';
import { NewViewcourtPage } from './memberbooking/newviewcourt/newviewcourt';
import { ViewcourtPage } from './memberbooking/viewcourt/viewcourt';

@NgModule({
  declarations: [

   // MemberbookingPage,
    // RecuringbookingPage,   
    // BookingPage,
  
    BookingcontainerPage,
    NewViewcourtPage,
    ViewcourtPage,
   // CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(BookingcontainerPage), 
    CalendarModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BookingcontainerPageModule {}
