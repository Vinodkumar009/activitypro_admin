import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController,
  Events
} from "ionic-angular";
import { ThemeService } from "../../../../services/theme.service";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import { MatchModel } from "../models/match.model";
import moment from "moment";
import { ClubVenue, SchoolVenue } from "../models/venue.model";
import { Activities, Activity, ClubActivityInput, IClubDetails } from "../../../../shared/model/club.model";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { RoundTypeInput, RoundTypesModel } from "../../../../shared/model/league.model";
import { AppType } from "../../../../shared/constants/module.constants";
import { LeagueVenueType } from "../../../../shared/utility/enums";
import { CatandType } from "../../league/models/location.model";
import { MatchDuration } from "../../../../shared/model/match.model";
/**
 * Generated class for the CreatematchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-creatematch",
  templateUrl: "creatematch.html",
  providers: [HttpService]
})
export class CreatematchPage {
  isDarkTheme: boolean = false;
  publicType: boolean = true;
  privateType: boolean = true;
  selectedClub: any;
  clubs: IClubDetails[];
  roundTypes: RoundTypesModel[] = [];
  durations: MatchDuration[] = [];
  selectedDuration: number;
  currency: string;
  isRecurring: boolean = false;
  recurringUntilWhen: string = moment().add(1, 'week').format('YYYY-MM-DD');
  

  roundTypeInput: RoundTypeInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  leagueType: CatandType[] = [];
  leagueCategory: CatandType[] = [];
  ActivityKey: string
  createMatchInput: CreateMatchInput = {
    Round: 0,
    MatchType: 1,
    MatchVenueName: "",
    MatchVenueId: '',
    MatchVenueKey: "",
    GameType: 0,
    MatchTitle: "",
    CreatedBy: "",
    MatchCreator: 2,
    MatchStartDate: null,
    MatchEndDate: null,
    MatchVisibility: 0,
    MatchStatus: 0,
    MatchDetails: "",
    MatchPaymentType: 0,
    MemberFees: '0.00',
    NonMemberFees: '0.00',
    Hosts: {
      UserId: "",
      RoleType: 2,
      UserType: 2
    },
    user_postgre_metadata: new UserPostgreMetadataField,
    user_device_metadata: new UserDeviceMetadataField,
    location_id: '',
    location_type: 0,
    MatchDuration: ''
  };
  saveMatches: MatchModel[] = [];
  clubVenues: ClubVenue[] = [];
  schoolVenues: SchoolVenue[] = [];
  selectedSchool = [];

  startDate: any;
  startTime: any;

  // parentClubKey: string;
  parentClubKey: string = "-KuAlAWygfsQX9t_RqNZ";
  // selectedActivityType: any;
  allactivity = [];
  types = [];
  arrow = false;
  today = moment().format("YYYY-MM-DD");
  maxDate = moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY")
    .add(10, "years")
    .format("YYYY-MM-DD");

  club_activities: Activity[] = [];
  activities = [];
  activityId: string = "";
  commonInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: ""
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private httpService: HttpService,
    private themeService: ThemeService,
    private events: Events
  ) {
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
    this.startDate = moment().format("YYYY-MM-DD");
    this.startTime = "09:00";
    // this.CreateMatchInput.MatchStartDate = moment((moment().add(1, 'days'))).format("YYYY-MM-DD");
    // this.monthlySessionObj.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.monthlySessionObj.StartDate, this.monthlySessionObj.EndDate);
    // let now = moment().add(10, 'year');
    // this.maxDate = moment(now).format("YYYY-MM-DD");
    // this.minDate = moment().format("YYYY-MM-DD");
    this.createMatchInput.CreatedBy = this.sharedservice.getLoggedInUserId() || this.sharedservice.getLoggedInId();
    this.createMatchInput.Hosts.UserId = this.sharedservice.getLoggedInUserId() || this.sharedservice.getLoggedInId();
    this.createMatchInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    this.createMatchInput.user_device_metadata.UserActionType = 2
  }

  ionViewDidLoad() {
    this.loadTheme();
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  private loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      const isDark = isDarkTheme !== null ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  private applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector('page-creatematch');
    if (pageElement) {
      if (isDark) {
        pageElement.classList.remove('light-theme');
      } else {
        pageElement.classList.add('light-theme');
      }
    }
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.applyTheme(isDark);
    });
    console.log("ionViewDidLoad CreatematchPage");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      this.roundTypeInput.parentclubId = this.sharedservice.getPostgreParentClubId();
      this.roundTypeInput.clubId = val.$key;
      this.roundTypeInput.action_type = 0;
      this.roundTypeInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
      this.roundTypeInput.app_type = AppType.ADMIN_NEW;

      this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();

      // this.getAllActivities();
      // this.getClubVenues();
      // this.saveMatchDetails();
      this.getMatchTypes();
      this.getListOfClub();
      this.getRoundTypes();
      this.getLeagueCategory();
      this.getDurations();
    });
    this.storage.get('Currency').then((currency) => {
      if (currency) { const c = JSON.parse(currency); this.currency = c.CurrencySymbol; }
    });
  }

  gotoDashboard() {
    this.navCtrl.pop();
  }
  gotoMatch(save) {
    this.navCtrl.push("MatchPage", {
      selectedMatchId: save.Id,
      // selectedParentCubKey: this.createMatchInput.ParentClubKey,
    });
  }
  gotoHome() {
    this.navCtrl.push("Dashboard");
  }

  getMatchTypes() {
    this.httpService.post(`${API.GET_LEAGUE_OR_MATCH_TYPES}`, this.commonInput).subscribe({
      next: (res: any) => {
        this.leagueType = res["data"];
      }
    });
  }

  getLeagueCategory() {
    this.httpService.post(`${API.GET_LEAGUE_CATEGORIES}`, this.commonInput).subscribe({
      next: (res: any) => {
        this.leagueCategory = res["data"]
        console.table(`${this.leagueCategory}`);
        if (this.leagueCategory.length > 0) this.createMatchInput.GameType = 0;
      }
    });
  }

  getRoundTypes() {
    this.httpService.post(`${API.Get_Round_Types}`, this.roundTypeInput).subscribe({
      next: (res: any) => {
        if (res) {
          this.roundTypes = res.data || [];
          console.log("Get_Round_Types RESPONSE", JSON.stringify(res.data));
        } else {
          console.log("error in fetching")
        }
      }
    });
  }

  getDurations() {
    const input = { ...this.commonInput, app_type: AppType.ADMIN_NEW };
    this.httpService.post(`${API.GET_DURATIONS}`, input).subscribe({
      next: (res: any) => { this.durations = res.data || []; if (this.durations.length > 0) this.selectedDuration = this.durations[0].id; }
    });
  }

  changeType(val) {
    this.publicType = val == "public" ? true : false;
    //this.privateType = 'private'? true : false;
    this.createMatchInput.MatchVisibility = val == "private" ? 1 : 0;
  }

  selectClubName() {
    this.club_activities = [];
  }

  updateMatchPaymentType(isChecked: boolean): void {
    this.createMatchInput.MatchPaymentType = isChecked ? 1 : 0;
  }

  getRecurringDayName(): string {
    return moment(this.startDate).format('dddd');
  }

  getListOfClub() {
    const body = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      club_id: '',
      activity_id: '',
      member_id: this.sharedservice.getLoggedInUserId(),
      action_type: 0,
      device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || 'web',
      updated_by: this.sharedservice.getLoggedInUserId()
    };
    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: any) => {
        this.clubs = res.data || [];
        if (this.clubs.length > 0) {
          this.selectedClub = this.clubs[0].Id;
          this.autoFillLocation();
          this.getClubActivity();
        }
      },
      error: () => {
        this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error);
      }
    });
  }


  onChangeOfClub() {
    this.club_activities = [];
    this.getClubActivity();
    this.autoFillLocation();
  }

  autoFillLocation() {
    const club = this.clubs.find(c => c.Id === this.selectedClub);
    if (!club) { this.mapLocationAddress = ''; this.mapLocationLat = null; this.mapLocationLng = null; return; }
    const parts = [club.FirstLineAddress, club.PostCode].filter(Boolean);
    this.mapLocationAddress = parts.join(', ');
    this.mapLocationLat = club.MapLatitude ? parseFloat(club.MapLatitude) : null;
    this.mapLocationLng = club.MapLongitude ? parseFloat(club.MapLongitude) : null;
  }

  mapLocationAddress: string = '';
  mapLocationLat: number = null;
  mapLocationLng: number = null;

  onMapLocationSelected(location: any) {
    this.mapLocationAddress = location.address || '';
  }


  getClubActivity() {
    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.clubId = this.selectedClub;
    this.httpService.post(`${API.CLUB_ACTIVITIES}`, this.commonInput).subscribe({
      next: (res: any) => {
        console.log("club activities", JSON.stringify(res.data.club_activities));
        if (res.data.club_activities.length > 0) {
          this.activities = res.data.club_activities;
          this.activityId = this.activities[0].id;
          console.log("activity", this.activityId);
        }
      }
    });
  }

  validateInput() {
    if (this.startTime == "" || this.startTime == undefined) {
      const message = "Please enter a valid start date";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if (this.createMatchInput.MatchTitle == "" || this.createMatchInput.MatchTitle == undefined) {
      let message = "Please enter match title";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    //  if(this.createMatchInput.location_id==""||this.createMatchInput.location_id==undefined){
    //   let message="Please select location";
    //   this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
    //   return false;
    // }

    else if ((this.createMatchInput.MatchPaymentType == 1) && (parseFloat(this.createMatchInput.MemberFees) <= 0.00 || this.createMatchInput.MemberFees == undefined)) {
      const message = "Enter member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if ((this.createMatchInput.MatchPaymentType == 1) && (parseFloat(this.createMatchInput.NonMemberFees) <= 0.00 || this.createMatchInput.NonMemberFees == undefined)) {
      const message = "Enter non-member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if (this.isRecurring && !this.recurringUntilWhen) {
      this.commonService.toastMessage("Select until when date", 2500, ToastMessageType.Error);
      return false;
    }
    else if (this.isRecurring && moment(this.recurringUntilWhen).isSameOrBefore(moment(this.startDate))) {
      this.commonService.toastMessage("Until when must be after start date", 2500, ToastMessageType.Error);
      return false;
    }

    return true;
  }

  saveMatchDetails() {
    if (this.validateInput()) {
      try {
        this.commonService.showLoader("Please wait...");
        const postgreClub = this.clubs.find(clubName => clubName.Id === this.selectedClub);
        console.log("club", postgreClub);
        this.createMatchInput.MatchVenueKey = postgreClub.FirebaseId;
        this.createMatchInput.MatchVenueName = postgreClub.ClubName;
        this.createMatchInput.MatchVenueId = postgreClub.Id;
        const selected_activity = this.activities.find(activity => activity.id === this.activityId);
        this.createMatchInput.user_postgre_metadata.UserActivityId = selected_activity.activity.Id;
        this.createMatchInput.location_id = postgreClub.Id;
        this.createMatchInput.location_type = LeagueVenueType.Club;

        this.createMatchInput.Round = Number(this.createMatchInput.Round);
        this.createMatchInput.MatchStartDate = moment(
          new Date(this.startDate + " " + this.startTime).getTime()
        ).format("YYYY-MM-DD HH:mm");
        this.createMatchInput.MatchEndDate = moment(
          new Date(this.startDate + " " + '23:59').getTime()
        ).format("YYYY-MM-DD HH:mm");
        console.log(JSON.stringify(this.createMatchInput));
        console.log(new Date(this.startDate + " " + 'this.startTime').getTime());
        this.createMatchInput.GameType = Number(this.createMatchInput.GameType);
        this.createMatchInput.MatchType = +this.createMatchInput.MatchType;
        const selectedDur = this.durations.find(d => d.id === this.selectedDuration);
        this.createMatchInput.MatchDuration = selectedDur ? String(selectedDur.duration) : '';
        console.log("MATCH Input", JSON.stringify(this.createMatchInput));

        const restPayload = {
          parentclubId: this.createMatchInput.user_postgre_metadata.UserParentClubId,
          clubId: '',
          activityId: '',
          memberId: this.createMatchInput.CreatedBy,
          action_type: 0,
          device_type: this.createMatchInput.user_device_metadata.UserDeviceType,
          app_type: AppType.ADMIN_NEW,
          device_id: '',
          updated_by: this.createMatchInput.CreatedBy,
          parentclubTeamId: '',
          Round: this.createMatchInput.Round,
          MatchType: this.createMatchInput.MatchType,
          MatchVenueName: this.createMatchInput.MatchVenueName,
          MatchVenueId: this.createMatchInput.MatchVenueId,
          MatchVenueKey: this.createMatchInput.MatchVenueKey,
          GameType: this.createMatchInput.GameType,
          MatchTitle: this.createMatchInput.MatchTitle,
          CreatedBy: this.createMatchInput.CreatedBy,
          MatchCreator: this.createMatchInput.MatchCreator,
          MatchStartDate: this.createMatchInput.MatchStartDate,
          MatchEndDate: this.createMatchInput.MatchEndDate,
          MatchVisibility: this.createMatchInput.MatchVisibility,
          Hosts: [this.createMatchInput.Hosts],
          MatchStatus: this.createMatchInput.MatchStatus,
          MatchDetails: this.createMatchInput.MatchDetails,
          MatchPaymentType: this.createMatchInput.MatchPaymentType,
          MemberFees: Number(this.createMatchInput.MemberFees) || 0,
          NonMemberFees: Number(this.createMatchInput.NonMemberFees) || 0,
          location_type: this.createMatchInput.location_type,
          location_id: this.createMatchInput.location_id,
          location: this.mapLocationAddress || '',
          MatchDuration: this.createMatchInput.MatchDuration,
          UserParentClubId: this.createMatchInput.user_postgre_metadata.UserParentClubId,
          UserActivityId: this.createMatchInput.user_postgre_metadata.UserActivityId,
          user_postgre_metadata: this.createMatchInput.user_postgre_metadata,
          user_device_metadata: this.createMatchInput.user_device_metadata,
          UserActionType:2,
          UpdatedBy: this.createMatchInput.CreatedBy
        };

        if (this.isRecurring) {
          restPayload['untilWhen'] = moment(this.recurringUntilWhen).format("YYYY-MM-DD");
        }

        const apiUrl = this.isRecurring ? API.CREATE_RECURRING_MATCHES : API.CREATE_MATCH;
        const successMsg = this.isRecurring ? "Recurring matches created successfully" : "Match created successfully";

        this.httpService.post(`${apiUrl}`, restPayload).subscribe((res: any) => {
          this.commonService.hideLoader();
          this.commonService.updateCategory("match");
          this.events.publish('match:refresh');
          this.commonService.toastMessage(successMsg, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.navCtrl.pop();
        }, (err) => {
          this.commonService.hideLoader();
          const msg = (err.error && err.error.message) ? err.error.message : "Match creation failed";
          this.commonService.toastMessage(msg, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error:", err);
        })
      } catch (e) {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Match creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }
}
export class CreateMatchInput {
  Round: number
  Hosts: {
    UserId: string;
    RoleType: number;
    UserType: number;
  };


  MatchType: number;
  MatchVenueName: string;
  MatchVenueId: string;
  MatchVenueKey: any;
  GameType: number;
  MatchTitle: string;
  CreatedBy: string;
  MatchCreator: number;
  MatchStartDate: any;
  MatchEndDate: any;
  MatchVisibility: number;
  MatchStatus: number;
  MatchDetails: string;

  MatchPaymentType: number;
  MemberFees: string;
  NonMemberFees: string;
  user_postgre_metadata: UserPostgreMetadataField
  user_device_metadata: UserDeviceMetadataField;
  location_id: string;
  location_type: number;
  MatchDuration: string;
}


export class UserPostgreMetadataField {
  UserParentClubId: string
  UserClubId: string
  UserMemberId: string
  UserActivityId: string
}

export class UserDeviceMetadataField {
  UserAppType: number
  UserActionType: number
  UserDeviceType: number
  UpdatedBy: number
}

