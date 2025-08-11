import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ActivitySetupHome } from './activitysetuphome';

@NgModule({
  declarations: [
    Type2ActivitySetupHome,
  ],
  imports: [
    IonicPageModule.forChild(Type2ActivitySetupHome),
  ],
  exports: [
    Type2ActivitySetupHome
  ]
})
export class Type2ActivitySetupHomeModule {}