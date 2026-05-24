import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateleaguematchPage } from './updateleaguematch';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    UpdateleaguematchPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateleaguematchPage),
    SharedComponentsModule,
  ],
})
export class UpdateleaguematchPageModule {}
