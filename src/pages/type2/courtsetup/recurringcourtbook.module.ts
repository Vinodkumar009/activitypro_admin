import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2RecurringCourtBook } from './recurringcourtbook';

@NgModule({
  declarations: [
    Type2RecurringCourtBook,
  ],
  imports: [
    IonicPageModule.forChild(Type2RecurringCourtBook),
  ],
  exports: [
    Type2RecurringCourtBook
  ]
})
export class Type2RecurringCourtBookModule {}