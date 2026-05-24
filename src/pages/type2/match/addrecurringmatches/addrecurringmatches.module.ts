import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddrecurringmatchesPage } from './addrecurringmatches';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [AddrecurringmatchesPage],
  imports: [
    IonicPageModule.forChild(AddrecurringmatchesPage),
    SharedComponentsModule
  ],
})
export class AddrecurringmatchesPageModule {}
