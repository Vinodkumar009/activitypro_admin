import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { GraphqlService } from '../../../../services/graphql.service';
/**
 * Generated class for the PublishresultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-publishresult',
  templateUrl: 'publishresult.html',
})
export class PublishresultPage {
  matchId:string;
  teams:TeamsModal[];
  result_input:PublishResultInput = {
    CreatedBy: "", //MemberKey
    ResultDetails: null, //MemberKey
    resultDescription: "", //MemberKey
    ResultStatus: 1, //MemberKey
    MatchId: "", //matchId
    WinnerId: "", //Always a Team ID
    PublishedBy: "" //MemberKey
  }
  sets:number = 1;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private apollo: Apollo,public storage: Storage,private graphqlService:GraphqlService,
    public commonService: CommonService,) {
    this.matchId = this.navParams.get("matchId");
    this.teams = this.navParams.get("teams");
    this.teams = this.sortByTeamName();
    this.result_input.MatchId = this.matchId;
    for(let i=0;i < this.teams.length; i++){
      this.teams[i]["isWinner"] = false;
      this.teams[i]["sets"] = [0];
    }
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.result_input.PublishedBy = val.$key;
      this.result_input.CreatedBy = val.$key;   
      for (let user of val.UserInfo) {
        // this.selectedParentClubKey = user.ParentClubKey;
        // this.selectedClubKey = user.ClubKey;
       
     
        break;
      }
    })
    //console.log(this.teams);
  }

  //sorting teams by teamname
  sortByTeamName():TeamsModal[]{
    return this.teams.sort((a,b) => (a.TeamName > b.TeamName) ? 1 : ((b.TeamName > a.TeamName) ? -1 : 0))
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PublishresultPage');
  }

  //selection winner from teams
  makeWinner(index){
    //const selected_teamIndex = this.teams.findIndex(team => team["isWinner"]);
    if(!this.teams[index]["isWinner"]){
      this.teams[index]["isWinner"] = true;
      this.result_input.WinnerId = this.teams[index].Id
      this.SetPoints(index,true);
    }else{
      this.teams[index]["isWinner"] = true;
      this.result_input.WinnerId = this.teams[index].Id
      //this.SetPoints(index,true)
    }
    
  }

  SetPoints(selected_teamIndex:number,status:boolean){
    this.teams.map((team,teamindex) => {
      if(selected_teamIndex!= teamindex){
        team["isWinner"] = false;
        this.teams[teamindex]["sets"].map((set:number,index) => {
          this.teams[teamindex]["sets"][index] = 0
          console.log(set);
        });
      }else{
        this.teams[teamindex]["sets"].map((set:number,index) => {
          this.teams[teamindex]["sets"][index] = 6
          console.log(set);
        });
      }
    })
    console.log(this.teams);
  }

  getColor(index:number) {
    switch (index) {
      case 0:
        return 'green';
      case 1:
        return 'red';
    }
  }

  //adding sets
  addSets(){
    if(this.sets < 5){ // we need to restricy to max 5 sets
      this.sets++;
      const selected_teamIndex = this.teams.findIndex(team => team["isWinner"]);
      if(selected_teamIndex!=-1){ //team selected
        this.teams.map((team,teamindex) => {
          if(selected_teamIndex!= teamindex){
            this.teams[teamindex]["sets"].push(0)
          }else{
            this.teams[teamindex]["sets"].push(6);
          }
        })
      }else{//as of now team not selected
        this.teams.map((team,teamindex) => {
          this.teams[teamindex]["sets"].push(0);
        })
      }
    }
    console.log(this.teams);
  }

  // getvalue(i,k,ev:any){
  //   console.log(`${i},${k},${ev.target.value}`);
  //   let data = this.teams[i]["sets"][k].toString();
  //   let final = data.charAt(0) == 0 ? data.substring(1) : data;
  //   this.teams[i]["sets"][k] = Number(final);
  // }

  //removing sets
  removeSets(){
    if(this.sets > 1){
      this.sets--;
      this.teams.map((team,teamindex) => {
        this.teams[teamindex]["sets"].pop();
      })
    }
  }


  //checking the validation the winner selection of teams
  canPublishResult(){
    const selected_teamIndex = this.teams.findIndex(team => team["isWinner"]);
    if(selected_teamIndex!=-1){
      return true;
    }
    this.commonService.toastMessage("Please select the winner",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }

  //publishing match team result
  publishresult() {
    if(this.canPublishResult) {
      let team_points: any[] = [];
      this.teams.forEach((team) => {
        if (team["sets"] && team["sets"].length > 0) {
          let transform_sets = team["sets"].map(set => Number(set)) ;
          team_points.push(transform_sets);
          team_points.push(":");
        }
      });
      this.result_input.ResultDetails = `[${team_points[0]}]${team_points[1]}[${team_points[2]}]`;
      console.log(this.result_input);
      try {


        const publish_Result = gql`
         mutation publishResult($resultInput: CreateResultInput!) {
          publishResult(resultInput: $resultInput){
              ResultDetails
              ResultStatus
              resultDescription
              PublishedByApp
          }
        }`
          ;
        const deleteVariable = { resultInput: this.result_input }
  
        this.graphqlService.mutate(publish_Result, deleteVariable, 0).subscribe((response) => {
          this.commonService.toastMessage("Result published successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.navCtrl.pop();
          this.navCtrl.pop().then(()=> this.navCtrl.pop());
  
        }, (err) => {
          console.error("GraphQL mutation error:", err);
          this.commonService.toastMessage("Result publish failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
        )
      } catch (error) {
  
        console.error("An error occurred:", error);
  
      }
      // this.apollo
      //   .mutate({
      //     mutation: gql`
      //     mutation publishResult($resultInput: CreateResultInput!) {
      //       publishResult(resultInput: $resultInput){
      //         ResultDetails
      //         ResultStatus
      //         resultDescription
      //         PublishedByApp
      //       }
      //     }
      //   `,
      //     variables: { resultInput: this.result_input },
      //   })
      //   .subscribe(
      //     ({ data }) => {
      //       console.log("result publish" + data["publishResult"]);
      //       this.commonService.toastMessage("Result published successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      //       this.navCtrl.pop();
      //       this.navCtrl.pop().then(()=> this.navCtrl.pop());
      //     },
      //     (err) => {
      //       console.log(JSON.stringify(err));
      //       this.commonService.toastMessage("Result publish failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      //     }
      //   );
    }
  }
    

}
export class MatchModel {
  VenueKey: string;
  Id: string;
  Message: string;
  CreatedAt: any;
  UpdatedAt: string;
  CreatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  MatchCreator: string; //APP Name
  Activity: ActivityModel; //Which activity it is inside the member App
  MatchVisibility: number;
  GameType: number;
  MatchType: number;
  PaymentType: number;
  ResultStatus: number;
  MatchStatus: number;
  VenueName: string;
  Details: string;
  MemberFees: number;
  NonMemberFees: number;
  MatchStartDate: any;
  Result: ResultModel;
  Capacity: number;
  MatchTitle: string;
  Teams: TeamModel[];
  Hosts: Host[];
}

export class Host{
  Name:string;
  firebaseKey:string;
  roleType:number;
  userType:number;
}

export class ActivityModel {
  ActivityKey: string;
  IsActive: boolean;
  IsEnable: boolean;
  ActivityCode: string;
  ActivityName: string;
  ActivityImageURL: string;
}

export class ResultModel {
  ResultDetails: string;
  ResultStatus: number;
  PublishedByApp: string;
  Winner: TeamModel;
}

export class TeamModel {
  Id: string;
  TeamName: string;
  ResultStatus: number;
  TeamPoint: number;
  Description: string;
  CoachName: string;
  IsWinner?:boolean;
  Sets_Points?:any;
  Participants: ParticipantModel[];
}

export class ParticipantModel {
  ParticipationStatus: number;
  PaymentStatus: number;
  PaymentTracking: string;
  InviteStatus: number;
  TotalPoints: number;
  User: UserModel;
  CreatedAt: string;
  UpdatedAt: string;
  InviteType: number;
  TotalPonumbers: number;
  Team: TeamModel[];
  Match: MatchModel;
}

export class UserModel {
  Id: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}

//ladder model

export class LadderModel {
  IsActive: boolean;
  IsEnable: boolean;
  FirstName: string;
  LastName: string;
  rank: number;
  Points: number;
  IsSelf?: boolean;
  LastMatchPlayed:string;
  TotalMatches:any;
}
//invite players
export class MembersModel {
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}


export class TeamsModal{
  Id:string;
  TeamName:string;
  IsWinner?:boolean;
  Sets_Points?:any;
  ResultDescription:string;
  Participants:TeamParticipants[]
}

export class TeamParticipants{
  PaymentStatus:number
  InviteStatus:number
  InviteType:number
  ParticipationStatus:number
  User:{FirstName:string,LastName:string,FirebaseKey:string,isUserAvailable?:boolean}  
}

export class PublishResultInput{
  CreatedBy: string; //MemberKey
  ResultDetails: string; //MemberKey
  resultDescription: string; //MemberKey
  ResultStatus: number; //MemberKey
  MatchId: string; //matchId
  WinnerId: string; //Always a Team ID
  PublishedBy: string; //MemberKey
}

export class MatchSetupModel{
  IsActive: string;
  IsEnable: true;
  DisplayName: string;
  Name: string;
  CreateDate:string;
  Member: boolean;
  NonMember: boolean;
  Code: number              
}