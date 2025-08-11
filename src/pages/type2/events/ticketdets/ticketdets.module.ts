import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TicketdetsPage } from './ticketdets';

@NgModule({
  declarations: [
    TicketdetsPage,
  ],
  imports: [
    IonicPageModule.forChild(TicketdetsPage),
  ],
})
export class TicketdetsPageModule {}
