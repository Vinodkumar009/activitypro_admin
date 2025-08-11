import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Performancelist } from './performancelist';

@NgModule({
  declarations: [
    Performancelist,
  ],
  imports: [
    IonicPageModule.forChild(Performancelist),
  ],
})
export class PerformancelistPageModule {}
