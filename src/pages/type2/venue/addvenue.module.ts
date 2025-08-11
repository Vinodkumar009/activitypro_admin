import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddVenue } from './addvenue';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module' 
@NgModule({
  declarations: [
    Type2AddVenue,
  ],
  imports: [
    SharedmoduleModule,
    IonicPageModule.forChild(Type2AddVenue),
  ],
  exports: [
    Type2AddVenue
  ]
})
export class Type2AddVenueModule {}