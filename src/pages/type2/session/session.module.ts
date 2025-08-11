import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Session } from './session';
import { WheelSelector } from '@ionic-native/wheel-selector';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
@NgModule({
  declarations: [
    Type2Session,
  ],
  imports: [
    IonicPageModule.forChild(Type2Session),
    SharedmoduleModule
  ],
  exports: [
    Type2Session
  ],
  providers:[
    WheelSelector
  ]
})
export class Type2SessionModule {}