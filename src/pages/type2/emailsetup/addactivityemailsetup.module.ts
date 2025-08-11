import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddActivityEmailSetup } from './addactivityemailsetup';

@NgModule({
  declarations: [
    Type2AddActivityEmailSetup,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddActivityEmailSetup),
  ],
  exports: [
    Type2AddActivityEmailSetup
  ]
})
export class Type2AddActivityEmailSetupModule {}