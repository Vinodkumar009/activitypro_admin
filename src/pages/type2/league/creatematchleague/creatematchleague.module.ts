import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatematchleaguePage } from './creatematchleague';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    CreatematchleaguePage,
  ],
  imports: [
    IonicPageModule.forChild(CreatematchleaguePage),
    SharedComponentsModule
  ],
})
export class CreatematchleaguePageModule {}
