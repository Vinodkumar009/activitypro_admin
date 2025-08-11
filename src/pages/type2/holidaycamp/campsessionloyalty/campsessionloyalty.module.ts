import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampSessionLoyalty } from './campsessionloyalty';


@NgModule({
  declarations: [
    CampSessionLoyalty,
  ],
  imports: [
    IonicPageModule.forChild(CampSessionLoyalty),
  ],
  exports: [
    CampSessionLoyalty
  ]
})
export class CampSessionLoyaltyModule {}