import { NgModule} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarModule } from 'ionic3-calendar-en';
import { BulkSlotCancellation } from './bulkslotcancellation';

@NgModule({
  declarations: [
    BulkSlotCancellation,
  ],
  imports: [
    IonicPageModule.forChild(BulkSlotCancellation),
    CalendarModule
  ],
})
export class bulkslotcancellationModule {}
