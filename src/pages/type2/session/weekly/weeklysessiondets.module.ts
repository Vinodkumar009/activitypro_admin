import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WeeklysessiondetsPage } from './weeklysessiondets';
import { CallNumber } from '@ionic-native/call-number';

@NgModule({
  declarations: [
    WeeklysessiondetsPage,
  ],
  imports: [
    IonicPageModule.forChild(WeeklysessiondetsPage),
  ],
  providers: [
    CallNumber,
  ]
})
export class WeeklysessiondetsPageModule {}
