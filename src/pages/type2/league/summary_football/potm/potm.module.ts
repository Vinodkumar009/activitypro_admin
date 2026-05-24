import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PotmPage } from './potm';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    PotmPage,
  ],
  imports: [
    IonicPageModule.forChild(PotmPage),
    SharedComponentsModule
  ],
})
export class PotmPageModule { }
