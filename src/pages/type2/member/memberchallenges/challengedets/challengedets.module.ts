import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChallengeDets } from './challengedets';


@NgModule({
  declarations: [
    ChallengeDets,
  ],
  imports: [
    IonicPageModule.forChild(ChallengeDets),
  ],
})
export class ChallengeDetsPageModule {}
