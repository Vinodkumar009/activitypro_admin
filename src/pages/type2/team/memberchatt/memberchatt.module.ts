import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberchattPage } from './memberchatt';

@NgModule({
  declarations: [
    MemberchattPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberchattPage),
  ],
})
export class MemberchattPageModule {}
