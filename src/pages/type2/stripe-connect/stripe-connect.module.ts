import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StripeConnectPage } from './stripe-connect';

@NgModule({
  declarations: [
    StripeConnectPage,
  ],
  imports: [
    IonicPageModule.forChild(StripeConnectPage),
  ],
})
export class StripeConnectPageModule {}
