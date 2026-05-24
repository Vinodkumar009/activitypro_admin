import { Component, OnDestroy } from "@angular/core";
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Events,
} from "ionic-angular";
import { Subscription as RxSubscription } from "rxjs/Subscription"; // Rename to avoid conflict
import { Storage } from "@ionic/storage";
import * as moment from "moment";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { TeamsForParentClubModel, TeamDetail } from "../models/team.model";
import {
  FetchMatchesInput,
  LeagueFetchInput,
  LeaguesForParentClubModel,
  ParentClubTeamFetchInput,
  UserDeviceMetadataField,
  UserPostgreMetadataField,
} from "../models/league.model";
import { MatchModel } from "../../match/models/match.model";
import { GraphqlService } from "../../../../services/graphql.service";
import { CommonLeagueService } from "../commonleague.service";
import { ThemeService } from "../../../../services/theme.service";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { AppType } from "../../../../shared/constants/module.constants";

/**
 * Generated class for the PkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-leagueteamlisting",
  templateUrl: "leagueteamlisting.html",
  providers: [CommonLeagueService, HttpService],
})
export class LeagueteamlistingPage implements OnDestroy {
  activeIndex: number = 0;
  Title: string = "Leagues";

  ParentClubTeamFetchInput: ParentClubTeamFetchInput = {
    user_postgre_metadata: new UserPostgreMetadataField(),
    user_device_metadata: new UserDeviceMetadataField(),
  };

  LeagueFetchInput: LeagueFetchInput = {
    user_postgre_metadata: new UserPostgreMetadataField(),
    user_device_metadata: new UserDeviceMetadataField(),
  };

  fetchMatchesInput: FetchMatchesInput = {
    user_postgre_metadata: new UserPostgreMetadataField(),
    FetchType: 4,
  };
  matches: MatchModel[] = [];
  filteredMatches: MatchModel[] = [];
  ParentClubTeam: TeamsForParentClubModel[] = [];
  teamsForParentClub: TeamDetail[] = [];
  filteredteams: TeamDetail[] = [];
  leaguesForParentClub: LeaguesForParentClubModel[] = [];
  filteredleagues: LeaguesForParentClubModel[] = [];
  leagueType: boolean = true;
  teamType: boolean = true;
  isExternalTeams: boolean = false;
  today = moment().format("DD-MM-YYYY");
  Today: number = 0;
  searchInput: "";
  isPublish: boolean = true;
  isPending: boolean = true;
  private subscription: RxSubscription;
  private categorySubscription: RxSubscription;
  private activeTypeSubscription: RxSubscription;
  private themeSubscription: RxSubscription;

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
    private httpService: HttpService,
    private leagueService: CommonLeagueService,
    private themeService: ThemeService,
    public events: Events
  ) {
    this.activeTypeSubscription = this.leagueService.activeTypeSubject.subscribe((type) => {
      this.activeIndex = type;
    });
    this.categorySubscription = this.commonService.category.pipe().subscribe((data) => {
      if (data === "leagueteamlisting") {
        setTimeout(() => { this.loadTheme(); }, 100);
        this.fetchData();
      }
    });
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.applyTheme(isDark);
    });
    this.events.subscribe("theme:changed", (isDark) => {
      this.applyTheme(isDark);
    });
    this.events.subscribe('team:refresh', () => {
      if (this.activeIndex === 1) {
        this.getTeamsForParentClub();
      }
    });
  }

  private fetchDebounceTimer: any = null;

  private fetchData() {
    if (this.fetchDebounceTimer) clearTimeout(this.fetchDebounceTimer);
    this.fetchDebounceTimer = setTimeout(() => {
      if (this.activeIndex === 1) {
        this.getTeamsForParentClub();
      } else {
        this.getLeaguesForParentClub();
      }
    }, 300);
  }

  ionViewWillEnter() {
    this.loadTheme();
  }

  ionViewDidEnter() {
    console.log("LeagueTeamListing page - ionViewDidEnter");

    // Apply theme again after view is fully loaded with multiple attempts
    setTimeout(() => {
      this.forceThemeCheck();
    }, 50);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 200);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 500);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 1000);
  }

  private loadTheme(): void {
    this.storage
      .get("dashboardTheme")
      .then((isDarkTheme) => {
        console.log(
          "LeagueTeamListing page - loaded theme from storage:",
          isDarkTheme
        );

        // If theme is null/undefined, default to dark theme
        const isDark =
          isDarkTheme !== null && isDarkTheme !== undefined
            ? isDarkTheme
            : true;

        console.log(
          "LeagueTeamListing page - applying theme:",
          isDark ? "dark" : "light"
        );
        this.applyTheme(isDark);
      })
      .catch((error) => {
        console.log("LeagueTeamListing page - error loading theme:", error);
        this.applyTheme(true); // Default to dark theme
      });
  }

  private applyTheme(isDark: boolean): void {
    console.log(
      "LeagueTeamListing page - applying theme:",
      isDark ? "dark" : "light"
    );

    // Force apply theme immediately and with retries
    const applyThemeToElement = () => {
      const leagueElement = document.querySelector("page-leagueteamlisting");

      if (leagueElement) {
        if (isDark) {
          leagueElement.classList.remove("light-theme");
          document.body.classList.remove("light-theme");
        } else {
          leagueElement.classList.add("light-theme");
          document.body.classList.add("light-theme");
        }
        console.log(
          "LeagueTeamListing page - theme applied successfully:",
          isDark ? "dark" : "light"
        );
        return true;
      }
      return false;
    };

    // Try to apply immediately
    if (!applyThemeToElement()) {
      // If not found, retry multiple times
      let retryCount = 0;
      const maxRetries = 5;

      const retryApply = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `LeagueTeamListing page - retry ${retryCount}/${maxRetries}`
          );

          if (!applyThemeToElement()) {
            setTimeout(retryApply, 100 * retryCount); // Increasing delay
          }
        } else {
          console.warn(
            "LeagueTeamListing page - failed to apply theme after all retries"
          );
        }
      };

      setTimeout(retryApply, 50);
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad LeagueTeamListing");

    // Force theme application on load
    setTimeout(() => {
      this.loadTheme();
    }, 100);
  }

  ionViewWillLeave() {
    // Ionic events are cleaned up here for safety
    this.events.unsubscribe("theme:changed");
    this.events.unsubscribe("team:refresh");
  }

  ngOnDestroy() {
    // Clean up all RxJS subscriptions
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.categorySubscription) { this.categorySubscription.unsubscribe(); }
    if (this.activeTypeSubscription) { this.activeTypeSubscription.unsubscribe(); }
    if (this.themeSubscription) { this.themeSubscription.unsubscribe(); }
    this.events.unsubscribe("theme:changed");
    this.events.unsubscribe("team:refresh");
  }

  // Force theme check method
  private forceThemeCheck(): void {
    console.log("LeagueTeamListing page - forcing theme check");

    // Check multiple sources for theme
    this.storage.get("dashboardTheme").then((storageTheme) => {
      console.log("LeagueTeamListing page - storage theme:", storageTheme);

      // Also check if body has light-theme class
      const bodyHasLightTheme = document.body.classList.contains("light-theme");
      console.log(
        "LeagueTeamListing page - body has light theme:",
        bodyHasLightTheme
      );

      // Determine final theme
      let isDark = true;
      if (storageTheme !== null && storageTheme !== undefined) {
        isDark = storageTheme;
      } else if (bodyHasLightTheme) {
        isDark = false;
      }

      console.log(
        "LeagueTeamListing page - force applying theme:",
        isDark ? "dark" : "light"
      );
      this.applyTheme(isDark);
    });
  }

  gotoLeaguedetailsPage(league: LeaguesForParentClubModel) {
    this.navCtrl.push("LeaguedetailsPage", {
      league_id: league.id,
    });
  }

  gotoTeamdetailsPage(team) {
    this.navCtrl.push("TeamdetailsPage", {
      team: team,
    });
  }

  changeType(index: number) {
    console.log("LeagueTeamListing changing type to:", index);

    // ✅ Set activeIndex immediately to avoid timing issues
    this.activeIndex = index;

    // 📡 Also update the service for other components
    this.leagueService.setActiveLeagueType(index);

    // 🎯 Load appropriate data based on selection (debounced)
    this.fetchData();
  }

  createAction() {
    if (this.activeIndex == 0) {
      this.navCtrl.push("CreateleaguePage");
    } else {
      this.navCtrl.push("CreateteamPage");
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
    this.fetchMatchesInput.user_postgre_metadata.UserParentClubId =
      this.sharedservice.getPostgreParentClubId();
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
    this.graphqlService
      .query(matchesQuery, { fetchMatchesInput: this.fetchMatchesInput }, 0)
      .subscribe(
        (res: any) => {
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
          this.commonService.toastMessage(
            "Fetching failed for match",
            2500,
            ToastMessageType.Error
          );
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
      );

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
  }

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
    }
  }

  Items() {
    this.filteredMatches = this.matches;
  }

  //function to get the list of team
  getTeamsForParentClub = () => {
    this.commonService.showLoader("Fetching Teams...");
    const payload = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: '',
      activityId: '',
      memberId: '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: '',
      updated_by: '',
      isExternal: this.isExternalTeams
    };
    this.httpService.post(`${API.GET_TEAMS_FOR_PARENT_CLUB}`, payload).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        this.teamsForParentClub = res.data || [];
        this.filteredteams = JSON.parse(JSON.stringify(this.teamsForParentClub));
      },
      error: (error) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Fetching failed for teams", 2500, ToastMessageType.Error);
        console.error("Error in fetching:", error);
      }
    });
  };

  //function to get the list of league
  getLeaguesForParentClub = () => {
    this.LeagueFetchInput.user_postgre_metadata.UserParentClubId =
      this.sharedservice.getPostgreParentClubId();
    this.LeagueFetchInput.user_device_metadata.UserAppType = AppType.ADMIN_NEW;
    this.LeagueFetchInput.user_device_metadata.UserDeviceType =
      this.sharedservice.getPlatform() == "android" ? 1 : 2;

    const payload = {
      user_postgre_metadata: this.LeagueFetchInput.user_postgre_metadata,
      user_device_metadata: this.LeagueFetchInput.user_device_metadata
    };

    this.httpService.post(`${API.GET_ALL_LEAGUES}`, payload).subscribe({
      next: (res: any) => {
        this.leaguesForParentClub = res.data || [];
        this.filteredleagues = JSON.parse(JSON.stringify(this.leaguesForParentClub));
      },
      error: (error) => {
        this.commonService.toastMessage("Fetching failed for leagues", 2500, ToastMessageType.Error);
        console.error("Error in fetching:", error);
      }
    });
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
        return "Boys";
      case 1:
        return "Girls";
      case 2:
        return "Gents";
      case 3:
        return "Ladies";
      case 4:
        return "Mixed";
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
          if (
            item.activity.ActivityName.toLowerCase().indexOf(
              val.toLowerCase()
            ) > -1
          )
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
    if (val && val.trim() != "") {
      this.filteredteams = this.teamsForParentClub.filter((item) => {
        if (item.TeamName != undefined) {
          return item.TeamName.toLowerCase().indexOf(val.toLowerCase()) > -1;
        }
        if (item.ActivityName != undefined) {
          return (
            item.ActivityName.toLowerCase().indexOf(
              val.toLowerCase()
            ) > -1
          );
        }
      });
    }
  }

  resetTeamItems() {
    this.filteredteams = this.teamsForParentClub;
  }

  // 🎨 Get color based on league type text with theme support
  getLeagueTypeColor(leagueTypeText: string): string {
    if (!leagueTypeText) return "#2b92bb";

    const type = leagueTypeText.toLowerCase();
    const isDark = this.themeService.getCurrentTheme();

    if (type.includes("teams") || type.includes("team")) {
      return isDark ? "#8b5cf6" : "#7c3aed"; // Violet - matching team accent
    }
    if (type.includes("singles") || type.includes("single")) {
      return isDark ? "#35adff" : "#007bff"; // Blue - darker in light theme
    }
    if (type.includes("doubles") || type.includes("double")) {
      return isDark ? "#f76e04" : "#fd7e14"; // Orange - slightly different in light theme
    }

    return "#2b92bb"; // Primary blue stays consistent
  }

  getActivityIcon(activityName: string): string {
    if (!activityName) return 'trophy';
    const name = activityName.toLowerCase();
    const map: { [key: string]: string } = {
      'tennis': 'tennisball',
      'padel tennis': 'tennisball',
      'table tennis': 'tennisball',
      'football': 'football',
      'badminton': 'tennisball',
      'basketball': 'basketball',
      'cricket': 'baseball',
      'golf': 'golf',
      'swimming': 'water',
      'fitness': 'fitness',
      'gymnastics': 'body',
      'boxing': 'hand',
      'dance': 'musical-notes',
      'sing': 'mic',
      'education': 'school',
      'netball': 'basketball',
      'dodgeball': 'baseball',
      'squash': 'tennisball',
      'bar n restaurant': 'restaurant',
      'act': 'film',
      'private coaching': 'person',
    };
    return map[name] || 'trophy';
  }
}

export class FetchUserInput {
  ParentClubKey: String;
  MemberKey: String;
  ParticipationStatus: number;
}
