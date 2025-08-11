import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Addplayertoteam, } from './addplayertoteam';

@NgModule({
  declarations: [
    Addplayertoteam,
  ],
  imports: [
    IonicPageModule.forChild(Addplayertoteam),
  ],
})
export class AddplayertoteamPageModule {}
