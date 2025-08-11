import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlyMemberMovePage } from './monthly_move_member';

@NgModule({
  declarations: [
    MonthlyMemberMovePage, // Declare the page component
  ],
  imports: [
    IonicPageModule.forChild(MonthlyMemberMovePage), // Import the page component
  ],
  entryComponents: [
    MonthlyMemberMovePage, // Add to entry components
  ]
})
export class MonthlyMemberMoveModule {}
