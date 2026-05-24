import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatematchPage } from './creatematch';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    CreatematchPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatematchPage),
    SharedComponentsModule
  ],
})
export class CreatematchPageModule {}
