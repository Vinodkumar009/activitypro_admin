import { NgModule} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CancelMonthlySesSubscription } from './cancelmonthlysessubscription';


@NgModule({
  declarations: [
    CancelMonthlySesSubscription,
  ],

  imports: [
    IonicPageModule.forChild(CancelMonthlySesSubscription),
  ],

 
})
export class CancelMembershipPageModule {}
