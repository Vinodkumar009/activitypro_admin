import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
/**
 * Generated class for the ChallengesreportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-challengesreport',
  templateUrl: 'challengesreport.html',
})
export class Challengesreport {
  selectedActivity:string = null;
  parentClubKey:string = "";
  UserChallenges:UserChallengeModel[];
  backupList: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,private apollo: Apollo, private httpLink: HttpLink, public actionSheetCtrl: ActionSheetController, public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, public fb: FirebaseService, ) {
    
    
  }

  ionViewWillEnter() {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        //this.getActivityList();
        this.getUserChallenges();
      }
    })
  }

  refreshList(){
    this.getUserChallenges(1);
  }
  //getting Templates
  getUserChallenges= (type?:number) => {
    this.commonService.showLoader("Fetching user challenges...");
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
    fetchPolicy: type ? "network-only" : "cache-first",
    variables: {
      challengeId:"",
      parentClub:this.parentClubKey,
    },
  })
  .subscribe(({data}) => {
    console.log('Challeneges data' + data["getChallenges"]);
    this.commonService.hideLoader();
    //this.commonService.toastMessage("Challenges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.UserChallenges = data["getChallenges"] as UserChallengeModel[];
    this.backupList = JSON.parse(JSON.stringify(this.UserChallenges));
    console.log('Challeneges data' + JSON.stringify(data["getChallenges"]));
  },(err)=>{
    this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage("Challenges fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });

  }


  showDetailInfo(challenge:any){
    this.navCtrl.push("Challengeusers",{Challenge:challenge});
  }
  

  gotoAddMember(){
    this.navCtrl.push('AssignChallenge')
  }

  getFilterItems(ev: any) {

    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.backupList = this.UserChallenges.filter((item) => {
        if (item.ChallengeName != undefined) {
          return (item.ChallengeName.toLowerCase().indexOf(val.toLowerCase()) > -1) 
        }


      })
    }

  }
  initializeItems() {
    this.backupList = this.UserChallenges
  }
  gotoperformance(){ 
    this.navCtrl.push('PerformanceReport')
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
   