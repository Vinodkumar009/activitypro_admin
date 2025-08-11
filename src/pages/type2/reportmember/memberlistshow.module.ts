import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2MemberlistShow } from './memberlistshow';

@NgModule({
  declarations: [
    Type2MemberlistShow,
  ],
  imports: [
    IonicPageModule.forChild(Type2MemberlistShow),
  ],
  exports: [
    Type2MemberlistShow
  ]
})
export class Type2MemberlistShowModule {}