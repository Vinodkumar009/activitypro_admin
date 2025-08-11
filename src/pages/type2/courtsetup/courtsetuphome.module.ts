import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtSetupHome } from './courtsetuphome';

@NgModule({
  declarations: [
    Type2CourtSetupHome,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtSetupHome),
  ],
  exports: [
    Type2CourtSetupHome
  ]
})
export class Type2CourtSetupHomeModule {}