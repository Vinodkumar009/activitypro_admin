import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddPromotion } from './addpromotion';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
@NgModule({
  declarations: [
    Type2AddPromotion,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddPromotion),
  ],
  exports: [
    Type2AddPromotion
  ],
  providers:[Camera,File]
})
export class Type2AddPromotionModule {}