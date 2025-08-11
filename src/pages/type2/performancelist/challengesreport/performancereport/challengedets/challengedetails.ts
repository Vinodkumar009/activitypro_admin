import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Apollo, QueryRef } from 'apollo-angular';
import { Storage } from '@ionic/storage';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../../services/common.service';
/**
 * Generated class for the ChallengeusersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-challengedetails',
  templateUrl: 'challengedetails.html',
})
export class ChallengeDetails{ 
  Challenge:UserChallengeModel;;
  Memberkey:string;
  //Challenge_level: AssignChallenge_LevelModel = { ChallengeID: '', LevelID: '' };
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController,
    private apollo:Apollo,public commonService: CommonService,) {
    this.Challenge = this.navParams.get("Challenge");
    this.Memberkey = this.navParams.get("MemberKey");
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

  presentApprovalActionSheet(levelIndex:number) {
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
    this.commonService.showLoader("Please wait...");
    
    this.apollo
    .mutate({
      mutation: gql`mutation approveChallengeByParent($levelid:String!,$challengeid:String!,$userId:String!){
        approveChallengeByParent(levelId:$levelid,challengesId:$challengeid,userId:$userId){
          Id
          LevelName
          Points
        }
      }`,
      variables: { levelid:this.Challenge.Levels[index].Id,challengeid:this.Challenge.Id,userId:this.Memberkey },
    }).subscribe(({ data }) => {
      this.commonService.hideLoader();
      //console.log('approval data' + data["approveChallengeByParent"]);
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
