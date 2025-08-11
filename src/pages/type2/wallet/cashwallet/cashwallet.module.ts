import { NgModule} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashWallet } from './cashwallet';



@NgModule({
  declarations: [
    CashWallet,
    
  ],

  
  imports: [
    IonicPageModule.forChild(CashWallet),
    
  ],

 
})
export class LoyaltySetupPageModule {}
