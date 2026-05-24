import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PackageSetupHome } from './packagesetuphome';

@NgModule({
  declarations: [
    Type2PackageSetupHome,
  ],
  imports: [
    IonicPageModule.forChild(Type2PackageSetupHome),
  ],
  exports: [
    Type2PackageSetupHome
  ]
})
export class Type2PackageSetupHomeModule {}