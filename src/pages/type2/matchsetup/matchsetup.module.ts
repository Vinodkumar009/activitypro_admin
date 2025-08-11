import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchSetup } from './matchsetup';


@NgModule({
  declarations: [
    MatchSetup,
  
  ],
  imports: [
    IonicPageModule.forChild(MatchSetup),

  ],
})
export class MatchSetupModule {}
