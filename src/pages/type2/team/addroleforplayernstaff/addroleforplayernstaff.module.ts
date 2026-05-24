import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddroleforplayernstaffPage } from './addroleforplayernstaff';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    AddroleforplayernstaffPage,
  ],
  imports: [
    IonicPageModule.forChild(AddroleforplayernstaffPage),
    SharedComponentsModule
  ],
})
export class AddroleforplayernstaffPageModule {}
