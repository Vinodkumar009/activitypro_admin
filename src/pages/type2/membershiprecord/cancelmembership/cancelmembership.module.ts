import { NgModule} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CancelMembershipPage } from './cancelmembership';


@NgModule({
  declarations: [
    CancelMembershipPage,
  ],

  imports: [
    IonicPageModule.forChild(CancelMembershipPage),
  ],

 
})
export class CancelMembershipPageModule {}
