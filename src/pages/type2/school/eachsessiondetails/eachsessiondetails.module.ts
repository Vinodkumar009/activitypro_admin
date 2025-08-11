import { NgModule } from '@angular/core';
import { IonicPageModule, FabContainer } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { EachSessionDetailsPage } from './eachsessiondetails';
@NgModule({
  declarations: [
    EachSessionDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(EachSessionDetailsPage),
  ],providers:[
    CallNumber,
    FabContainer
  ]
})
export class EachSessionDetailsPageModule {}
