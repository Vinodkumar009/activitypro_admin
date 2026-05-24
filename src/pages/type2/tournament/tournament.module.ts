import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TournamentPage } from './tournament';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module';

@NgModule({
  declarations: [
    TournamentPage,
  ],
  imports: [
    IonicPageModule.forChild(TournamentPage),
    SharedmoduleModule
  ],
  exports: [
    TournamentPage
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class TournamentPageModule {}
