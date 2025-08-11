import { Component } from '@angular/core';
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
} from "ionic-angular";
import { Subscription as RxSubscription } from 'rxjs/Subscription'; // Rename to avoid conflict
import { Storage } from "@ionic/storage";
import * as moment from "moment";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { TeamsForParentClubModel } from '../models/team.model';
import { LeaguesForParentClubModel } from '../models/league.model';
import { MatchModel } from '../../match/models/match.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { CommonLeagueService } from '../commonleague.service';



/**
 * Generated class for the PkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leagueteamlisting',
  templateUrl: 'leagueteamlisting.html',
  providers: [CommonLeagueService]
})
export class LeagueteamlistingPage {
  activeIndex: number = 0;
  Title: string = "Leagues";


  ParentClubTeamFetchInput: ParentClubTeamFetchInput = {
    user_postgre_metadata: new UserPostgreMetadataField,
    user_device_metadata: new UserDeviceMetadataField
  }

  LeagueFetchInput: LeagueFetchInput = {
    user_postgre_metadata: new UserPostgreMetadataField,
    user_device_metadata: new UserDeviceMetadataField
  }

  fetchMatchesInput: FetchMatchesInput = {
    user_postgre_metadata: new UserPostgreMetadataField,
    FetchType: 4,
  };
  matches: MatchModel[] = [];
  filteredMatches: MatchModel[] = [];



  ParentClubTeam: TeamsForParentClubModel[] = [];

  teamsForParentClub: TeamsForParentClubModel[] = [];
  filteredteams: TeamsForParentClubModel[] = [];
  leaguesForParentClub: LeaguesForParentClubModel[] = [];
  filteredleagues: LeaguesForParentClubModel[] = [];
  leagueType: boolean = true;
  teamType: boolean = true;
  today = moment().format("DD-MM-YYYY");
  Today: number = 0;
  searchInput: "";




  isPublish: boolean = true;
  isPending: boolean = true;
  private subscription: RxSubscription; // Use the renamed type


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public modalCtrl: ModalController,
    private graphqlService: GraphqlService,
    private leagueService: CommonLeagueService
  ) {

    this.leagueService.activeTypeSubject.subscribe(type => {
      console.log('LeagueTeamListing received type:', type);
      this.activeIndex = type;
      // this.updateTitle(type);
    });
    this.commonService.category.pipe().subscribe((data) => {
      console.log(data);
      if (data === "leagueteamlisting") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key !== "") {
            // this.LeagueFetchInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            //this.ParentClubTeamFetchInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            // this.FetchMatchesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            // this.FetchMatchesInput.MemberKey = val.$key;
          }

          //this.getTeamsForParentClub(); //this is commented as we are going only with league only
          //this.getMatches(); //this is commented as we are going only with league only
          this.getLeaguesForParentClub();

        });
      }
    });
  }

  ionViewWillEnter() {

    if (this.activeIndex === 1) {
      this.getTeamsForParentClub();
    } else {
      this.getLeaguesForParentClub();
    }

  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad PkPage');

  }

  gotoLeaguedetailsPage(league: LeaguesForParentClubModel) {
    this.navCtrl.push("LeaguedetailsPage", {
      league_id: league.id,
    });

  }

  gotoTeamdetailsPage(team) {
    this.navCtrl.push("TeamdetailsPage", {
      team: team,
    })
  }

  changeType(index: number) {
    console.log('LeagueTeamListing changing type to:', index);

    // ✅ Set activeIndex immediately to avoid timing issues
    this.activeIndex = index;

    // 📡 Also update the service for other components
    this.leagueService.setActiveLeagueType(index);

    // 🎯 Load appropriate data based on selection
    if (index === 0) {
      this.getLeaguesForParentClub();
    } else {
      this.getTeamsForParentClub();
    }
  }


  createAction() {
    if (this.activeIndex == 0) {
      this.navCtrl.push("CreateleaguePage")
    }
    else {
      this.navCtrl.push("CreateteamPage")
    }
  }


  // changeType(index: number) {
  //   console.log('LeagueTeamListing changing type to:', index);
  //   this.leagueService.setActiveLeagueType(index);
  //   if (index == 0) {
  //     this.getLeaguesForParentClub();
  //   } else {
  //     this.getTeamsForParentClub();
  //   }
  // }

  private updateTitle(index: number) {
    switch (index) {
      case 0:
        this.Title = "Leagues";
        break;
      case 1:
        this.Title = "Teams";
        break;
      case 2:
        this.Title = "Matches";
        break;
      default:
        this.Title = "Leagues";
    }
  }

  getMatches() {
    // this.commonService.showLoader("Fetching matches...");
    this.fetchMatchesInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    const matchesQuery = gql`
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
      //this.commonService.hideLoader();
      this.matches = res.data.fetchMatches;
      this.matches = this.matches.sort(function (a, b) {
        return moment(b.MatchStartDate, "YYYY-MM-DD hh:mm").diff(
          moment(a.MatchStartDate, "YYYY-MM-DD hh:mm")
        );
      });
      this.filteredMatches = JSON.parse(JSON.stringify(this.matches));

      let today = moment().format("YYYY-MM-DD");
      this.Today = this.matches.filter((match) => {
        let match_createdAt = moment(
          match.MatchStartDate,
          "YYYY-MM-DD"
        ).format("YYYY-MM-DD");

        return moment(today).isSame(match_createdAt);
      }).length;
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

    // this.apollo
    //   .query({
    //     query: matchesQuery,
    //     // fetchPolicy: type ? "network-only" : "cache-first",
    //     fetchPolicy: "network-only",
    //     variables: {
    //       fetchMatchesInput: this.FetchMatchesInput,
    //     },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log("matches data" + JSON.stringify(data["fetchMatches"]));
    //       // this.commonService.hideLoader();
    //       this.matches = data["fetchMatches"];
    //       this.matches = this.matches.sort(function (a, b) {
    //         return moment(b.MatchStartDate, 'YYYY-MM-DD hh:mm').diff(moment(a.MatchStartDate, 'YYYY-MM-DD hh:mm'));
    //       });
    //       this.filteredMatches = JSON.parse(JSON.stringify(this.matches));

    //       let today = moment().format("YYYY-MM-DD");
    //       this.Today = this.matches.filter((match) => {
    //         let match_createdAt = moment(match.MatchStartDate, "YYYY-MM-DD").format(
    //           "YYYY-MM-DD"
    //         );
    //         return moment(today).isSame(match_createdAt);
    //       }).length;
    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage(
    //         "Failed to fetch matches",
    //         2500,
    //         ToastMessageType.Error,
    //         ToastPlacement.Bottom
    //       );
    //     }
    //   );
  };

  MatchStartDate(date) {
    //return moment(+date, "YYYY-MM-DD hh:mm:ss").format("DD-MMM-YYYY, hh:mm");
    return moment(date, "YYYY-MM-DD HH:mm").format("DD-MMM-YYYY, hh:mm A");
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    // this.initializeItems();
    // set val to the value of the searchbar

    this.Items();

    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredMatches = this.matches.filter((item) => {
        if (item.MatchTitle != undefined) {
          if (item.MatchTitle.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.Activity.ActivityName != undefined) {
          if (item.Activity.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.Hosts[0].Name != undefined) {
          if (item.Hosts[0].Name.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        // if (item.Hosts.Name != undefined) {
        //   return item.Hosts.Name.toLowerCase().indexOf(val.toLowerCase()) > -1;
        // }
      });
    }
  }

  Items() {
    this.filteredMatches = this.matches;
  }


  //function to get the list of team
  getTeamsForParentClub = () => {
    this.commonService.showLoader("Fetching Teams...");
    this.ParentClubTeamFetchInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    this.ParentClubTeamFetchInput.user_device_metadata.UserAppType = 0;
    this.ParentClubTeamFetchInput.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2

    const teamsforparentclubQuery = gql`
      query getTeamsForParentClub($TeamDetails: ParentClubTeamFetchInput!) {
        getTeamsForParentClub(TeamDetails: $TeamDetails) {
          id
          created_at
          created_by
          updated_at
          is_active
          activity {
            ActivityName
            ActivityCode
          }
          venueKey
          venueType
          ageGroup
          teamName
          teamStatus
          teamVisibility
          parentClub{
            FireBaseId
          }
          club{
           Id
           ClubName
           FirebaseId
         }
        logo_url
        }
      }
    `;
    this.graphqlService.query(teamsforparentclubQuery, { TeamDetails: this.ParentClubTeamFetchInput }, 0).subscribe((data) => {
      this.commonService.hideLoader();
      this.teamsForParentClub = data.data.getTeamsForParentClub;
      this.filteredteams = JSON.parse(JSON.stringify(this.teamsForParentClub))
      //data.data.getTeamsForParentClub
    },
      (error) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Fetching failed for teams", 2500, ToastMessageType.Error);
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


  //function to get the list of league
  getLeaguesForParentClub = () => {
    // this.commonService.showLoader("Fetching Leagues...");
    this.LeagueFetchInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    this.LeagueFetchInput.user_device_metadata.UserAppType = 0;
    this.LeagueFetchInput.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2
    const leaguesforparentclubQuery = gql`
      query getLeaguesForParentClub($ParentClubDetails: LeagueFetchInput!) {
        getLeaguesForParentClub(ParentClubDetails: $ParentClubDetails) {
          id
          created_at
          created_by
          updated_at
          is_active
          league_name
          activity {
            ActivityName
            ActivityCode
          }
          league_category_text
          league_category
          league_age_group
          start_date
          end_date
          league_visibility
          league_type_text
          club{
            Id
            ClubName
            FirebaseId
          }
          league_visibility
          
        }
      }
    `;
    this.graphqlService.query(leaguesforparentclubQuery, { ParentClubDetails: this.LeagueFetchInput }, 0).subscribe((res: any) => {
      // this.commonService.hideLoader();
      this.leaguesForParentClub = res.data.getLeaguesForParentClub;
      this.filteredleagues = JSON.parse(JSON.stringify(this.leaguesForParentClub));
    },
      (error) => {
        // this.commonService.hideLoader();
        this.commonService.toastMessage("Fetching failed for leagues", 2500, ToastMessageType.Error);
        console.error("Error in fetching:", error);
      })
  };


  matchStartDate(date) {
    //return moment(+date, "YYYY-MM-DD hh:mm:ss").format("DD-MMM-YYYY, hh:mm");
    return moment(date, "YYYY-MM-DD HH:mm").format("DD-MMM-YYYY, hh:mm A");
  }



  formatMatchStartDate(date) {
    return moment(+date).format("DD-MMM-YYYY");
  }

  getLeagueCategory(index: number) {
    switch (index) {
      case 0:
        return 'Boys';
      case 1:
        return 'Girls';
      case 2:
        return 'Gents';
      case 3:
        return 'Ladies';
      case 4:
        return 'Mixed'
    }
  }
  initializeItems() {
    this.filteredleagues = this.leaguesForParentClub;
  }

  getLeagueSearch(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredleagues = this.leaguesForParentClub.filter((item) => {
        if (item.league_name != undefined) {
          if (item.league_name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.activity.ActivityName != undefined) {
          if (item.activity.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.club.ClubName != undefined) {
          if (item.club.ClubName.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }

      });
    }

  }

  getTeamItems(ev: any) {
    // Reset items back to all of the items
    this.resetTeamItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.filteredteams = this.teamsForParentClub.filter((item) => {
        if (item.teamName != undefined) {
          return (item.teamName.toLowerCase().indexOf(val.toLowerCase()) > -1)

        }
        if (item.activity.ActivityName != undefined) {
          return (item.activity.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1)

        }

      })

    }

  }

  resetTeamItems() {
    this.filteredteams = this.teamsForParentClub;
  }







}



export class ParentClubTeamFetchInput {
  user_postgre_metadata: UserPostgreMetadataField
  user_device_metadata: UserDeviceMetadataField
}
export class LeagueFetchInput {
  user_postgre_metadata: UserPostgreMetadataField
  user_device_metadata: UserDeviceMetadataField

}
export class UserPostgreMetadataField {
  UserParentClubId: string

}
export class UserDeviceMetadataField {
  UserAppType: number
  UserDeviceType: number
}

export class FetchMatchesInput {
  user_postgre_metadata: UserPostgreMetadataField
  // ParentClubKey: string;
  // MemberKey: string;
  FetchType: number;
}

export class FetchUserInput {
  ParentClubKey: String;
  MemberKey: String;
  ParticipationStatus: number;
}

