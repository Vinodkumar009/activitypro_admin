import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingCourt } from './bookingcourt';
import { ThemeService } from '../../../../../../services/theme.service';

@NgModule({
  declarations: [
    BookingCourt
  ],
  imports: [
    IonicPageModule.forChild(BookingCourt),
  ],
  providers: [ThemeService],
})
export class BookingCourtModule {}
