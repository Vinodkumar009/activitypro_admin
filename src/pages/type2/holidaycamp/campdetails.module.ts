import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CampDetails } from './campdetails';
import { NgCircleProgressModule } from 'ng-circle-progress';
@NgModule({
  declarations: [
    Type2CampDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2CampDetails),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth:8,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 1000,
      showTitle:true,
      showUnits:true,
      titleColor:"#ffffff",
      subtitle:"Paid",
      unitsColor :"#ffffff"
    })
  ],
  exports: [
    Type2CampDetails
  ]
})
export class Type2CampDetailsModule {}