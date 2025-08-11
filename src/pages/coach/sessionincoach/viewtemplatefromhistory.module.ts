import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewtemplatefromhistoryPage } from './viewtemplatefromhistory';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    ViewtemplatefromhistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewtemplatefromhistoryPage),
    Ionic2RatingModule,
  ],
})
export class ViewtemplatefromhistoryPageModule {}
