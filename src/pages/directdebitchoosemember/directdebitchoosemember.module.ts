import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DirectdebitchoosememberPage } from './directdebitchoosemember';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [
    DirectdebitchoosememberPage,
  ],
  imports: [
    IonicPageModule.forChild(DirectdebitchoosememberPage),
    HttpClientModule
  ],
})
export class DirectdebitchoosememberPageModule {}
