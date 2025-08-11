import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreteproductPage } from './creteproduct';
//import {NgxImageCompressService} from "ngx-image-compress";

@NgModule({
  declarations: [
    CreteproductPage,
  ],
  imports: [
    IonicPageModule.forChild(CreteproductPage),
  ],
  //providers:[NgxImageCompressService]
})
export class CreteproductPageModule {}
