import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../../services/common.service";
import { Apollo, QueryRef } from 'apollo-angular';
import { Storage } from '@ionic/storage';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
/**
 * Generated class for the ChallengeusersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-challengedets',
  templateUrl: 'challengedets.html',
})
export class ChallengeDets{
  Challenge:UserChallengeModel;
  //Challenge_level: AssignChallenge_LevelModel = { ChallengeID: '', LevelID: '' };
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController,
    private apollo:Apollo,public commonService: CommonService,) {
    this.Challenge = this.navParams.get("Challenge");
    if(this.Challenge.Levels.length > 0){
      this.Challenge["Points"] = 0;
      this.Challenge.Levels.forEach(level => level.Points+= this.Challenge["Points"]);
    }
    console.log(this.Challenge);
  }

  ionViewWillEnter() {
    //console.log('ionViewDidLoad ChallengeusersPage');
  }

  GotoMemberProfChallenges(userId:string){
    this.navCtrl.push("Userchallenges",{MemberKey:userId});
  }

  presentActionSheet(levelIndex:number) {
    let actionSheet = this.actionSheetCtrl.create({
        title: "Approve" +" "+ this.Challenge.Levels[levelIndex].LevelName,
        buttons: [
            {
                text: 'Approve',
                handler: () => {
                    this.approveChallenge(levelIndex);
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }
        ]
    });

    actionSheet.present();
}


  approveChallenge(index:number){
    this.commonService.showLoader("Please Wait");
    
    this.apollo
    .mutate({
      mutation: gql`mutation ($challengeInput:ChallengeInput!){
        createChallenges(challengeInput:$challengeInput){
          Id
          ChallengeName
          ChallengsImageURL
          ParentClub{
            Id
          }
          Activity{
            Id
            ActivityCode
          }
          Levels{
            LevelName
            LevelChallenge
            LevelSequence
            Points
            ApprovalDetails{
              ApprovedBy
            }
          }
  
        }
      }`,
      variables: { challengeInput: this.Challenge },
    }).subscribe(({ data }) => {
      this.commonService.hideLoader();
      //console.log('approval data' + data["createChallenges"]);
      this.commonService.toastMessage("Level approved", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.navCtrl.pop();
    }, (err) => {
      this.commonService.hideLoader();
      console.log(JSON.stringify(err));
      this.commonService.toastMessage("Approval failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    })


  }


}




export class UserChallengeModel{
  Id:string;
  ChallengeName;
  ChallengsImageURL:string;
  Levels:ChallengeLevels[]
}

export class ChallengeLevels{
  Id:string;
  LevelName:string;
  LevelChallenge:string;
  Points:number;
  PointsData:LevelPoints;
  ApprovedBy:ApprovalDetails
}

export class LevelPoints{
  PointsName:string;
  PointsValue:number;
}

export class ApprovalDetails{
  ApprovedBy:string;
}
