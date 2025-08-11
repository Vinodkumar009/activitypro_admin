import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InnerPaymentMenu } from './innerpaymentmenu';

@NgModule({
  declarations: [
    InnerPaymentMenu,
  ],
  imports: [
    IonicPageModule.forChild(InnerPaymentMenu),
  ],
  exports: [
    InnerPaymentMenu
  ]
})
export class InnerPaymentMenuModule {}