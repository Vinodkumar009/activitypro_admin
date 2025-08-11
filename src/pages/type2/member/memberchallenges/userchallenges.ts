import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import gql from 'graphql-tag';
import { HttpClient } from '@angular/common/http';
import { FamilyMember } from '../model/member';
//import { TemplateModel, ChallengeModel, Levelmodel,Approval } from './model/challenge_templatemodel';
/**
 * Generated class for the MemberchallengesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-userchallenges',
  templateUrl: 'userchallenges.html',
})
export class Userchallenges {
  isuserAvail:boolean = false;
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  FamilyMember: FamilyMember[] =[];
  Challenges: ChallengeModel[];
  UnmutatedChallenges = [];
  nesturl: string = "";
  isNoChallenge:boolean =  false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, private apollo: Apollo, private httpLink: HttpLink, public sharedService: SharedServices, public commonService: CommonService) {
    this.nesturl = this.sharedService.getnestURL();
    //this.MemberKey = this.navParams.get("MemberKey") ? this.navParams.get("MemberKey") : "";
    this.ParentClubKey = this.sharedService.getParentclubKey();
    this.ClubKey = this.navParams.get("User")["clubkey"] ? this.navParams.get("User")["clubkey"] : "";
    this.FamilyMember = this.navParams.get("FamilyMember") ? JSON.parse(JSON.stringify(this.navParams.get("FamilyMember"))) : (JSON.parse(JSON.stringify([])));
    if(this.FamilyMember.length > 0){
      this.FamilyMember.forEach((member) => {
        member["isSelected"] = false;
        member["canKidsLogin"] = false;
      });
      this.FamilyMember[0]["isSelected"] = true;
      this.MemberKey = this.FamilyMember[0].FirebaseKey;
      this.getFamilyKidsLogin(0);
    }else{
      this.commonService.toastMessage("No family members found",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
    
  
  }

  getFamilyKidsLogin(index:number) {
    //this.commonService.showLoader("Fetching challenges...");
    //this.FamilyMember.forEach((user) => {
    //for(let userInd=0; userInd < this.FamilyMember.length; userInd++){
      this.http.get(`${this.sharedService.getnestURL()}/apkids/loginstatus/${this.FamilyMember[index].FirebaseKey}`).subscribe((data) => {
        if (Object.keys(data).length > 0) {
          this.isuserAvail = true;
          this.getChallenges();
        }else{ 
          this.commonService.toastMessage("No challenges found.", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        }
      }, (err) => {
        this.isNoChallenge = true;
        this.commonService.toastMessage("No challenges found.", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        console.log(err);
      });
    //}

    

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MemberchallengesPage');
  }

  gotoAssignTemplate() {
    this.navCtrl.push("Templateslist", { MemberKey: this.MemberKey });
  }

  toggleUsers(index: number) {
    this.FamilyMember[index]["isSelected"] = true;
    if (this.FamilyMember[index]["isSelected"]) {
      this.FamilyMember.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item["isSelected"] = false;
      });
      this.MemberKey = this.FamilyMember[index].FirebaseKey;
      this.isNoChallenge = false;
      this.getFamilyKidsLogin(index);
    }
  }

  getChallenges = () => {
    this.commonService.showLoader("Fetching challenges...");

    const challengesQuery = gql`
    query getUserChallengesByFirebase($userid:String!) {
      getUserChallengesByFirebase(userKey:$userid){
        Id
        ChallengeName
        ChallengsImageURL
        
        Levels{
          LevelName
          LevelSequence
          Points
          IsApproved
          IsComplete
          CompletedOn
          ApprovedOn
        }
        TotalPoints

      }
    }
  `;
    this.apollo
      .query({
        query: challengesQuery,
        fetchPolicy: 'network-only',
        variables: {
          //-LqfFPegGuLnezIQ_q5v
          userid: this.MemberKey,
        },
      })
      .subscribe(({ data }) => {
        console.log('challeges data' + JSON.stringify(data["getUserChallengesByFirebase"]));
        this.commonService.hideLoader();
       // this.commonService.toastMessage("Challenges fetched", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.Challenges = data["getUserChallengesByFirebase"] as ChallengeModel[];
        this.isNoChallenge = this.Challenges.length ? false : true;
        this.UnmutatedChallenges = JSON.parse(JSON.stringify(this.Challenges));
      }, (err) => {
        this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("Challeges fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

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
      });
    } else {
      this.Challenges = this.UnmutatedChallenges;
    }
  }

  //navigating to details page
  gotoDets(challenge:any){
    this.navCtrl.push("ChallengeDets",{Challenge:challenge});
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
}
