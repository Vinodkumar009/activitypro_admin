import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PerformanceSetup } from './performancesetup';

@NgModule({
  declarations: [
    PerformanceSetup,
  ],
  imports: [
    IonicPageModule.forChild(PerformanceSetup),
  ],
})
export class PerformanceSetupPageModule {}
