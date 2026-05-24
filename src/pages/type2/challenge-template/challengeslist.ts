import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { TemplateModel, ChallengeModel, Levelmodel,Approval } from './model/challenge_templatemodel';

/**
 * Generated class for the ChallengeslistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-challengeslist',
  templateUrl: 'challengeslist.html',
  providers:[CommonService]
})
export class Challengeslist {
  Challenges:Array<any> = [];
  SelectedChallenges = [];
  UnmutatedChallenges = []
  parentClubKey:string = "";
  canAddChallenge:boolean = false;
  frequencyList = [
    { name: 'Daily', id: 1 },
    { name: 'Weekly', id: 7 },
    { name: 'Monthly', id: 30 },
    { name: 'One-off', id: 0 },
  ]
  constructor(public navCtrl: NavController, private viewCtrl:ViewController, public navParams: NavParams,public storage: Storage, private apollo: Apollo,public commonService: CommonService,) {
    let data  = this.navParams.get("challenges");
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getChallenges();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChallengeslistPage');
  }

  continue(){
    if(this.SelectedChallenges.length == 0){
      this.commonService.toastMessage("Add challenges",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }else{
      this.canAddChallenge = true;
    }
  }
  
  //getting Challenges
  getChallenges = () => {
    this.commonService.showLoader("Fetching challenges...")
    
    const challengesQuery = gql`
    query getChallenges($parentclubid:String!) {
      getChallenges(parentClubId:$parentclubid){
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
          PointsDetails{
            Id
            PointsName
            PointsValue
          }
          ApprovalDetails{
            Id
            ApprovedBy
          }
        }

      }
    }
  `;
 this.apollo
  .query({
    query: challengesQuery,
    fetchPolicy: 'no-cache',
    variables: {
      parentclubid:this.parentClubKey
    },
  })
  .subscribe(({data}) => {
    //console.log('challeges data' + data["getChallenges"]);
    this.commonService.hideLoader();
    //this.commonService.toastMessage("Challenges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.Challenges = data["getChallenges"] as ChallengeModel[];
    this.UnmutatedChallenges = JSON.parse(JSON.stringify(this.Challenges));
    this.Challenges.forEach((challenge) => {
      challenge["isSelect"] = false;
      challenge["isAlreadySelected"] = false;
      challenge['frequency'] = 0
      // challenge['startAt'] = moment().format('YYYY-MM-DD')
      // challenge['endAt'] = moment().add(3, 'M').format('YYYY-MM-DD')
      challenge["TotPts"] = 0;
      challenge.Levels.forEach((level) => {
        challenge["TotPts"] += level.Points;
      });
    });
  },(err)=>{
    this.commonService.hideLoader();
    this.commonService.toastMessage("Challeges fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });
       
  }

  selectChallenge(selectedChallenge:any){
    if(selectedChallenge.isSelect){
      this.SelectedChallenges.push(selectedChallenge);
    }else{
      let challengeIndex = this.SelectedChallenges.findIndex(challenge => challenge.Id === selectedChallenge.Id);
      if(challengeIndex!=-1){
        this.SelectedChallenges.splice(challengeIndex,1);
      }
    }
  }

  //Filter challnges
  FilterChallenges(ev: any) {
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.Challenges = this.UnmutatedChallenges.filter((challenge) => {
        if (challenge.ChallengeName != undefined) {
          if (challenge.ChallengeName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        // if (challenge.AgeGroup != undefined) {
        //   if (challenge.AgeGroup.indexOf(val.toLowerCase()) > -1) {
        //     return true;
        //   }
        // }
      });
    } else {
      this.Challenges = this.UnmutatedChallenges;
    }
  }


  clearNdismiss(){
    this.SelectedChallenges = [];
    this.viewCtrl.dismiss();
  }

  dismiss() {
    let data = {challenges: this.SelectedChallenges};
    this.viewCtrl.dismiss(data);
  }


}
