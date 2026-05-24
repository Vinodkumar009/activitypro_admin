import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { MemberdetailsfocusareaPage } from './memberdetailsfocusarea';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';


@NgModule({
  declarations: [
    MemberdetailsfocusareaPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberdetailsfocusareaPage),
    SharedComponentsModule,
    IonicModule
  ],
})
export class MemberdetailsfocusareaPageModule { }
