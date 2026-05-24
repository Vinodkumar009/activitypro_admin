import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompetitionTabsPage } from './competition-tabs';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module';

@NgModule({
  declarations: [CompetitionTabsPage],
  imports: [
    IonicPageModule.forChild(CompetitionTabsPage),
    SharedmoduleModule
  ],
  exports: [CompetitionTabsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CompetitionTabsPageModule {}
