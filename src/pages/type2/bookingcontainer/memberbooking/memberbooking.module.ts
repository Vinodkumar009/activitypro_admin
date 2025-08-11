import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberbookingPage } from './memberbooking';
import { CommentForEmptinessPage } from '../../commentforemptiness/commentforemptiness';

@NgModule({
  declarations: [
    MemberbookingPage,
    //CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberbookingPage),
  ],
})
export class MemberbookingPageModule {}
