import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import AddmembershipYearPage from './addmembershipyear';

@NgModule({
  declarations: [
    AddmembershipYearPage,
  ],
  imports: [
    IonicPageModule.forChild(AddmembershipYearPage),
  ],
  exports: [
    AddmembershipYearPage,
  ]
})
export class AddmembershipYearPageModule {}