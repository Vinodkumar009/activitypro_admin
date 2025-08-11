import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
/**
 * Generated class for the LeaderboardconfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leaderboardconfig',
  templateUrl: 'leaderboardconfig.html',
})
export class Leaderboardconfig {
  parentClubKey:string = "";
  LeaderboardConfigs:LeaderboardConfigsModel[] = [];

  

  constructor(public navCtrl: NavController, public navParams: NavParams,private apollo: Apollo, private httpLink: HttpLink, public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, public fb: FirebaseService, ) {
    
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getLeaderboardSessionConfigs();
      }
    })
    
  }



  
  ionViewDidLoad() {
    console.log('ionViewDidLoad LeaderboardconfigPage');
  }


  getLeaderboardSessionConfigs = () => {
    this.commonService.showLoader("Fetching Configs...");
    const challengesQuery = gql`
    query getLeaderboardSessionTypes($parentClub:String!) {

      getLeaderboardSessionTypes(ParentClub:$parentClub){
        Id
        SessionName
        Status
      }
    }
  `;
 this.apollo
  .query({
    query: challengesQuery,
    variables: {
      parentClub:this.parentClubKey,
    },
  })
  .subscribe(({data}) => {
    //console.log('sessionconfig data' + data["getLeaderboardSessionTypes"]);
    this.commonService.hideLoader();
    //this.commonService.toastMessage("SessionTypes fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.LeaderboardConfigs = data["getLeaderboardSessionTypes"] as LeaderboardConfigsModel[];
    this.LeaderboardConfigs.forEach(config => delete config["__typename"]);
    console.log(this.LeaderboardConfigs);
    
  },(err)=>{
    this.commonService.hideLoader();
    this.commonService.toastMessage("LeaderboardCongig fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });
  }




  updateConfig = () => {
    let configObj = {
      ParentClubKey:this.parentClubKey,
      Sessions:this.LeaderboardConfigs
    }
    //this.commonService.showLoader("Updating Configs...");
    this.apollo
    .mutate({
      mutation: gql
      `mutation($leaderboardSesInput:LeaderboardSesInput!){
        updateLeaderboardSessionsTypes(leaderboardSesInput:$leaderboardSesInput)
      }`,
      variables: { leaderboardSesInput: configObj },
    }).subscribe(({ data }) => {
      //this.commonService.hideLoader();
      this.commonService.toastMessage("Leaderboard config updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.navCtrl.pop();
    },(err) => {
      //this.commonService.hideLoader();
      console.log(JSON.stringify(err));
      this.commonService.toastMessage("Leaderboard config updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    })

    
  }






}





export class LeaderboardConfigsModel{
  ParentClubKey?:string;
  SessionName:string;
  Status:boolean;
}