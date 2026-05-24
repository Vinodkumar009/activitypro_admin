import { Component } from "@angular/core";
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  Events,
  NavParams,
  NavController,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../services/sharedservice";
import { FetchAllMatchesInput, MatchModel } from "./models/match.model";
import * as moment from "moment";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../services/graphql.service";
import { MatchType } from "../../../shared/utility/enums";
import { HttpService } from "../../../services/http.service";
import { API } from "../../../shared/constants/api_constants";
import { AllMatchData, MatchModelV3 } from "../../../shared/model/match.model";
import { AppType } from "../../../shared/constants/module.constants";
import { ThemeService } from "../../../services/theme.service";
import { SavedFormation } from "../league/models/lineup.model";
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
  // FetchUserInput: FetchUserInput = {
  //   MemberKey: "-KubtWoLbO-XNPV_TGSZ",
  //   ParentClubKey: "",
  //   ParticipationStatus: 0,
  // };
  today = moment().format("DD-MM-YYYY");
  todayLabel = moment().format("dddd, D MMM");
  Today: number = 0;
  isPublish: boolean = true;
  isPending: boolean = true;
  isDarkTheme: boolean = false;
  showLineupSheet: boolean = false;
  lineupFormations: SavedFormation[] = [];
  selectedLineupMatch: any = null;

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
    private themeService: ThemeService,
    public events: Events
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if(data == "matchlist") {
        // Force theme application when navigating to this page
        setTimeout(() => {
          this.loadTheme();
        }, 100);
        this.fetchMatchesInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
        this.fetchAllMatchesInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.fetchAllMatchesInput.memberId = this.sharedservice.getLoggedInId();
        this.fetchAllMatchesInput.action_type = 0;
        this.fetchAllMatchesInput.app_type = AppType.ADMIN_NEW;
        this.fetchAllMatchesInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.fetchAllMatchesInput.FetchType = 1;
        this.fetchAllMatches();
      }
    });

    this.events.subscribe('match:refresh', () => {
      if (this.fetchAllMatchesInput.parentclubId) {
        this.fetchAllMatches(false);
      }
    });
  }

  ionViewWillEnter() {
    console.log("Match page - ionViewWillEnter");

    // Re-fetch matches if inputs are already initialized (e.g. returning from CreatematchPage)
    if (this.fetchAllMatchesInput.parentclubId) {
      this.fetchAllMatches(false);
    }
    
    // Load and apply theme immediately
    this.loadTheme();
    
    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe(isDark => {
      console.log("Match page - theme service change:", isDark);
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
    
    // Listen for theme changes from other pages
    this.events.subscribe('theme:changed', (isDark) => {
      console.log('Match page - received theme change event:', isDark);
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  ionViewDidEnter() {
    console.log("Match page - ionViewDidEnter");
    
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

  ionViewDidLoad() {
    console.log("Match page - ionViewDidLoad");
    
    // Force theme application on load
    setTimeout(() => {
      this.loadTheme();
    }, 100);
  }

  private loadTheme(): void {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      console.log('Match page - loaded theme from storage:', isDarkTheme);
      const isDark = isDarkTheme !== null ? isDarkTheme : true; // Default to dark theme
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch((error) => {
      console.log('Match page - error loading theme:', error);
      this.isDarkTheme = true; // Default to dark theme
      this.applyTheme(true);
    });
  }

  private applyTheme(isDark: boolean): void {
    console.log("Match page - applying theme:", isDark ? "dark" : "light");
    
    // Force apply theme immediately and with retries
    const applyThemeToElement = () => {
      const matchElement = document.querySelector("page-match");
      
      if (matchElement) {
        if (isDark) {
          matchElement.classList.remove("light-theme");
          document.body.classList.remove("light-theme");
        } else {
          matchElement.classList.add("light-theme");
          document.body.classList.add("light-theme");
        }
        console.log("Match page - theme applied successfully:", isDark ? "dark" : "light");
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
          console.log(`Match page - retry ${retryCount}/${maxRetries}`);
          
          if (!applyThemeToElement()) {
            setTimeout(retryApply, 100 * retryCount); // Increasing delay
          }
        } else {
          console.warn("Match page - failed to apply theme after all retries");
        }
      };
      
      setTimeout(retryApply, 50);
    }
  }

  ionViewWillLeave() {
    // Clean up theme event subscription
    this.events.unsubscribe('theme:changed');
    this.events.unsubscribe('match:refresh');
  }

  // Force theme check method
  private forceThemeCheck(): void {
    console.log("Match page - forcing theme check");
    
    // Check multiple sources for theme
    this.storage.get("dashboardTheme").then((storageTheme) => {
      console.log("Match page - storage theme:", storageTheme);
      
      // Also check if body has light-theme class
      const bodyHasLightTheme = document.body.classList.contains("light-theme");
      console.log("Match page - body has light theme:", bodyHasLightTheme);
      
      // Determine final theme
      let isDark = true;
      if (storageTheme !== null && storageTheme !== undefined) {
        isDark = storageTheme;
      } else if (bodyHasLightTheme) {
        isDark = false;
      }
      
      console.log("Match page - force applying theme:", isDark ? "dark" : "light");
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
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

  // 🎨 Get color based on match type with theme support
  getMatchTypeColor(matchType: number): string {
    const isDark = this.themeService.getCurrentTheme();
    
    switch (matchType) {
      case MatchType.TEAM:
        return isDark ? '#32db64' : '#28a745'; // Green - darker in light theme
      case MatchType.SINGLES:
        return isDark ? '#35adff' : '#007bff'; // Blue - darker in light theme
      case MatchType.DOUBLES:
        return isDark ? '#f76e04' : '#fd7e14'; // Orange - slightly different in light theme
      default:
        return '#2b92bb'; // Primary blue for unknown types
    }
  }

  // 🎨 Get color based on match type name string with theme support
  getMatchTypeColorByName(matchTypeName: string): string {
    if (!matchTypeName) return 'linear-gradient(180deg, #2b92bb, #1e6c8c)';
    
    const type = matchTypeName.toLowerCase();
    
    if (type.includes('team')) {
      return 'linear-gradient(180deg, #8b5cf6, #7c3aed)';
    }
    if (type.includes('singles') || type.includes('single')) {
      return 'linear-gradient(180deg, #35adff, #007bff)';
    }
    if (type.includes('doubles') || type.includes('double')) {
      return 'linear-gradient(180deg, #f76e04, #e85d00)';
    }
    
    return 'linear-gradient(180deg, #2b92bb, #1e6c8c)';
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

  goToLineup(match) {
    this.fetchSavedFormations(match);
  }

  private fetchSavedFormations(match) {
    const deviceType = this.sharedservice.getPlatform() === "android" ? 1 : 2;
    const payload = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: "",
      activityId: match.activityId || "",
      memberId: this.sharedservice.getLoggedInId(),
      action_type: 0,
      device_type: deviceType,
      app_type: AppType.ADMIN_NEW,
      device_id: "",
      updated_by: this.sharedservice.getLoggedInId(),
      matchId: match.MatchId
    };

    this.httpService.post(API.GET_SAVED_FORMATIONS, payload)
      .subscribe(
        (res: any) => {
          const savedFormations: SavedFormation[] = res.data || [];
          this.presentLineupActionSheet(match, savedFormations);
        },
        (error) => {
          console.error("Error fetching saved formations:", error);
          // Still show the action sheet with the "Create New" option even if fetch fails
          this.presentLineupActionSheet(match, []);
        }
      );
  }

  private presentLineupActionSheet(match, savedFormations: SavedFormation[]) {
    if (!match.homeUserName || !match.awayUserName) {
      this.commonService.toastMessage('Please assign teams first', 2500, ToastMessageType.Error);
      return;
    }
    if (match.activityId !== 'd47c2ac4-e571-488f-a895-c1940726900f') {
      this.commonService.toastMessage('Team lineup data is not available for this activity', 2500, ToastMessageType.Info);
      return;
    }
    this.selectedLineupMatch = match;
    this.lineupFormations = savedFormations;
    this.showLineupSheet = true;
  }

  selectFormation(f: SavedFormation) {
    this.showLineupSheet = false;
    this.navigateToLineup(this.selectedLineupMatch, f.lineup_name, false, f.formation_setup_id, f.team_id, f.team_size);
  }

  createNewLineup() {
    this.showLineupSheet = false;
    this.navigateToLineup(this.selectedLineupMatch, '', true);
  }

  private navigateToLineup(match, lineupName: string = '', isCreateNew: boolean = false, formationSetupId: string = '', teamId: string = '', teamSize: number = 0) {
    this.navCtrl.push("LineupPage", {
      match: match,
      matchId: match.MatchId,
      activityId: match.activityId,
      homeUserId: match.homeUserId,
      awayUserId: match.awayUserId,
      homeUserName: match.homeUserName,
      awayUserName: match.awayUserName,
      lineupName: isCreateNew ? '' : (lineupName || 'Starting line-up'),
      isCreateNew: isCreateNew,
      formationSetupId: formationSetupId,
      teamId: teamId,
      teamSize: teamSize,
      isLeague: false,  // False when navigating from match page
      leagueId: ""      // Empty string for non-league context
    });
  }


  fetchAllMatches(showLoader: boolean = true) {
    if (showLoader) this.commonService.showLoader("Fetching Matches...");
    this.httpService.post(`${API.FetchAllMatches}`, this.fetchAllMatchesInput).subscribe({
      next: (res: any) => {
        if (showLoader) this.commonService.hideLoader();
        if (res) {
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
        }
      },
      error: () => { if (showLoader) this.commonService.hideLoader(); }
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

  getActivityIcon(activityName: string): string {
    if (!activityName) return 'trophy';
    const name = activityName.toLowerCase();
    const map: { [key: string]: string } = {
      'tennis': 'tennisball', 'padel tennis': 'tennisball', 'table tennis': 'tennisball',
      'football': 'football', 'badminton': 'tennisball', 'basketball': 'basketball',
      'cricket': 'baseball', 'golf': 'golf', 'swimming': 'water', 'fitness': 'fitness',
      'gymnastics': 'body', 'boxing': 'hand', 'dance': 'musical-notes', 'sing': 'mic',
      'education': 'school', 'netball': 'basketball', 'dodgeball': 'baseball',
      'squash': 'tennisball', 'bar n restaurant': 'restaurant', 'act': 'film',
      'private coaching': 'person'
    };
    return map[name] || 'trophy';
  }
}

export class FetchMatchesInput {
  FetchType: number;
  user_postgre_metadata: {
    UserParentClubId: string
  }
}



