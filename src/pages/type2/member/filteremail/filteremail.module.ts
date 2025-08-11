import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Filteremail } from './filteremail';
import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    Filteremail,
  ],
  imports: [
    HttpModule,
    IonicPageModule.forChild(Filteremail),
  ],
})
export class FilteremailPageModule {}
