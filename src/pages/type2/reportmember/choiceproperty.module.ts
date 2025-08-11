import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ChoiceProperty } from './choiceproperty';

@NgModule({
  declarations: [
    Type2ChoiceProperty,
  ],
  imports: [
    IonicPageModule.forChild(Type2ChoiceProperty),
  ],
  exports: [
    Type2ChoiceProperty
  ]
})
export class Type2ChoicePropertyModule {}