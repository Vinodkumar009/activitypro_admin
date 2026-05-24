import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Addplayertoteam } from './addplayertoteam';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Addplayertoteam,
  ],
  imports: [
    IonicPageModule.forChild(Addplayertoteam),
    SharedComponentsModule
  ],
})
export class AddplayertoteamPageModule {}
