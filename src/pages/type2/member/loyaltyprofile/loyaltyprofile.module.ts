import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoyaltyProfile } from './loyaltyprofile';

@NgModule({
  declarations: [
    LoyaltyProfile,
  ],
  imports: [
    IonicPageModule.forChild(LoyaltyProfile),
  ],

})
export class LoyaltyProfileModule {}
