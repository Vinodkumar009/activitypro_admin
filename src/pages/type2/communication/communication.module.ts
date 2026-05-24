import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Communication } from './communication';

@NgModule({
  declarations: [
    Type2Communication,
  ],
  imports: [
    IonicPageModule.forChild(Type2Communication),
  ],
  exports: [
    Type2Communication
  ]
})
export class Type2CommunicationModule {}