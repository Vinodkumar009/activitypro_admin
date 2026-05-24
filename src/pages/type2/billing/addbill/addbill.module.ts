import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { AddBillingPage } from './addbill';
@NgModule({
  declarations: [
    AddBillingPage,
  ],
  imports: [
    IonicPageModule.forChild(AddBillingPage),
    HttpModule
  ],
  exports: [
    AddBillingPage
  ]
})
export class AddBillingPageModule {}