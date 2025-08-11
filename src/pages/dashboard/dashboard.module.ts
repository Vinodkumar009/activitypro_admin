import { NgModule } from '@angular/core';
import { IonicPageModule, IonicModule } from 'ionic-angular';
import { Dashboard } from './dashboard';
import { NgCircleProgressModule } from 'ng-circle-progress';
//import { CacheModule } from "ionic-cache";
@NgModule({
  declarations: [
    // Popover,
    Dashboard
  ],
  imports: [
    //CacheModule.forRoot({ keyPrefix: 'my-app-cache' }),
    IonicModule,IonicPageModule.forChild(Dashboard),
     NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth:10,
      innerStrokeWidth: 8,
      outerStrokeColor: "#2140a9",
      innerStrokeColor: "#2140a9",
      animationDuration: 1000,
      showTitle:true,
      showUnits:true,
      titleColor:"#fff",
      subtitle:"Paid",
      unitsColor :"#fff",
      showInnerStroke:false,
      subtitleColor:"#ffffff"
    })
  ],
  entryComponents: [
    // PopoverPage,
    Dashboard
  ]
})
export class DashboardModule {}