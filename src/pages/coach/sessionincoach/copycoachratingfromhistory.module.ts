import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CopycoachratingfromhistoryPage } from './copycoachratingfromhistory';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
  declarations: [
    CopycoachratingfromhistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(CopycoachratingfromhistoryPage),
    Ionic2RatingModule
  ],
})
export class CopycoachratingfromhistoryPageModule {}
