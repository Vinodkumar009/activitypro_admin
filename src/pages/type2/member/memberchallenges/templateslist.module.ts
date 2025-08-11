import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Templateslist } from './templateslist';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService } from '../../../../services/common.service';
@NgModule({
  declarations: [
    Templateslist,
  ],
  imports: [
    IonicPageModule.forChild(Templateslist),
  ],
  providers:[CommonService,FirebaseService]
})
export class ChallengeslistPageModule {}
