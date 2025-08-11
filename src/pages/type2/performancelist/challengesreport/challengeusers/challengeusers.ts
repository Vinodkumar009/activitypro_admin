import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { Apollo, QueryRef } from 'apollo-angular';
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
  selector: 'page-challengeusers',
  templateUrl: 'challengeusers.html',
})
export class Challengeusers{
  Challenge:UserChallengeModel;
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public commonService: CommonService, private apollo: Apollo, private httpLink: HttpLink,) {
    this.Challenge = this.navParams.get("Challenge");
    if(this.Challenge.Levels.length > 0){
      this.Challenge["Points"] = 0;
      this.Challenge.Levels.forEach(level => level.Points+= this.Challenge["Points"]);
    }
  }

  ionViewWillEnter() {
    //console.log('ionViewDidLoad ChallengeusersPage');
  }

  GotoMemberProfChallenges(userId:string){
    this.navCtrl.push("Userchallenges",{MemberKey:userId});
  }

  gotoAddMember(){
    this.navCtrl.push('AssignmembertochallengePage',{Challenge:this.Challenge})
  }

  showActions(index:number) {
    let actionSheet;
    actionSheet = this.actionSheetCtrl.create({
      title: this.Challenge.ChallengeName,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        // {
        //   text: 'Edit',
        //   icon: "ios-create",
        //   handler: () => {
            
        //   }
        // }, 
        {
          text: 'Delete',
          icon: "ios-trash",
          handler: () => {
            this.deleteUserConfirmation(index);
          }
        },
        {
          text: 'Close',
          icon: 'ios-close',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    actionSheet.present();
  }


  deleteUserConfirmation(index:number) {
    let alert = this.alertCtrl.create({
      title:  `Delete ${this.Challenge.Users[index].FirstName}`,
      message: 'Are you sure, You want to delete ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
           
          }
        },
        {
          text: 'Yes:Delete',
          handler: () => {
            this.deleteUser(index);
          }
        }
      ]
    });
    alert.present();
  }

  deleteUser(index) {
    this.commonService.showLoader();
    const assignlevelMutation =
      this.apollo
        .mutate({
          mutation: gql`
          mutation removeUserFromChallenge($challengeid:String!,$userid:String!){
            removeUserFromChallenge(challengesId:$challengeid,userId:$userid)
          }
      `,
          variables: {challengeid:this.Challenge.Id, userid:this.Challenge.Users[index].Id},
        })
        .subscribe(({ data }) => {
          console.log('assign data' + data["removeUserFromChallenge"]);
            this.commonService.hideLoader();
            this.commonService.toastMessage("User removed from challenge", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.navCtrl.pop();
          
        }, (err) => {
          console.log(JSON.stringify(err));
          this.commonService.hideLoader();
          this.commonService.toastMessage("User removal failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        });
        
        
  }


}




export class UserChallengeModel{
  Id:string;
  ChallengeName;
  ChallengsImageURL:string;
  Levels:ChallengeLevels[]
  Users:UserModel[]
}

export class UserModel{
  Id:string;
  FirstName:string;
  LastName:string;
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
