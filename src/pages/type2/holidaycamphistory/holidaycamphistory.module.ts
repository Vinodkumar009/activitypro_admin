import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HolidaycamphistoryPage } from './holidaycamphistory';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  declarations: [
    HolidaycamphistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(HolidaycamphistoryPage),
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
      subtitle:"Paid",
      unitsColor :"#ffffff"
    })
  ],
})
export class HolidaycamphistoryPageModule {}
