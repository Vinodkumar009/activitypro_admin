import { Component } from "@angular/core";
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController,
} from "ionic-angular";
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
import { GraphqlService } from "../../../../services/graphql.service";
import { Activity, ClubActivityInput, IClubDetails } from "../../../../shared/model/club.model";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { RoundTypeInput, RoundTypesModel } from "../../../../shared/model/league.model";
import { AppType } from "../../../../shared/constants/module.constants";
import { LeagueVenueType } from "../../../../shared/utility/enums";

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
  publicType: boolean = true;
  privateType: boolean = true;
  selectedClub: any;
  clubs: IClubDetails[];
  roundTypes: RoundTypesModel[] = [];

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

  ActivityKey: string
  createMatchInput: CreateMatchInput = {
    Round: 0,
    MatchType: 0,
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
    MemberFees: 0.00,
    NonMemberFees: 0.00,
    Hosts: {
      UserId: "",
      RoleType: 2,
      UserType: 2
    },
    user_postgre_metadata: new UserPostgreMetadataField,
    user_device_metadata: new UserDeviceMetadataField,
    location_id: '',
    location_type: 0
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
    private graphqlService: GraphqlService,
    private httpService: HttpService

  ) {
    this.startDate = moment().format("YYYY-MM-DD");
    this.startTime = "09:00";
    // this.CreateMatchInput.MatchStartDate = moment((moment().add(1, 'days'))).format("YYYY-MM-DD");
    // this.monthlySessionObj.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.monthlySessionObj.StartDate, this.monthlySessionObj.EndDate);
    // let now = moment().add(10, 'year');
    // this.maxDate = moment(now).format("YYYY-MM-DD");
    // this.minDate = moment().format("YYYY-MM-DD");
    this.createMatchInput.CreatedBy = this.sharedservice.getLoggedInUserId();
    this.createMatchInput.Hosts.UserId = this.sharedservice.getLoggedInUserId();
    this.createMatchInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    this.createMatchInput.user_device_metadata.UserActionType = 2
  }

  ionViewDidLoad() { }

  ionViewWillEnter() {
    console.log("ionViewDidLoad CreatematchPage");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      this.roundTypeInput.parentclubId = this.sharedservice.getPostgreParentClubId();
      this.roundTypeInput.clubId = val.$key;
      this.roundTypeInput.action_type = 0;
      this.roundTypeInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
      this.roundTypeInput.app_type = AppType.ADMIN_NEW;

      // this.getAllActivities();
      // this.getClubVenues();
      // this.saveMatchDetails();
      this.getListOfClub();
      this.getRoundTypes();
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
  getRoundTypes() {
    this.commonService.showLoader("Fetching info ...");

    this.httpService.post(`${API.Get_Round_Types}`, this.roundTypeInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.roundTypes = res.data || [];
        console.log("Get_Round_Types RESPONSE", JSON.stringify(res.data));

      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
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

  getListOfClub() {
    const clubs_input = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInUserId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
      }
    }
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe((res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
        if (this.clubs.length > 0) {
          this.selectedClub = this.clubs[0].Id;
          //  this.selectedClub = this.clubs[0].FirebaseId; // Set default selected club
          //this.getActivityList(); // Fetch the activities for the default club
          this.getClubActivity();
        }

      },
        (error) => {
          this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error)
          console.error("Error in fetching:", error);
        })
  }


  onChangeOfClub() {
    this.club_activities = [];
    this.getClubActivity();
  }


  getClubActivity() {
    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.clubId = this.selectedClub;
    this.httpService.post(`${API.CLUB_ACTIVITIES}`, this.commonInput).subscribe((res: any) => {
      console.log("club activities", JSON.stringify(res.data.club_activities));
      if (res.data.club_activities.length > 0) {
        this.activities = res.data.club_activities;
        this.activityId = this.activities[0].id;
        console.log("activity", this.activityId);
      }
    }, (error) => {
      this.commonService.toastMessage("activity fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    })
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

     else if ((this.createMatchInput.MatchPaymentType == 1) && ((this.createMatchInput.MemberFees) <= 0 || this.createMatchInput.MemberFees == undefined || this.createMatchInput.MemberFees == 0.00)) {
      const message = "Enter member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
     else if ((this.createMatchInput.MatchPaymentType == 1) && ((this.createMatchInput.NonMemberFees) <= 0 || this.createMatchInput.NonMemberFees == undefined || this.createMatchInput.NonMemberFees == 0.00)) {
      const message = "Enter non-member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }

    return true;
  }

  saveMatchDetails() {
    if(this.validateInput()) {
      try{
        this.commonService.showLoader();
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
        console.log("MATCH Input", JSON.stringify(this.createMatchInput));

        const createMatch = gql`
              mutation saveMatchDeatils($matchInput: CreateMatchInput!) {
                saveMatchDeatils(matchInput: $matchInput) {
                  Id
                  IsActive
                  IsEnable
                  Activity {
                    ActivityName
                    ActivityCode
                  }
                  Hosts {
                    Name
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
                  Result {
                    ResultStatus
                    ResultDetails
                  }
                  Capacity
                  MatchTitle
                }
              }
            `;
          const mutationVaribale = { matchInput: this.createMatchInput };
          this.graphqlService.mutate(createMatch, mutationVaribale, 0).subscribe((res: any) => {
            // this.commonService.hideLoader();
            this.commonService.showLoader();
            const message = "Match created successfully";
            this.commonService.updateCategory("match");
            this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.navCtrl.pop();
            //this.navCtrl.pop().then(() => this.navCtrl.pop());
          }, (err) => {
            this.commonService.hideLoader();
            if(err.errors && err.errors.length > 0){
              this.commonService.toastMessage(err.errors[0].message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            } else {
              this.commonService.toastMessage("Match creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
            console.error("Error in fetching:", err);
          })
      }catch(e){
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
  MemberFees: number;
  NonMemberFees: number;
  user_postgre_metadata: UserPostgreMetadataField
  user_device_metadata: UserDeviceMetadataField;
  location_id: string;
  location_type: number;
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

