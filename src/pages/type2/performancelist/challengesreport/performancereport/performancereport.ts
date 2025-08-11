import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import gql from 'graphql-tag';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/forkJoin'
import { SharedServices } from '../../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
//import { ApprovalDetails } from './challengedets/ChallengeDets';

/**
 * Generated class for the PerformancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-performancereport',
  templateUrl: 'performancereport.html',
})
export class PerformanceReport {
  isuserAvail: boolean = false;
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  FamilyMember: Array<any>;
  Challenges: any;
  UnmutatedChallenges = [];
  nesturl: string = "";
  selectedType: boolean = true;
  RegMembers = [];
  LeaderboardObj = { ParentClubKey: "", ClubKey: "", Duration: 3, ActivityKey: "", MemberKey: "" };
  Leaderboard: any = [];
  isNoChallenge:boolean =  false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage,
     public sharedservice: SharedServices, public commonService: CommonService,
      public http: HttpClient, private apollo: Apollo, private httpLink: HttpLink,) {
    this.nesturl = this.sharedservice.getnestURL();

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        this.LeaderboardObj.ParentClubKey = user.ParentClubKey;
        this.LeaderboardObj.ClubKey = user.ClubKey;
        //this.MemberKey = user.MemberKey;

        this.Leaderboard = [
          {
            EarnedPoints: 12,
            FirstName: 'Shubhankar',
            LastName: 'Sumar'
          },
          {
            EarnedPoints: 2,
            FirstName: 'Dario',
            LastName: 'Garesta'
          }
        ]
        this.Challenges = [
          {
            ChallengeName: 'Go round',
            TotalPoints: 12,
            Levels: [{
              LevelName: 'level 1',
              IsComplete: true,
              IsApproved: true,
              Points: 6,
              ApprovalType: 2
            },
            {
              LevelName: 'level 2',
              IsComplete: true,
              IsApproved: false,
              Points: 6,
              ApprovalType: 1
            }],
            Users:[
              {
              
                FirstName: 'Shubhankar',
                LastName: 'Sumar'
              },
              {
              
                FirstName: 'Dario',
                LastName: 'rio'
              }
            ]
          }
        ]
        break;
      }
    });

    
  }
//////


  //Tabs Toggle b/w challenge&template
  changeType(val) {
    this.selectedType = val;
    this.selectedType ? this.getChallenges() : this.getLeaderboard();
  }

  
 

  getChallenges = () => {
    this.Challenges = [];
    //this.commonService.showLoader("Fetching challenges...");

    // const challengesQuery = gql`
    //   query getUserChallengesByFirebase($userid:String!) {
    //     getUserChallengesByFirebase(userKey:$userid){
    //       Id
    //       ChallengeName
    //       ChallengsImageURL
          
    //       Levels{
    //         Id
    //         LevelName
    //         LevelSequence
    //         Points
    //         IsApproved
    //         IsComplete
    //         CompletedOn
    //         ApprovedOn
    //         ApprovalDetails{
    //           Id
    //           ApprovedBy
    //           ApprovalType
    //         }
    //       }
    //       TotalPoints
  
    //     }
    //   }
    // `;
    // this.apollo
    //   .query({
    //     query: challengesQuery,
    //     fetchPolicy: 'network-only',
    //     variables: {
    //       //-LqfFPegGuLnezIQ_q5v
    //       userid: this.LeaderboardObj.MemberKey,
    //     },
    //   })
    //   .subscribe(({ data }) => {
    //     console.log('challeges data' + JSON.stringify(data["getUserChallengesByFirebase"]));
    //     this.commonService.hideLoader();
    //     this.commonService.toastMessage("Challenges fetched", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //     this.Challenges = data["getUserChallengesByFirebase"] as ChallengeModel[];
    //     this.UnmutatedChallenges = JSON.parse(JSON.stringify(this.Challenges));
    //   }, (err) => {
    //     this.commonService.hideLoader();
    //     console.log(JSON.stringify(err));
    //     this.commonService.toastMessage("Challeges fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //   });

  }

  getLeaderboard = () => {
    //this.commonService.showLoader("Fetching leaderboard...")
    //this.LeaderboardObj.AgeTo = this.LeaderboardObj.AgeTo.toString();
  //   const leaderboardQuery = gql`
  //   query getUserLeaderboardBymember($leaderboardInput:LeaderboardMemberInput!) {

  //     getUserLeaderboardBymember(leaderboardInput:$leaderboardInput){
  //       Id
  //       FirstName
  //       LastName
  //       EarnedPoints
  //     }
  //   }
  // `;
  //   this.apollo
  //     .query({
  //       query: leaderboardQuery,
  //       variables: {
  //         leaderboardInput: this.LeaderboardObj,
  //       },
  //     })
  //     .subscribe(({ data }) => {
  //       this.commonService.hideLoader();
  //       this.commonService.toastMessage("Leaderboard fetched", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
  //       this.Leaderboard = data["getUserLeaderboardBymember"] as LeaderboardModel[];
  //       console.log('leaderboard data' + JSON.stringify(this.Leaderboard));

  //     }, (err) => {
  //       this.commonService.hideLoader();
  //       console.log(JSON.stringify(err));
  //       this.commonService.toastMessage("Leaderboards fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
  //     });
  }


  SelectDuration(index:number){
    this.LeaderboardObj.Duration = index;
    this.getLeaderboard();
  }


  //navigating to details page
  gotoDets(challenge:any){
    this.navCtrl.push("ChallengeDets",{Challenge:challenge,MemberKey:this.LeaderboardObj.MemberKey});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PerformancePage');
  }

}


export class ChallengeModel {
  Id: string;
  ChallengeName: string;
  ChallengsImageURL: string;
  Levels: Levelmodel[];
  TotalPoints: string;
}


export class Levelmodel {
  LevelName: string;
  LevelChallenge: number;
  LevelSequence: number;
  //ImageUrl: string;
  Points: number;
  ApprovedBy: string;
  IsApproved: boolean;
  IsComplete: boolean
  CompletedOn: string;
  ApprovedOn: string;
  ApprovalDetails:ApprovalDetailsModel
}

export class ApprovalDetailsModel{
  Id:string;
  ApprovedBy:string;
  ApprovalType:number;
}

export class LeaderboardModel {
  EarnedPoints: number;
  SpentPoints: number;
  User: User;
}


export class User {
  EmailID: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  PhoneNumber: number;
}