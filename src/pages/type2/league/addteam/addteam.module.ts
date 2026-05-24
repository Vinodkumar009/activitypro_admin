import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddteamPage } from './addteam';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    AddteamPage,
  ],
  imports: [
    IonicPageModule.forChild(AddteamPage),
    SharedComponentsModule
  ],
})
export class AddteamPageModule {}
