import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { membershipMemberListing } from './membershipmemberlisting';


@NgModule({
  declarations: [
    membershipMemberListing,
  ],
  imports: [
    IonicPageModule.forChild(membershipMemberListing),
  ],
  exports: [
    membershipMemberListing
  ]
})
export class membershipMemberListingModule {}