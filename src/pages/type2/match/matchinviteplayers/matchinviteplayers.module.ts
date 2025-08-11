import { FirebaseService } from './../../../../services/firebase.service';
import { CommonService } from './../../../../services/common.service';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchinviteplayersPage } from './matchinviteplayers';

@NgModule({
  declarations: [
    MatchinviteplayersPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchinviteplayersPage),
  ],
  providers:[
    CommonService,
    FirebaseService
  ]
})
export class MatchinviteplayersPageModule {}
