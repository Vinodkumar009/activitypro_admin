import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import moment from 'moment';
/**
 * Generated class for the AssignmembertochallengePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-assignmembertochallenge',
  templateUrl: 'assignmembertochallenge.html',
})
export class AssignmembertochallengePage {
  parentClubKey: any;
  ApKidsUserFetch: ApKidsUserFetch = {
    ParentClubKey: "",
    ClubKey: ""
  }
  players = []

  frequencyList = [
    { name: 'Daily', id: 1 },
    { name: 'Weekly', id: 2 },
    { name: 'Monthly', id: 3 },
    { name: 'One-off', id: 4 },
  ]

  Date = {
    startDate: '',
    endDate: ''
  }
  frequency;
  Challenge: any;
  backupList = []
  constructor(public navCtrl: NavController, public navParams: NavParams, private apollo: Apollo, private httpLink: HttpLink, public actionSheetCtrl: ActionSheetController,
    public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, public fb: FirebaseService,) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.Challenge = this.navParams.get('Challenge')
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        //this.getActivityList();
        this.Date.startDate = moment().format('YYYY-MM-DD')
        this.Date.endDate = moment().add(4, 'M').format('YYYY-MM-DD')
        this.getUserChallenges();
      }
    })

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AssignmembertochallengePage');
  }



  getUserChallenges = () => {
    this.commonService.showLoader("Fetching Players...");

    // const activity = "1001";
    //123456
    this.ApKidsUserFetch.ParentClubKey = this.parentClubKey
    this.ApKidsUserFetch.ClubKey = null
    const templateQuery = gql`
    query getApKidsUsers($apKidsUserFetch:ApKidsUserFetch!){
      getApKidsUsers(inputs:$apKidsUserFetch){
        Id
        FirstName
        LastName
      }
    }`;
    this.apollo
      .query({
        query: templateQuery,
        fetchPolicy: 'no-cache',
        variables: { apKidsUserFetch: this.ApKidsUserFetch },
      })
      .subscribe(({ data }) => {
        this.commonService.hideLoader();
        //this.commonService.toastMessage("Challeneges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        if (this.Challenge){
          let users = this.Challenge.Users
          this.players = data["getApKidsUsers"].filter(player => !users.some(challenge_user => player.Id == challenge_user.Id))
        }
        else
          this.players = data["getApKidsUsers"]
        this.players.forEach(play => {
          play['IsSelect'] = false
        })
        this.backupList = this.players

      }, (err) => {
        this.commonService.hideLoader();
        //console.log(JSON.stringify(err));
        //this.commonService.toastMessage("Challeges fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });

  }

  assign() {
    if(this.frequency && this.Date.startDate && this.Date.endDate){
      this.commonService.showLoader("Adding Players...");
      let users = []
      this.players.forEach(player => {
        if (player.IsSelect) {
          users.push(player.Id)
        }
      })
      let Challenge = {
        id: this.Challenge.Id,
        frequency: +this.frequency,
        startAt: this.Date.startDate,
        endAt: this.Date.endDate
      }
      let assignChallengesInput = {
        Users: users,
        Challenges: [Challenge]
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
          this.navCtrl.pop().then(()=> this.navCtrl.pop())
        }, (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Adding players failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
  
        });
    }else{ 
      if (!this.frequency)
      this.commonService.toastMessage("Select frequency", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      else if (!this.Date.startDate)
      this.commonService.toastMessage("Start Date should not be empty", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      else
      this.commonService.toastMessage("End Date should not be empty", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  getFilterItems(ev: any) {

    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.backupList = this.players.filter((item) => {
        if (item.FirstName != undefined) {
          if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) 
            return true;
        }
        if (item.LastName != undefined) {
          if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
          }
        }
      })
    }

  }
  initializeItems() {
    this.backupList = this.players
  }

  gotonext(){
    let selectedPlayers = this.backupList.filter(player => player.IsSelect)
    this.navCtrl.push('AssignChallenge', {players:selectedPlayers})
  }

}

export class ApKidsUserFetch {
  ParentClubKey: string
  ClubKey: string
}