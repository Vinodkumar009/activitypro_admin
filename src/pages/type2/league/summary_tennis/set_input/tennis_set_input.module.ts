import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TennisSetInputPage } from './tennis_set_input';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    TennisSetInputPage,
  ],
  imports: [
    IonicPageModule.forChild(TennisSetInputPage),
    SharedComponentsModule
  ],
})
export class TennisSetInputPageModule { }
