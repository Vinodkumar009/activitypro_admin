import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoachratinghistoryPage } from './coachratinghistory';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    CoachratinghistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(CoachratinghistoryPage),
    Ionic2RatingModule
  ],
})
export class CoachratinghistoryPageModule {}
