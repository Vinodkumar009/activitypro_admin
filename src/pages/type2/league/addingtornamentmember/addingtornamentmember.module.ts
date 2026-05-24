import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddingtornamentmemberPage } from './addingtornamentmember';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    AddingtornamentmemberPage,
  ],
  imports: [
    IonicPageModule.forChild(AddingtornamentmemberPage),
    SharedComponentsModule,
  ],
})
export class AddingtornamentmemberPageModule {}
