import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtSetup } from './courtsetup';

@NgModule({
  declarations: [
    Type2CourtSetup,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtSetup),
  ],
  exports: [
    Type2CourtSetup
  ]
})
export class Type2CourtSetupModule {}