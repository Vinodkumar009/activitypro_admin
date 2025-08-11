import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
//import { NgxImageCompressService } from 'ngx-image-compress';
import { UpdateproductPage } from './updateproduct';

@NgModule({
  declarations: [
    UpdateproductPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateproductPage),
  ],
  //providers:[NgxImageCompressService]
})
export class UpdateproductPageModule {}
