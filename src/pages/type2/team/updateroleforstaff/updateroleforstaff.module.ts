import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateroleforstaffPage } from './updateroleforstaff';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    UpdateroleforstaffPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateroleforstaffPage),
    SharedComponentsModule
  ],
})
export class UpdateroleforstaffPageModule {}
