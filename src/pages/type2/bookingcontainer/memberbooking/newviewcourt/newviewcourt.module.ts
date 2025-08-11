import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarModule } from 'ionic3-calendar-en';
import { NewViewcourtPage } from './newviewcourt';


@NgModule({
  declarations: [
    NewViewcourtPage
    
  ],
  imports: [
    IonicPageModule.forChild(NewViewcourtPage),
    CalendarModule
  ],
 
})
export class NewViewcourtPageModule {}
