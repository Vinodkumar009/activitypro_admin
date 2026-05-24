import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateleaguePage } from './createleague';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';


@NgModule({
  declarations: [
    CreateleaguePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateleaguePage),
    SharedComponentsModule
  ],
})
export class CreateleaguePageModule {}
