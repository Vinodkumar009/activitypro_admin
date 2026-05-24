import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { BillingPage } from './billing';
@NgModule({
  declarations: [
    BillingPage,
  ],
  imports: [
    IonicPageModule.forChild(BillingPage),
    HttpModule
  ],
  exports: [
    BillingPage
  ]
})
export class BillingPageModule {}