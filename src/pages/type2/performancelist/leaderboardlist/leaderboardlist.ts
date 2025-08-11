import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
/**
 * Generated class for the LeaderboardlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leaderboardlist',
  templateUrl: 'leaderboardlist.html',
  providers:[GraphqlService]
})
export class Leaderboardlist {
  parentClubKey:string = "";
  selectedClub:string = "";
  clubs = [];
  sessionType:number = 3;
  ageCategories:ageCategoriesModel[];
  LeaderboardObj = {
    ParentClubKey:"",
    ClubKey:"",
    Duration:3,
    ActivityKey:"",
    AgeFrom:0,
    AgeTo:"0",
    start_date:moment().subtract(1,'M').format("YYYY-MM-DD"),
    end_date:moment().format("YYYY-MM-DD"),
  };
  maxDate:any
  minDate:any;
  board_date:any;
  Leaderboard:LeaderboardModel[] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public storage: Storage, private apollo: Apollo,
    public commonService: CommonService,
      public commonservice: CommonService, public fb: FirebaseService,
      private graphqlService:GraphqlService) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.LeaderboardObj.ParentClubKey = this.parentClubKey;
          this.LeaderboardObj.ClubKey = "";
          this.LeaderboardObj.Duration = this.sessionType;
          this.board_date = moment(new Date()).format("YYYY-MM-DD");
          this.minDate = moment().subtract(1,"year").format("YYYY-MM-DD");
          this.maxDate = moment(new Date(),"DD-MMM-YYYY").format("YYYY-MM-DD"); 
          this.getAgeCategories();
          
      }
  });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeaderboardlistPage');
  }

  getClubList() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
        this.clubs = data;
        if (this.clubs.length != 0) {
            this.selectedClub = this.clubs[0].$key;
            this.LeaderboardObj.ClubKey = this.selectedClub;
        }
    });
  }

  onChangeOfClub(){
    this.LeaderboardObj.ClubKey =  this.selectedClub;
    this.getLeaderboard();
  }

  SelectDuration(index:number){
    this.sessionType = index;
    this.LeaderboardObj.Duration = this.sessionType;
    this.getLeaderboard();
  }

  getAgeCategories = () => {
    this.commonService.showLoader("Fetching Age Categories...")
    const ageCategoryQuery = gql`
    query getAgeCategories($parentClub:String!) {
      getAgeCategories(ParentClub:$parentClub){
        Id
        CategoryName
        AgeFrom
        AgeTo
        Description
      }
    }
  `;
 this.graphqlService.query(ageCategoryQuery,{parentClub:this.parentClubKey},1)
  .subscribe(({data}) => {
    console.log('age categories data' + data["getAgeCategories"]);
    this.commonService.hideLoader();
    //this.commonService.toastMessage("Age categories fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.ageCategories = data["getAgeCategories"] as ageCategoriesModel[];
    if(this.ageCategories.length > 0){
      this.ageCategories.forEach(age => age["isSelected"] = false);
      this.ageCategories[0]["isSelected"] = true;
      this.LeaderboardObj.AgeFrom = this.ageCategories[0].AgeFrom;
      //this.LeaderboardObj.AgeTo = this.ageCategories[0].AgeTo.toString();
      this.LeaderboardObj.AgeTo = this.ageCategories[0].AgeTo;
      //this.getClubList();
      this.getLeaderboard();
    }
  },(err)=>{
    this.commonService.hideLoader();
    this.commonService.toastMessage("Age categories fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });
  }

  //get user leaderboard
  getLeaderboard  = () => {
    this.Leaderboard = [];
    this.commonService.showLoader("Fetching leaderboard...")
    //this.LeaderboardObj.AgeTo = this.LeaderboardObj.AgeTo.toString();
    const leaderboardQuery = gql`
    query getUserLeaderboard($leaderboardInput:LeaderboardInput!) {

      getUserLeaderboard(leaderboardInput:$leaderboardInput){
        Id
        FirstName
        LastName
        EarnedPoints
        SpentPoints
      }
    }
  `;
    this.graphqlService.query(leaderboardQuery,{leaderboardInput:this.LeaderboardObj},0)
      .subscribe(({data}) => {
        this.commonService.hideLoader();
        //this.commonService.toastMessage("Leaderboard fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        this.Leaderboard = data["getUserLeaderboard"] as LeaderboardModel[];
        if(this.Leaderboard.length > 0){
          this.Leaderboard = this.commonService.sortingObjects(this.Leaderboard,"EarnedPoints") as LeaderboardModel[];
        } 
        console.log('leaderboard data' + JSON.stringify(this.Leaderboard));

      },(err)=>{
        this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("Leaderboards fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
  }

  //select age category
  selectAge(index:number){
    this.ageCategories[index]["isSelected"] = true;
    if (this.ageCategories[index]["isSelected"]) {
      this.ageCategories.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item["isSelected"] = false;
      });
      this.LeaderboardObj.AgeFrom = this.ageCategories[index].AgeFrom;
      this.LeaderboardObj.AgeTo = this.ageCategories[index].AgeTo;
      this.getLeaderboard();
    }
  }

  


}



export class ageCategoriesModel{
  CategoryName:string;
  AgeFrom:number;
  AgeTo:string;
  Description:string;  
}


export class LeaderboardModel{
  EarnedPoints:number;
  SpentPoints:number;
  User:User;
}


export class User{
    EmailID:string;
    FirstName:string;
    LastName:string;
    Gender:string;
    DOB:string;
    PhoneNumber:number;
}



