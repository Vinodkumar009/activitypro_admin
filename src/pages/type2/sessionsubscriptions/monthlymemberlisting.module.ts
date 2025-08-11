import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlyMemberListing } from './monthlymemberlisting';


@NgModule({
  declarations: [
    MonthlyMemberListing,
  ],
  imports: [
    IonicPageModule.forChild(MonthlyMemberListing),
  ],
  exports: [
    MonthlyMemberListing
  ]
})
export class membershipMemberListingModule {}