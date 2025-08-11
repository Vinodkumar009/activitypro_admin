import { NgModule,  } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewcourtPage } from './viewcourt';
import { CalendarModule } from 'ionic3-calendar-en';


@NgModule({
  declarations: [
    ViewcourtPage
    
  ],
  imports: [
    IonicPageModule.forChild(ViewcourtPage),
    CalendarModule
  ],
 
})
export class ViewcourtPageModule {}
