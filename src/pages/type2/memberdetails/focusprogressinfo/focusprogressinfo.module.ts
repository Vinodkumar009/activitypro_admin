import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { FocusprogressinfoPage } from './focusprogressinfo';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';


@NgModule({
  declarations: [
    FocusprogressinfoPage,
  ],
  imports: [
    IonicPageModule.forChild(FocusprogressinfoPage),
    SharedComponentsModule,
    IonicModule
  ],
})
export class FocusprogressinfoPageModule { }
