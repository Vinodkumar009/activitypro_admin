import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberdetailsPage } from './memberdetails';

@NgModule({
  declarations: [
    MemberdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberdetailsPage),
  ],
})
export class MemberdetailsPageModule {}
