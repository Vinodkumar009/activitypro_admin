import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewCoachesPage } from './view_coaches';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [ViewCoachesPage],
  imports: [
    IonicPageModule.forChild(ViewCoachesPage),
    SharedComponentsModule
  ],
})
export class ViewCoachesPageModule {}
