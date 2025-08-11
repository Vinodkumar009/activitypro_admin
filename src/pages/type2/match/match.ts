import { Component } from "@angular/core";
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { Storage } from "@ionic/storage";

import { SharedServices } from "../../services/sharedservice";
import { MatchModel } from "./models/match.model";
import * as moment from "moment";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../services/graphql.service";
import { MatchType } from "../../../shared/utility/enums";
import { HttpService } from "../../../services/http.service";
import { API } from "../../../shared/constants/api_constants";
import { AllMatchData, MatchModelV3 } from "../../../shared/model/match.model";
import { AppType } from "../../../shared/constants/module.constants";
/**
 * Generated class for the MatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-match",
  templateUrl: "match.html",
  providers: [HttpService]

})
export class MatchPage {

  fetchAllMatchesInput: FetchAllMatchesInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    created_by: "",
    FetchType: 0
  };
  fetchAllMatchesRes: MatchModelV3;
  matchlist: AllMatchData[] = [];
  filteredMatchlist: AllMatchData[] = [];
  fetchMatchesInput: FetchMatchesInput = {
    FetchType: 4,
    user_postgre_metadata: {
      UserParentClubId: ""
    }
  };
  matches: MatchModel[] = [];
  filteredMatches: MatchModel[] = [];
  searchInput = "";
  
  today = moment().format("DD-MM-YYYY");
  Today: number = 0;
  isPublish: boolean = true;
  isPending: boolean = true;
  // sum: number = 0;
  // totalMatches = this.matches.filter((element) => {
  //   this.sum = this.sum + element.MatchStartDate.length;
  //   console.log(this.sum);
  // });
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
    private httpService: HttpService,

  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "matchlist") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            // this.FetchUserInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
          }
          // this.getMatches();
          this.fetchAllMatchesInput =  new FetchAllMatchesInput();
          this.fetchMatchesInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
          this.fetchAllMatchesInput.parentclubId = this.sharedservice.getPostgreParentClubId();
          this.fetchAllMatchesInput.memberId = this.sharedservice.getLoggedInUserId();
          this.fetchAllMatchesInput.action_type = 0;
          this.fetchAllMatchesInput.app_type = AppType.ADMIN_NEW;
          this.fetchAllMatchesInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
          this.fetchAllMatchesInput.FetchType = 1;
          this.fetchAllMatches();
        });
      }
    });

  }

  ionViewWillEnter() {
    console.log("MatchPage");
  }

  

  // 🔄 Method to get the string representation of MatchType from the enum
  getMatchTypeName(type: number): string {
    switch (type) {
      case MatchType.SINGLES:
        return 'Singles';
      case MatchType.DOUBLES:
        return 'Doubles';
      case MatchType.TEAM:
        return 'Team';
      default:
        return 'Unknown'; // 🤷 Handle unexpected values
    }
  }

  gotoDashboard() {
    this.navCtrl.push("Dashboard");
  }
  gotoMatchdetailsPage(match) {
    match.MatchType == MatchType.TEAM ?
      this.navCtrl.push("MatchTeamDetailsPage", { match: JSON.stringify(match) }) :
      this.navCtrl.push("MatchdetailsPage", {
        match: match,
        // selectedmatchId: match.Id,
        // selectedmemberkey: this.FetchMatchesInput.MemberKey,
      });
  }


  fetchAllMatches() {
    this.commonService.showLoader("Fetching matches...");
    
    this.httpService.post(`${API.FetchAllMatches}`, this.fetchAllMatchesInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.fetchAllMatchesRes = res.data;
        this.matchlist = this.fetchAllMatchesRes.AllMatches;
        console.log("FetchAllMatches RESPONSE", JSON.stringify(res.data));
        this.filteredMatchlist = JSON.parse(JSON.stringify(this.matchlist));
        let today = moment().format("YYYY-MM-DD");
        this.Today = this.matchlist.filter((match) => {
          let match_createdAt = moment(
            match.MatchStartDate,
            "YYYY-MM-DD"
          ).format("YYYY-MM-DD");

          return moment(today).isSame(match_createdAt);
        }).length;
      } else {
        console.log("error in fetching",)
      }
    }, error => {
      this.commonService.hideLoader();
      this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
    });
  }

  //getting matches
  getMatches = () => {
    this.commonService.showLoader("Fetching matches...");
    const matchesQuery = gql`
      query fetchMatches($fetchMatchesInput: FetchMatchesInput!) {
        fetchMatches(fetchMatchesInput: $fetchMatchesInput) {
          Id
          IsActive
          IsEnable
          CreatedAt
          CreatedBy
          Activity {
            Id
            ActivityName
          }
          Result {
            ResultStatus
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

    this.graphqlService.query(matchesQuery, { fetchMatchesInput: this.fetchMatchesInput }, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.matches = res.data.fetchMatches;
      this.matches = this.matches.sort(function (a, b) {
        return moment(b.MatchStartDate, "YYYY-MM-DD hh:mm").diff(
          moment(a.MatchStartDate, "YYYY-MM-DD hh:mm")
        );
      });
      this.filteredMatches = JSON.parse(JSON.stringify(this.matches));

      // let today = moment().format("YYYY-MM-DD");
      // this.Today = this.matches.filter((match) => {
      //   let match_createdAt = moment(
      //     match.MatchStartDate,
      //     "YYYY-MM-DD"
      //   ).format("YYYY-MM-DD");

      //   return moment(today).isSame(match_createdAt);
      // }).length;
    },
      (error) => {
        //this.commonService.hideLoader();
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
      })
  };

  formatMatchStartDate(date) {
    //return moment(+date, "YYYY-MM-DD hh:mm:ss").format("DD-MMM-YYYY, hh:mm");
    return moment(date, "YYYY-MM-DD HH:mm").format("DD-MMM-YYYY, hh:mm A");
  }

  gotoCreateMatch() {
    this.navCtrl.push("CreatematchPage");
  }

  /**
   * 🔍 Filters matchlist based on search input (for AllMatches API response)
   * Usage: Call this method with the search event from the searchbar for AllMatches data
   */
  getFilterEvents(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() !== "") {
      this.filteredMatchlist = this.matchlist.filter((item) => {
        if (item.MatchTitle && item.MatchTitle.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        if (item.ActivityName && item.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        if (item.homeUserName && item.homeUserName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        if (item.awayUserName && item.awayUserName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        return false;
      });
    } else {
      this.initializeEvents();
    }
  }

  /**
   * 🗒️ Resets filteredMatchlist to all matches (for AllMatches API response)
   */
  initializeEvents() {
    this.filteredMatchlist = this.matchlist;
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    // this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredMatches = this.matches.filter((item) => {
        if (item.MatchTitle != undefined) {
          if (item.MatchTitle.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.Activity.ActivityName != undefined) {
          if (
            item.Activity.ActivityName.toLowerCase().indexOf(
              val.toLowerCase()
            ) > -1
          )
            return true;
        }
        if (item.Hosts[0].Name != undefined) {
          if (item.Hosts[0].Name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        // if (item.Hosts.Name != undefined) {
        //   return item.Hosts.Name.toLowerCase().indexOf(val.toLowerCase()) > -1;
        // }
      });
    } else this.initializeItems();
  }

  initializeItems() {
    this.filteredMatches = this.matches;
  }
}

export class FetchMatchesInput {
  FetchType: number;
  user_postgre_metadata: {
    UserParentClubId: string
  }
}

export class FetchAllMatchesInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏢 Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 🧑‍ User/Member ID
  action_type: number; // ⚙️ Type of action
  device_type: number; // 📱 Type of device
  app_type: number; // 📱 Type of application
  device_id: string; // 🆔 Device identifier
  updated_by: string; // 🧑‍ Identifier of the updater
  created_by: string | null; // 🧑‍ Identifier of the creator (can be null)
  FetchType: number; // 🔍 Type of fetch operation
}

