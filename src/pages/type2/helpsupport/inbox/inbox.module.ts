import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Inbox } from './inbox';
import { SharedServices } from '../../../services/sharedservice';
@NgModule({
  declarations: [
    Inbox,
    
  ],
  imports: [
    IonicPageModule.forChild(Inbox),
  ],
  providers:[SharedServices]
})
export class InboxPageModule {}
