import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ManageSession } from './managesession';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
import { IonBottomDrawerModule } from 'ion-bottom-drawer';
@NgModule({
  declarations: [
    Type2ManageSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2ManageSession),
    SharedmoduleModule,
    IonBottomDrawerModule
  ],
  exports: [
    Type2ManageSession
  ]
})
export class Type2ManageSessionModule {}