import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberlistPage } from './memberlist';

@NgModule({
  declarations: [
    MemberlistPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberlistPage),
  ],
})
export class MemberlistPageModule {}
