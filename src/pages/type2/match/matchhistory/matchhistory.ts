import { Component } from "@angular/core";
import { IonicPage, LoadingController, NavController, NavParams } from "ionic-angular";
import moment from "moment";
import { Storage } from "@ionic/storage";

import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";


/**
 * Generated class for the MatchhistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchhistory",
  templateUrl: "matchhistory.html",
})
export class MatchhistoryPage {
  activeIndex: number = 0;
  isTournament = "Tournament";
  // isHistoryPoints = "HistoryPoints";
  fetchMatchesInput = {
    user_postgre_metadata: {
      UserParentClubId: ""

    },
    FetchType: 5,
  };
  historymatches: MatchModel[] = [];
  filteredMatches: MatchModel[] = [];


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public graphqlService: GraphqlService
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "match_history") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            // this.FetchMatchesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            this.fetchMatchesInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
            this.getHistory();
          }
        });
      }
    });
  }

  ionViewDidLoad() { }

  ionViewWillEnter() {
    console.log("MatchhistoryPage");
  }

  gotoMatchdetailsPage(history) {
    this.navCtrl.push("MatchdetailsPage", {
      match: history,
      isHistory: true
    });
  }

  getColor(index: number) {
    switch (index) {
      case 0:
        return 'green';
      case 1:
        return 'red';
    }
  }

  formatMatchStartDate(date) {
    //return moment(+date, "YYYY-MM-DD hh:mm:ss").format("DD-MMM-YYYY, hh:mm");
    return moment(date, "YYYY-MM-DD HH:mm").format("DD-MMM-YYYY, hh:mm A");
  }

  getHistory = () => {
    this.commonService.showLoader("Fetching matches history...");

    const historyQuery = gql`
      query fetchMatches($fetchMatchesInput: FetchMatchesInput!) {
        fetchMatches(fetchMatchesInput: $fetchMatchesInput) {
          Id
          IsActive
          IsEnable
          CreatedAt
          CreatedBy
          Activity {
            ActivityName
          }
          Result {
            ResultStatus
            resultDescription
            CreatedAt
            ResultDetails
            Winner {
              Id
            }
          }
          MatchVisibility
          GameType
          MatchType
          PaymentType
          ResultStatus
          MatchStatus
          VenueName
          Details
          MatchStartDate
          Capacity
          MatchTitle
          Hosts {
            Name
          }
          Teams {
            Id
            TeamName
            TeamPoint
            ResultStatus
            Participants {
              User {
                FirstName
                LastName
                FirebaseKey
              }
            }
          }
        }
      }
    `;
    this.graphqlService.query(historyQuery, { fetchMatchesInput: this.fetchMatchesInput }, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.historymatches = res.data["fetchMatches"];
      this.historymatches = this.historymatches.sort(function (a, b) {
        return moment(b.MatchStartDate, 'YYYY-MM-DD hh:mm').diff(moment(a.MatchStartDate, 'YYYY-MM-DD hh:mm'))
      });
      for (let i = 0; i < this.historymatches.length; i++) {
        let teamsetsar = this.historymatches[i].Result && this.historymatches[i].Result.ResultDetails ? this.historymatches[i].Result.ResultDetails.split(":") : []
        console.log(`splitted arrray:${teamsetsar}`);
        for (let j = 0; j < this.historymatches[i].Teams.length; j++) {
          this.historymatches[i].Teams = this.sortByTeamName(this.historymatches[i].Teams);
          if (this.historymatches[i].Result && this.historymatches[i].Result.ResultStatus == 1) {
            //console.log((teamsetsar[j]));
            this.historymatches[i].Teams[j]["IsWinner"] = this.historymatches[i].Result.Winner.Id === this.historymatches[i].Teams[j].Id ? true : false;
            this.historymatches[i].Teams[j]["Sets_Points"] = JSON.parse(teamsetsar[j]);
          }

        }

      }

      this.filteredMatches = JSON.parse(JSON.stringify(this.historymatches));
    },(error)=>{
      this.commonService.hideLoader();
      this.commonService.toastMessage("Fetching failed for match", 2500, ToastMessageType.Error);
      console.error("Error in fetching:", error);
      if (error.graphQLErrors) {
        console.error("GraphQL Errors:", error.graphQLErrors);
        for (const gqlError of error.graphQLErrors) {
          console.error("Error Message:", gqlError.message);
          console.error("Error Extensions:", gqlError.extensions);
        }
      }
      if (error.networkError) {
        console.error("Network Error:", error.networkError);
      }
    }
  )
    // this.apollo
    //   .query({
    //     query: historyQuery,
    //     fetchPolicy: "network-only",
    //     variables: {
    //       fetchMatchesInput: this.fetchMatchesInput,
    //     },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log("matches data" + JSON.stringify(data["fetchMatches"]));
    //       this.commonService.hideLoader();
    //       this.historymatches = data["fetchMatches"];
    //       this.historymatches = this.historymatches.sort(function (a, b) {
    //         return moment(b.MatchStartDate, 'YYYY-MM-DD hh:mm').diff(moment(a.MatchStartDate, 'YYYY-MM-DD hh:mm'))
    //       });

    //       for(let i=0; i < this.historymatches.length;i++){
    //         let teamsetsar = this.historymatches[i].Result && this.historymatches[i].Result.ResultDetails ? this.historymatches[i].Result.ResultDetails.split(":") :[]
    //         console.log(`splitted arrray:${teamsetsar}`);
    //         for(let j=0; j < this.historymatches[i].Teams.length;j++){
    //             this.historymatches[i].Teams = this.sortByTeamName(this.historymatches[i].Teams);


    //             if(this.historymatches[i].Result && this.historymatches[i].Result.ResultStatus == 1){

    //               console.log((teamsetsar[j]));
    //               this.historymatches[i].Teams[j]["IsWinner"] = this.historymatches[i].Result.Winner.Id === this.historymatches[i].Teams[j].Id ? true : false;
    //               this.historymatches[i].Teams[j]["Sets_Points"] = JSON.parse(teamsetsar[j]);
    //             }



    //         }

    //       }

    //       this.filteredMatches = JSON.parse(JSON.stringify(this.historymatches));

    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage("Failed to fetch matches history",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //     }
    //   );
  };

  //sorting teams by teamname
  sortByTeamName(teams: any) {
    return teams.sort((a, b) => (a.TeamName > b.TeamName) ? 1 : ((b.TeamName > a.TeamName) ? -1 : 0))
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    // this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredMatches = this.historymatches.filter((item) => {
        if (item.MatchTitle != undefined) {
          if (item.MatchTitle.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        if (item.Activity.ActivityName != undefined) {
          if (item.Activity.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        if (item.Hosts.length > 0) {
          if (item.Hosts.map(host => host.Name.toLowerCase()).indexOf(val.toLowerCase()) > -1) return true;
        }
      });
    } else this.initializeItems();
  }

  initializeItems() {
    this.filteredMatches = this.historymatches;
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

export class Host {
  Name: string;
  firebaseKey: string;
  roleType: number;
  userType: number;
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
  IsWinner?: boolean;
  Sets_Points?: any;
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
  LastMatchPlayed: string;
  TotalMatches: any;
}
//invite players
export class MembersModel {
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}


export class TeamsModal {
  Id: string;
  TeamName: string;
  IsWinner?: boolean;
  Sets_Points?: any;
  ResultDescription: string;
  Participants: TeamParticipants[]
}

export class TeamParticipants {
  PaymentStatus: number
  InviteStatus: number
  InviteType: number
  ParticipationStatus: number
  User: { FirstName: string, LastName: string, FirebaseKey: string, isUserAvailable?: boolean }
}

export class PublishResultInput {
  CreatedBy: string; //MemberKey
  ResultDetails: string; //MemberKey
  resultDescription: string; //MemberKey
  ResultStatus: number; //MemberKey
  MatchId: string; //matchId
  WinnerId: string; //Always a Team ID
  PublishedBy: string; //MemberKey
}

export class MatchSetupModel {
  IsActive: string;
  IsEnable: true;
  DisplayName: string;
  Name: string;
  CreateDate: string;
  Member: boolean;
  NonMember: boolean;
  Code: number
}
