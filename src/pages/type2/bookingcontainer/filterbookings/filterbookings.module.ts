import { NgModule} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FilterbookingsPage } from './filterbookings';
import { CalendarModule } from 'ionic3-calendar-en';

@NgModule({
  declarations: [
    FilterbookingsPage,
    
  ],

  
  imports: [
    IonicPageModule.forChild(FilterbookingsPage),
    CalendarModule
  ],

 
})
export class FilterbookingsPageModule {}
