import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MembersheetPage } from './membersheet';

@NgModule({
  declarations: [
    MembersheetPage,
  ],
  imports: [
    IonicPageModule.forChild(MembersheetPage),
  ],
})
export class MembersheetPageModule {}
