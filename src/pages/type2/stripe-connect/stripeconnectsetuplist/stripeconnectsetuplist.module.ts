import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StripeconnectsetuplistPage } from './stripeconnectsetuplist';
import { CommentForEmptinessPage } from '../../commentforemptiness/commentforemptiness';

@NgModule({
  declarations: [
    StripeconnectsetuplistPage,
   // CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(StripeconnectsetuplistPage),
  ],
})
export class StripeconnectsetuplistPageModule {}
