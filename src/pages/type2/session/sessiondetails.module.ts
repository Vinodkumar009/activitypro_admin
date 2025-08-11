import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2SessionDetails } from './sessiondetails';

@NgModule({
  declarations: [
    Type2SessionDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2SessionDetails),
  ],
  exports: [
    Type2SessionDetails
  ]
})
export class Type2SessionDetailsModule {}