import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingcontainerPage } from './bookingcontainer';
import { CalendarModule } from 'ionic3-calendar-en';
import { NewViewcourtPage } from './memberbooking/newviewcourt/newviewcourt';
import { ViewcourtPage } from './memberbooking/viewcourt/viewcourt';
import { ThemeService } from '../../../services/theme.service';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    BookingcontainerPage,
    NewViewcourtPage,
    ViewcourtPage,
  ],
  imports: [
    IonicPageModule.forChild(BookingcontainerPage),
    CalendarModule,
    SharedComponentsModule
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BookingcontainerPageModule {}
