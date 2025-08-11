import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2PropertyValue } from './propertyvalue';

@NgModule({
  declarations: [
    Type2PropertyValue,
  ],
  imports: [
    IonicPageModule.forChild(Type2PropertyValue),
  ],
  exports: [
    Type2PropertyValue
  ]
})
export class Type2PropertyValueModule {}