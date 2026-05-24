import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppSetup } from './appsetup';

@NgModule({ 
  declarations: [
    AppSetup,
  ],
  imports: [
    IonicPageModule.forChild(AppSetup),
  ],
})
export class AppSetupPageModule {}
