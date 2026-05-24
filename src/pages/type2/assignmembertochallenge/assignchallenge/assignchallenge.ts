import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
import moment from 'moment';
/**
 * Generated class for the ChallengesreportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-assignchallenge',
  templateUrl: 'assignchallenge.html',
})
export class AssignChallenge {
  selectedActivity:string = null;
  parentClubKey:string = "";
  UserChallenges:UserChallengeModel[];
  UnmutatedChallenges = [];
  nextClicked = 'challenge';
  selectedPlayer=[];
  
  frequencyList = [
    { name: 'Daily', id: 1 },
    { name: 'Weekly', id: 2 },
    { name: 'Monthly', id: 3 },
    { name: 'One-off', id: 4 },
  ]


  isValid = true
  selectedChallenges = [];
  ApKidsUserFetch = {};
  players: any;
  UnmutatedPlayers:any;
  members: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,private apollo: Apollo, private httpLink: HttpLink, public actionSheetCtrl: ActionSheetController, public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, public fb: FirebaseService, ) {

  }

  ionViewWillEnter() {
    
  }
  ionViewDidLoad(){
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        let parentClubKey = this.navParams.get('parentClubKey');
        this.members = this.navParams.get('members')
        if (parentClubKey == undefined)
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
        else
          this.parentClubKey = parentClubKey
        //this.selectedPlayer = this.navParams.get('players')

        this.getUserChallenges();
      }
    })
  }

  //getting Templates
  getUserChallenges= () => {
    this.commonService.showLoader("Fetching User Challenges...");
    const templateQuery = gql`
    query getChallenges($challengeId:String!,$parentClub:String!) {
      getChallenges(challengeId:$challengeId,parentClubId:$parentClub){
        Id
        ChallengeName
        ChallengsImageURL
        Levels{
          Id
          LevelName
          LevelChallenge 
          Points
          PointsDetails{
            PointsName
            PointsValue
          }
          ApprovalDetails{
            ApprovedBy
          }
        }
        Users{ 
          Id
          FirstName
          LastName
        }
      
      }
    }
  `;
 this.apollo
  .query({
    query: templateQuery,
    fetchPolicy: 'no-cache',
    variables: {
      challengeId:"",
      parentClub:this.parentClubKey,
    },
  })
  .subscribe(({data}) => {
    console.log('Challeneges data' + data["getChallenges"]);
    this.commonService.hideLoader();
    //this.commonService.toastMessage("Challeneges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.UserChallenges = data["getChallenges"] as UserChallengeModel[];
    this.UnmutatedChallenges = JSON.parse(JSON.stringify(this.UserChallenges));
    this.UserChallenges.forEach(challenge => {
      challenge['IsSelect'] = false
      challenge['frequency'] = 0
      challenge['startAt'] = moment().format('YYYY-MM-DD')
      challenge['endAt'] = moment().add(3, 'M').format('YYYY-MM-DD')
    })
    //console.log('Challeneges data' + JSON.stringify(data["getChallenges"]));
  },(err)=>{
    this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage("Challeges fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });

  }

  gotoNext(){
    this.nextClicked = 'next';
    this.selectedPlayer = this.players.filter(player => player.IsSelect)
  }

  gotoplayer(){
    this.selectedChallenges = this.UserChallenges.filter(challenge => challenge['IsSelect'])
    if (this.members){
      this.nextClicked = 'next';
      this.selectedPlayer = this.members
    }else{
      this.nextClicked = 'player';
      this.getUser()
    }
  }

  async checkValid(){
    for await (const challenge of this.selectedChallenges) {
      if (!challenge.frequency || !challenge.startAt || !challenge.endAt){
        this.isValid = true
        break
      }
      this.isValid = false
    }
  }


  getUser = () => {
    this.commonService.showLoader("Fetching Players...");

    // const activity = "1001";
    //123456
    this.ApKidsUserFetch['ParentClubKey'] = this.parentClubKey
    this.ApKidsUserFetch['ClubKey'] = null
    const templateQuery = gql`
    query getAllMembersByParentClubNMemberType($parentclubid:String!) {
      getAllMembersByParentClubNMemberType(ParentClubKey:$parentclubid,MemberType:2){
            Id,
            FirstName,
            LastName
      }
    }
  `;
    this.apollo
      .query({
        query: templateQuery,
        fetchPolicy: 'network-only',
        variables: {
          parentclubid:this.ApKidsUserFetch['ParentClubKey']
        },
      })
      .subscribe(({ data }) => {
        this.commonService.hideLoader();
        //this.commonService.toastMessage("Challeneges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        
        this.players = data["getAllMembersByParentClubNMemberType"]
        let ids:Array<any> = [] 
        this.selectedChallenges.forEach(challenge => {
          challenge.Users.forEach( user => {
            ids.push(user.Id)
          });
        })
        this.players = this.players.filter(player => !ids.some(id => id == player.Id) );
        this.UnmutatedPlayers = JSON.parse(JSON.stringify(this.players));
        this.players.forEach(play => {
          play['IsSelect'] = false
        })
      
      }, (err) => {
        this.commonService.hideLoader();
        //console.log(JSON.stringify(err));
        //this.commonService.toastMessage("Challeges fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });

  }



  
  assign() {
  
      this.commonService.showLoader("Adding Players...");
      let users = []
      this.selectedPlayer.forEach(player => {
      
          users.push(player.Id)
        
      })
      let Challenges = []
      this.selectedChallenges.forEach(Challenge => {
        Challenges.push({
            id: Challenge.Id,
            frequency: +Challenge.frequency,
            startAt: Challenge.startAt,
            endAt: Challenge.endAt
        })
      })
      
      let assignChallengesInput = {
        Users: users,
        Challenges: Challenges
      }
      this.apollo
        .mutate({
          mutation: gql`
        mutation assignChallengesToUser($assignChallengesInput:AssignChallengesInput!) {
          assignChallengesToUser(assignChallengesInput:$assignChallengesInput)
        }`,
          variables: { assignChallengesInput },
        })
        .subscribe(({ data }) => {
          console.log('assign data' + data["createTemplate"]);
          this.commonService.hideLoader();
  
          this.commonService.toastMessage("Players Added",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.pop()
        }, (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Adding players failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
  
        });
    
  }


  //Filter challnges
  FilterChallenges(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.UserChallenges = this.UnmutatedChallenges.filter((challenge) => {
        if (challenge.ChallengeName != undefined) {
          if (challenge.ChallengeName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
      });
    } else {
      this.UserChallenges = this.UnmutatedChallenges;
    }
  }

  //Filter users
  FilterUsers(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.players = this.UnmutatedPlayers.filter((player) => {
        if (player.FirstName != undefined) {
          if (player.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        if (player.LastName != undefined) {
          if (player.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
      });
    } else {
      this.players = this.UnmutatedPlayers;
    }
  }

 

}

export class UserChallengeModel{
  Id:string;
  ChallengeName:string;
  Frequency:number;
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
   