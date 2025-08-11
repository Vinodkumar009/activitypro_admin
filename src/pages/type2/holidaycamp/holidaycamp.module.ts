import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2HolidayCamp } from './holidaycamp';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'

@NgModule({
  declarations: [
    Type2HolidayCamp,
  ],
  imports: [
    IonicPageModule.forChild(Type2HolidayCamp),
    SharedmoduleModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth:8,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 1000,
      showTitle:true,
      showUnits:true,
      titleColor:"#ffffff",
      subtitle:"",
      unitsColor :"#ffffff"
    })
  ],
  exports: [
    Type2HolidayCamp
  ]
})
export class Type2HolidayCampModule {}