import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChallengeTemplate } from './challenge-template';
//import { AllChallengesGQL } from '../../../services/graphql.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService } from '../../../services/common.service';
@NgModule({
  declarations: [
    ChallengeTemplate,
  ],
  imports: [
    IonicPageModule.forChild(ChallengeTemplate),
  ],
  providers:[FirebaseService,CommonService,SharedServices]
})
export class ChallengeTemplatePageModule {}
