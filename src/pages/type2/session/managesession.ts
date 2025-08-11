import { Component,ViewChild } from "@angular/core";
import {
  ActionSheetController,
  LoadingController,
  NavController,
  Platform,
  FabContainer,
} from "ionic-angular";
import { PopoverController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Events } from "ionic-angular";
import { SharedServices } from "../../services/sharedservice";
import { HttpClient } from "@angular/common/http";
import { FirebaseService } from "../../../services/firebase.service";
import { CommonService,ToastPlacement,ToastMessageType,} from "../../../services/common.service";
import * as $ from "jquery";
import moment from "moment";
import { IonicPage, AlertController, ToastController } from "ionic-angular";
import { first, take } from "rxjs/operators";
import { Subscription } from "rxjs/Subscription";
import { GraphqlService } from "../../../services/graphql.service";
import gql from "graphql-tag";
import { GroupSession } from "./sessions.model";
import { IClubCoaches, IClubDetails } from "../../../shared/model/club.model";
import { MonthlySession } from "./monthlysession/model/monthly_session.model";
import { DrawerState } from "ion-bottom-drawer";
import { WeeklySessionList } from "./weekly/weekly.model";
import { setDay } from "../../../shared/utility/utility"
import { ModuleTypes } from "../../../shared/constants/module.constants";

@IonicPage()
@Component({
  selector: "managesession-page",
  templateUrl: "managesession.html",
})
export class Type2ManageSession {
  searchInput: string = "";
  session_count:number = 0;
  weekly_session_count: number = 0;
  @ViewChild("fab") fab: FabContainer;
  $SessionsSubcriber: Subscription;
  $ClubSubcriber: Subscription;
  $CoachSubcriber: Subscription;
  //bottom drawer variables
  shouldBounce = true;
  dockedHeight = 40;
  distanceTop = 0;
  drawerState = DrawerState.Docked;
  states = DrawerState;
  minimumHeight = 40;
  Tempfootermenu: Array<any> = [
    { DisplayName: "Term", Icon: "",img:"assets/images/term.svg", Index: 0, IsSelect: false },
    { DisplayName: "Weekly", Icon: "",img:"assets/images/week.svg", Index: 1, IsSelect: false },
    { DisplayName: "Monthly", Icon: "", Index: 2,img:"assets/images/month.svg", IsSelect: false },
    // { DisplayName: "Day", Icon: "ios-calendar", Index: 2, IsSelect: false },
    //{ DisplayName: "Category", Icon: "ios-albums", Index: 3, IsSelect: false },
    { DisplayName: "History", Icon: "ios-timer",img:"", Index: 4, IsSelect: false },//assets/images/history.png
  ];

  activeFooter: string = "";
  footermenu: Array<any> = [
    // { DisplayText: "Coach", icon: "contacts", imgUrl: "", component: "", isSelected: false },
    // { DisplayText: "Type", icon: "ios-more", imgUrl: "", component: "MenupagePage", isSelected: false },
    // { DisplayText: "Category", icon: "tennisball", imgUrl: "", component: "Type2HolidayCamp", isSelected: false },
    // { DisplayText: "Activity", icon: "contacts", imgUrl: "", component: "MembershipPage", isSelected: false },
    {
      DisplayText: "Active Sessions",
      icon: "",
      imgUrl:
        "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FMemberApp%2Factive.svg?alt=media&token=1cc3eefc-9517-4b22-a76c-e528cc39e885",
      component: "Type2ManageSession",
      isSelected: false,
    },
    {
      DisplayText: "History",
      icon: "",
      imgUrl: "assets/imgs/history-icon.svg",
      component: "Type2ManageSession",
      isSelected: false,
    },
  ];
  navigate;
  isShowPaymentModal: boolean = false;
  LangObj: any = {}; //by vinod
  themeType: number;
  isAndroid: boolean = false;
  
  myIndex: number = -1;
  currencyDetails = {
    CurrencySymbol: "",
  };
  
  term_sessions: GroupSession[] = [];
  weekly_sessions: WeeklySessionList[] = [];
  monthly_sessions: MonthlySession[] = [];
  filter_term_sessions: GroupSession[] = [];
  filter_weekly_sessions: WeeklySessionList[] = [];
  filter_monthly_sessions: MonthlySession[] = [];

  //variable
  sessionMemberLength = [];
  paidMemberLength = [];
  sessionStrength: string = "Group";
  selectedTabValue: string = "Group";
  parentClubKey: any;
  coachList: any;
  clubs: IClubDetails[] = [];
  selectedClub: any;
  coaches: any = [];
  selectedCoach: any;
  sessionObj = [];
  sessionMemberDetails: Array<any> = [];

  isShowMessage1 = false;
  isShowMessage2 = false;
  isShowMessage3 = false;
  isShowMessage4 = false;
  //for one to one session
  onetooneSessionMember = [];
  clubsForOneToOne: any;
  selectedClubForOneToOne: any;
  coachesForOneToOne: any;
  selectedCoachForOneToOne: any;
  sessionObjForOneToOne = [];

  //for one to one session
  familySessionMember = [];
  clubsForFamily: any;
  selectedClubForFamily: any;
  coachesForFamily: any;
  selectedCoachForFamily: any;
  sessionObjForFamily = [];
  familyIndex: number = -1;
  familyMemberList = [];

  MemberListsForDeviceToken = [];

  loading: any;
  sessionType: boolean = false;
  activeSessionList = [];
  pastSessionList = [];
  nestUrl: string = "";
  selectedActivity = "";

  past = [];
  pre = [];
  activityList = [];
  category = [];
  backupcategory = [];
  dayList = [
    { Name: "Mon", DisplayName: "Monday", SessionCount: 0 },
    { Name: "Tue", DisplayName: "Tuesday", SessionCount: 0 },
    { Name: "Wed", DisplayName: "Wednesday", SessionCount: 0 },
    { Name: "Thu", DisplayName: "Thursday", SessionCount: 0 },
    { Name: "Fri", DisplayName: "Friday", SessionCount: 0 },
    { Name: "Sat", DisplayName: "Saturday", SessionCount: 0 },
    { Name: "Sun", DisplayName: "Sunday", SessionCount: 0 },
  ];

  switchfilterpage = 1; // 1 - all, 2 - Coach, 3 - day, 4 - category, 5 - history
  backupSession: any;
  isClearStorage: boolean = false;
  isFirstTime: boolean = true;
  pages = [];


  sessionListingInput: SessionListingInput = {
    ParentClubKey: "",
    PostgresFields:{
      PostgresParentclubId:"",
      PostgresClubId:"",
      PostgresCoachId:""
    },
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    SessionType: 0,
    GroupStatus: 0,
    ActivityKey: "",
    Start_Date: "",
    End_Date: ""
  }
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;

  weeklySessionListingInput: WeeklySessionListingInput = {
    PostgresFields: {
      PostgresParentclubId: "",
      PostgresClubId: "",
      PostgresCoachId:"",
      PostgresActivityId: ""
    },
    AppType: 0,
    fetchForMember:false
  }
  canShowTerm:boolean = true;
  canShowWeekly:boolean = true;
  canShowMonthly:boolean = true;
  postgre_parentclub_id:string = "";
  constructor(
    public events: Events,
    public storage: Storage,
    public http: HttpClient,
    public commonService: CommonService,
    public actionSheetCtrl: ActionSheetController,
    public commonservice: CommonService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public fb: FirebaseService,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public platform: Platform,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,
  ) {
    this.nestUrl = this.sharedservice.getnestURL();
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is("android");
    // this.dockedHeight = this.isAndroid ? 40 : 60;
    // this.distanceTop = this.platform.height() - 150;
    
  }


  ionViewWillEnter() {
    this.commonService.category.pipe(first()).subscribe(async(data) => {
      //this.loggedin_type = this.sharedservice.getLoggedInType();
      this.loggedin_type = await this.storage.get("memberType");
      if (data == "update_session_list") {
        this.term_sessions = [];
        this.weekly_sessions = [];
        this.monthly_sessions = [];
        this.filter_term_sessions = [];
        this.filter_weekly_sessions = [];
        this.filter_monthly_sessions = [];
        const [login_obj,postgre_parentclub] = await Promise.all([
          this.storage.get('userObj'),
          this.storage.get('postgre_parentclub'),
        ])
    
        if(login_obj) {
          this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
          if(this.loggedin_type === 4){
            this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
            const coach_id = await this.getCoachIdsByFirebaseKeys([JSON.parse(login_obj).UserInfo[0].CoachKey])
            this.sessionListingInput.PostgresFields.PostgresCoachId = coach_id;
            this.weeklySessionListingInput.PostgresFields.PostgresCoachId = coach_id;
          }
        }
        if(postgre_parentclub){
           this.postgre_parentclub_id = postgre_parentclub.Id
            console.log("parentclubid is:", this.postgre_parentclub_id);
            //this.sessionListingInput.MemberKey = "-Mxz0GN_oifPEP13Ybkg"
            this.sessionListingInput.AppType = 0
            this.sessionListingInput.ActionType = 1
            this.sessionListingInput.DeviceType = 1
            this.sessionListingInput.SessionType = 100
            this.sessionListingInput.GroupStatus = 1
            this.sessionListingInput.ActivityKey = ""
            
            //weekkly list input
            this.weeklySessionListingInput.PostgresFields.PostgresParentclubId = this.postgre_parentclub_id;
            this.sessionListingInput.PostgresFields.PostgresParentclubId = this.postgre_parentclub_id;
            this.sessionListingInput.PostgresFields.PostgresActivityId = "";
            this.weeklySessionListingInput.PostgresFields.PostgresActivityId = ""
            
            //this.commonService.showLoader("Please wait");
            this.Tempfootermenu = this.Tempfootermenu.map(menu => {
              menu.IsSelect = menu.DisplayName === "Term";
              return menu;
            });
            
            
            this.getClubList();
        }
        
      }
    });
    

    this.storage
      .get("Currency")
      .then((val) => {
        this.currencyDetails = JSON.parse(val);
      })
      .catch((error) => { });
  }

  

  ionViewDidLoad() {
    console.log("ionViewDidLoad MemberprofilePage");
    this.getLanguage();
    this.events.subscribe("language", (res) => {
      this.getLanguage();
    });
  }
  //added by vinod
  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    });
  }

  //added by vinod ends here

  goToDashBoard() {
    this.navCtrl.setRoot("Dashboard");
  }

  
  ionViewDidEnter() {
    if (this.fab) {
      this.fab.close();
    }
  }

  getFormattedDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MMM-YYYY");
  }


  onChangeOfClub() {
    // this.isShowMessage1 = false;
    // this.isShowMessage2 = false;
    // this.isShowMessage3 = false;
    // this.isShowMessage4 = false;
    if(this.switchfilterpage === 2){
      this.weeklySessionListingInput.PostgresFields.PostgresClubId = this.clubs.find(club => club.FirebaseId === this.selectedClub).Id;
    }else{
      this.sessionListingInput.PostgresFields.PostgresClubId = this.selectedClub.toLowerCase()!='all' ? this.clubs.filter(club => club.FirebaseId == this.selectedClub)[0].Id:"";
    }
    
    this.sessionObj = [];
    this.coaches = [];
    if(this.loggedin_type!= 4){
      this.getCoachLists();
    }else{
      this.checkListToGetSessions();
    }

  }
  async onChangeOfCoach() {
    // this.isShowMessage1 = false;
    // this.isShowMessage2 = false;
    // this.isShowMessage3 = false;
    // this.isShowMessage4 = false;
    this.sessionObj = [];
    if (this.selectedCoach == "All") {
      if(this.switchfilterpage === 2){
        this.weeklySessionListingInput.PostgresFields.PostgresCoachId = "";
      }else{
        this.sessionListingInput.PostgresFields.PostgresCoachId = "";
      }
    } else {
      if(this.switchfilterpage === 2){
        this.weeklySessionListingInput.PostgresFields.PostgresCoachId = await this.getCoachIdsByFirebaseKeys([this.selectedCoach]);
      }else{
        this.sessionListingInput.PostgresFields.PostgresCoachId = await this.getCoachIdsByFirebaseKeys([this.selectedCoach]);
      }
    }
    this.checkListToGetSessions();
  }

  //
  //get club list in group segment
  //
  //calling from constructor
  //calling from sessionTabClick method click
  //

  getClubList() {
    const clubs_input = {
      parentclub_id:this.postgre_parentclub_id,
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
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
          this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
            .subscribe((res: any) => {
              this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
              //console.log("clubs lists:", JSON.stringify(this.clubs));
              //this.selectedClub = this.clubs[0].FirebaseId;
              this.sessionListingInput.PostgresFields.PostgresClubId = this.clubs[0].Id
              this.selectedClub = "All";
              this.sessionListingInput.PostgresFields.PostgresClubId = "";
              if(this.loggedin_type!= 4){
                this.checkPaymentSetup();
                this.getCoachLists();
              }else{
                this.checkListToGetSessions();
              }
            },
           (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
  }

  //get coachlist accoridng to club list
  //calling from getClubList method
  getCoachLists() {
    const coachInput = {
      parentclub:this.selectedClub.toLowerCase() == "all" ? this.postgre_parentclub_id :this.parentClubKey,
      club:this.selectedClub.toLowerCase() == "all" ? "":this.selectedClub,
      fetch_from:this.selectedClub.toLowerCase() == "all" ? 1:0
    }
    const coaches_query = gql`
    query getClubCoaches($coachInput: CoachFetchInput!){
      getClubCoaches(coachInput:$coachInput){
          Id
          coach_firebase_id
          first_name
          last_name
          gender
          email_id 
        }
    }
    `;
      this.graphqlService.query(coaches_query,{coachInput},0)
        .subscribe((res: any) => {
          this.coaches = res.data.getClubCoaches as IClubCoaches[];
          console.log("clubs lists:", JSON.stringify(this.coaches));
          this.selectedCoach = "All";
          this.isShowMessage4 = true;
          
          this.checkListToGetSessions();
        },
       (error) => {
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       })    
  }


  checkListToGetSessions(){
    if(this.switchfilterpage == 1){
      this.getSessionListData();
    }
    else if(this.switchfilterpage == 2){
      this.getWeeklySessions();
    }else{ // this.switchfilterpage == 3
      this.getMonthlySessions();
    }
  }

  //***This is the new postgres code ,which will bind to get the list screen data */
  //***First One is Venue Api */
  getSessionListData() {
    this.term_sessions = [];
    this.filter_term_sessions = [];
    this.session_count = 0;
    //this.commonService.showLoader("Please wait");
    console.log("Get Session List Api Called");
    //session_fee,session_fee_for_nonmember
    const sessionList = gql`
      query getSessionList($sessionDetailsInput: SessionListingInput!) {
        getSessionList(sessionDetailsInput: $sessionDetailsInput) {
          id
          session_name
          term_name
          firebase_sessionkey
          firebase_clubkey
          group_status
          ParentClubDetails {
            ParentClubName
         }
         ActivityDetails {
          ActivityName
        }
        ClubDetails {
           ClubName
           FirebaseId
        }
        firebase_clubkey
        firebase_activitykey
        activity_category_name
        activity_subcategory_name
        duration
        days
        no_of_weeks
        Coach {
          coach_firebase_id
          first_name
          last_name
          profile_image
        }
        start_time
        end_time
        start_date
        end_date
        group_size
        session_fee
        session_fee_for_nonmember
        tot_enrol_count
        pending_count	
        paid_count
        }
      }
    `;
    this.graphqlService
      .query(
        sessionList, { sessionDetailsInput: this.sessionListingInput }, 0
      )
      .subscribe(({ data }) => {
        //this.commonService.hideLoader();
        console.log("sessionlist data" + JSON.stringify(data["getSessionList"]));
        if(data["getSessionList"].length > 0){
          this.term_sessions = data["getSessionList"] as GroupSession[];
          this.filter_term_sessions = JSON.parse(JSON.stringify(this.term_sessions));
        }else{
          this.commonservice.toastMessage("No session(s) found",1000,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        this.session_count = this.filter_term_sessions.length;
      });
    (err) => {
      //this.commonService.hideLoader();
      console.log(JSON.stringify(err));
      this.commonService.toastMessage("Failed to fetch list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    };
  };

  //getting weekly sessions list
  getWeeklySessions() {
    this.weekly_sessions = [];
    this.filter_weekly_sessions = [];
    this.session_count = 0;
    //this.commonService.showLoader("Please wait");
    console.log("input giving for weekly list:", this.weeklySessionListingInput);
    // category
    // sub_category
    const sessionList = gql`
    query getWeeklySessions($input: SessionListingInput!) {
      getWeeklySessions(input: $input) {
        id
        session_name
        category_name
        sub_category_name
        description
        age_group
        ClubKey
        club_id
        ClubName
        days
        ParentClub{
          ParentClubName
        }
        club{
          ClubName
          FirebaseId
        }
        ActivityDetails{
          ActivityName
        }
        start_date
        start_time
        end_time
        session_type
        end_date
        fee_for_member
        fee_for_nonmember
        duration
        firebase_categorykey
        firebase_subcategorykey
        coach_names
        coach_images
        allow_paylater
        private_status
        enrol_count
        booking_count
      }
    }
  `;

    this.graphqlService
      .query(
        sessionList, { input: this.weeklySessionListingInput }, 0
      )
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        if(res.data.getWeeklySessions.length > 0){
          this.weekly_sessions = res.data.getWeeklySessions;
          this.filter_weekly_sessions = JSON.parse(JSON.stringify(this.weekly_sessions));
          this.weekly_session_count = this.weekly_sessions.length;
          this.session_count = this.filter_weekly_sessions.length;
        }else{
          this.commonservice.toastMessage("No session(s) found",1000,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        console.log("Weekly List Data Is:", JSON.stringify(this.weekly_sessions));
      },
        (error) => {
          //this.commonService.hideLoader();
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
  }

  //getting monthly session list
  getMonthlySessions() {
    this.monthly_sessions = [];
    this.filter_monthly_sessions = [];
    this.session_count = 0;
    this.sessionListingInput.fetchForMember = false;
    //this.commonService.showLoader("Please wait");
    console.log("input giving for monthly list:", this.weeklySessionListingInput);
    const monthly_session_query = gql`
    query getAllMonthlySessions($input: SessionListingInput!) {
      getAllMonthlySessions(monthlySessionInput: $input) {
        id
        firebase_activitykey
        firebasepath
        firebase_activity_categorykey
        firebase_activity_subcategorykey
        financial_year_key
        session_name
        start_date
        end_date
        start_time
        duration
        days
        group_size
        comments
        productid
        group_category
        group_status
        activity_category_name
        activity_subcategory_name
        one_day_price
        can_enroll
        ActivityDetails{
          ActivityName
        }
        session_stats{
          enrolled_member_count
          paid_count
          pendingpayment_member_count
          subscribed_member_count
        }
        coaches{
          Id
          coach_firebase_id
          first_name
          last_name
        }
        coach_names
        coach_image
        end_time
      }
    }
  `;

    this.graphqlService
      .query(
        monthly_session_query, { input: this.sessionListingInput }, 0
      )
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        if(res.data.getAllMonthlySessions.length > 0){
          this.monthly_sessions = res.data.getAllMonthlySessions as MonthlySession[];
          this.filter_monthly_sessions = JSON.parse(JSON.stringify(this.monthly_sessions));
          this.session_count = this.filter_monthly_sessions.length;
          console.log("monthly list data :", JSON.stringify(this.monthly_sessions));
        }else{
          this.commonservice.toastMessage("No session(s) found",1000,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
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
  }

  getPastSessions(){
    this.sessionListingInput.fetchForMember = false;
    const past_session_query = gql`
    query getSessionsList($session_input: SessionListingInput!) {
      getSessionsList(getSessionListInput: $session_input) {
        termSession {
          id
          session_name
          firebase_sessionkey
          term_name
          paid_count
          tot_enrol_count
          firebase_clubkey
          group_status
          ParentClubDetails {
            ParentClubName
          }
          ActivityDetails {
            ActivityName
          }
          ClubDetails {
            ClubName
            FirebaseId
          }
          session_fee
          firebase_clubkey
          firebase_activitykey
          activity_category_name
          activity_subcategory_name
          duration
          days
          no_of_weeks
          Coach {
            coach_firebase_id
            first_name
            last_name
            profile_image
          }
          start_time
          start_date
          end_date
          end_time
          group_size
        }
        weeklySession {
          id
          session_name
          ParentClub {
            ParentClubName
          }
          ActivityDetails {
            ActivityName
          }
          club {
            Id
            ClubName
          }
          coach_names
          coach_images
          category_name
          sub_category_name
          days
          start_date
          end_date
          start_time
          end_time
          enrol_count
          booking_count
          private_status
        }
        monthlySession {
          id
          session_name
          firebase_sessionkey
          firebase_clubkey
          firebase_activitykey
          activity_category_name
          activity_subcategory_name
          coach_names
          coach_image
          days
          start_date
          end_date
          start_time
          end_time
          session_type
          group_status
          session_stats{
            enrolled_member_count
            pendingpayment_member_count
            subscribed_member_count
          }
          ClubDetails {
            Id
            FirebaseId
            ClubName
          }
        }


      }
    }
  `;

    this.graphqlService
      .query(
        past_session_query, { session_input: this.sessionListingInput }, 0
      )
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        this.session_count = 0;
        if(res.data.getSessionsList.termSession.length > 0){
          this.term_sessions = res.data.getSessionsList.termSession;
          this.filter_term_sessions = JSON.parse(JSON.stringify(this.term_sessions));
          this.session_count += this.filter_term_sessions.length;
          console.log("term list data :", JSON.stringify(this.term_sessions));
        }
        if(res.data.getSessionsList.weeklySession.length > 0){
          this.weekly_sessions = res.data.getSessionsList.weeklySession;
          this.filter_weekly_sessions = JSON.parse(JSON.stringify(this.weekly_sessions));
          this.session_count += this.filter_weekly_sessions.length;
          console.log("weekly list data :", JSON.stringify(this.weekly_sessions));
        }
        if(res.data.getSessionsList.monthlySession.length > 0){
          this.monthly_sessions = res.data.getSessionsList.monthlySession;
          this.filter_monthly_sessions = JSON.parse(JSON.stringify(this.monthly_sessions));
          this.session_count += this.filter_monthly_sessions.length;
          console.log("monthly list data :", JSON.stringify(this.monthly_sessions));
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
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
  }
  

  // //payment activity details
  checkPaymentSetup() {
    const activity$Obs = this.fb.getAll(`Activity/${this.parentClubKey}`).subscribe(
      (res) => {
        activity$Obs.unsubscribe();
        console.log(res);
        let showmodal: boolean = true;
        for (let i = 0; i < this.clubs.length; i++) {
          for (let j = 0; j < res.length; j++) {
            if (this.clubs[i].FirebaseId === res[j].$key) {
              for (let key in res[j]) {
                if (key != "$key") {
                  res[j][key].PaymentSetup =
                    this.commonService.convertFbObjectToArray(
                      res[j][key].PaymentSetup
                    );
                  console.log(res[j][key].PaymentSetup);
                  for (let l = 0; l < res[j][key].PaymentSetup.length; l++) {
                    if (res[j][key].PaymentSetup[l].IsActive) {
                      if (
                        (res[j][key].PaymentSetup[l].PaymentGatewayName ==
                          "RealEx" ||
                          res[j][key].PaymentSetup[l].PaymentGatewayName ==
                          "StripeConnect" ||
                          res[j][key].PaymentSetup[l].PaymentGatewayName ==
                          "paytm" ||
                          res[j][key].PaymentSetup[l].PaymentGatewayName ==
                          "Stripe") &&
                        res[j][key].PaymentSetup[l].SetupType ==
                        "Session Management"
                      ) {
                        console.log("matched");
                        console.log(
                          `${res[j][key].PaymentSetup[l].IsActive}:${res[j][key].PaymentSetup[l].PaymentGatewayName}:${res[j][key].PaymentSetup[l].SetupType}`
                        );
                        showmodal = false;
                        this.isShowPaymentModal = false;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        this.isShowPaymentModal = showmodal;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  //custom component for payment setup redirect
  GotoPaymentSetup() {
    this.isShowPaymentModal = false;
    let setup = {
      SetupName: "Session Management",
      DisplayName: "Group Session",
      VenueList: true,
      type:ModuleTypes.TERMSESSION,
      ImageUrl:
        "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fgroupsession.svg?alt=media&token=1f19b4aa-5051-4131-918d-4fa17091a7f9",
    };
    this.navCtrl.push("StripeconnectsetuplistPage", { setupDetails: setup });
  }

  skip() {
    this.isShowPaymentModal = false;
  }

  


  editSession(sessionDetails) {
    // console.log(sessionDetails);
    this.navCtrl.push("Type2EditGroupSession", {
      SessionDetails: sessionDetails,
    });
  }


  OnChangeClubOneToOne() {
    this.isShowMessage1 = false;
    this.isShowMessage2 = false;
    this.isShowMessage3 = false;
    this.sessionObjForOneToOne = [];
    //this.getSessionListsForOneToOne();
    //console.log(this.sessionObjForOneToOne);
  }
  onChangeCoachOneToOne() {
    this.isShowMessage1 = false;
    this.isShowMessage2 = false;
    this.isShowMessage3 = false;
    this.sessionObjForOneToOne = [];
    //this.getSessionListsForOneToOne();
    //console.log(this.sessionObjForOneToOne);
  }

  

  OnChangeClubFamily() {
    this.isShowMessage1 = false;
    this.isShowMessage2 = false;
    this.isShowMessage3 = false;
    this.sessionObjForFamily = [];
    //this.getSessionListsForFamily();
    // console.log(this.sessionObjForOneToOne);
  }
  onChangeCoachFamily() {
    this.isShowMessage1 = false;
    this.isShowMessage2 = false;
    this.isShowMessage3 = false;
    this.sessionObjForFamily = [];
    //this.getSessionListsForFamily();
    // console.log(this.sessionObjForOneToOne);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }

  

  

  gotoSession() {
    $("#fav-ico").trigger("click");
    if (this.sessionStrength == "Group") {
      this.navCtrl.push("Type2Session", { sessionName: this.sessionStrength });
    } else if (this.sessionStrength == "OneToOne") {
      //this.navCtrl.push(Type2CreateOneToOneSession, { sessionName: this.sessionStrength });
    } else if (this.sessionStrength == "Family") {
      //this.navCtrl.push(Type2CreateFamilySession, { sessionName: this.sessionStrength });
    }
  }
  
  //add navigation to different details page s

  goToMonthlySession(){
    this.navCtrl.push("MonthlysessionPage");
  }

  goToSessionDetailsPage(session:GroupSession) {
      this.navCtrl.push("GroupsessiondetailsPage", {
        session_id: session.id,
      });
      // this.presentActionSheet(session);
  }

  //navigating to monthly session det's page
  goToMonthlySessionDetailsPage(session:MonthlySession){
    this.navCtrl.push("MonthlySessionDetails", {
      session_id: session.id,
    });
  }

  goToWeeklySessionDetailsPage(session:WeeklySessionList){
    this.navCtrl.push("WeeklySessionDetailsPage", {
      session_id: session.id,
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  gotoWeeklySession(session: string) {
    $("#fav-ico").trigger("click");
    this.navCtrl.push("CreateweeklysessionPage", { session: session });
  }

  //moving to term session copy page
  gotoCopySession() {
    this.navCtrl.push("CopySession");
  }

  selectedType: boolean = true;
  listTypeStatus: boolean = false;
  changeType(index) {
    // this.selectedType = val;
    // this.sessionType = !val;
    // this.listTypeStatus = !this.listTypeStatus;
    // this.sessionType = this.listTypeStatus;
    // this.getSessionLists();
    
    //this.drawerState = 1;
    this.sessionListingInput.ActionType = 0;
    //this.weeklySessionListingInput = 0
    switch (index) {
      case 0:
        this.listTypeStatus = false;
        this.sessionType = this.listTypeStatus;
        this.getSessionListData();
        break;

      case 1:
        this.listTypeStatus = true;
        this.sessionType = this.listTypeStatus;
        this.getWeeklySessions();
        break;

      case 1:
        this.listTypeStatus = true;
        this.sessionType = this.listTypeStatus;
        this.getMonthlySessions();
        break;
    }
  }

  //search for all three modules
  getFilterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != "") {
      if(Number(this.switchfilterpage) === 1){//term sessions
        this.filter_term_sessions =  this.getFilterTermSessions(val);
      }
      if(Number(this.switchfilterpage) === 2){
        this.filter_weekly_sessions = this.getFilterWeeklySessions(val);
      }
      if(Number(this.switchfilterpage) === 3){ //monthly session
        this.filter_monthly_sessions = this.getFilterMonthlySessions(val);
      }
      if(Number(this.switchfilterpage) === 4){ //all session
        this.filter_term_sessions =  this.getFilterTermSessions(val);
        this.filter_weekly_sessions = this.getFilterWeeklySessions(val)
        this.filter_monthly_sessions = this.getFilterMonthlySessions(val);
      }
    } else {
      if(Number(this.switchfilterpage) === 1){
        this.filter_term_sessions = this.term_sessions;
        this.session_count = this.filter_term_sessions.length;
      }else if(Number(this.switchfilterpage) === 2){
        this.filter_weekly_sessions = this.weekly_sessions;
        this.session_count = this.filter_weekly_sessions.length;
      }else if(Number(this.switchfilterpage) === 3){
        this.filter_monthly_sessions = this.monthly_sessions;
        this.session_count = this.filter_monthly_sessions.length;
      }else{
        this.filter_term_sessions = this.term_sessions;
        this.filter_weekly_sessions = this.weekly_sessions;
        this.filter_monthly_sessions = this.monthly_sessions;
        this.session_count = this.term_sessions.length + this.weekly_sessions.length + this.monthly_sessions.length;
      }
    }
  }

  //search term sessions
  getFilterTermSessions(search_term:string){
    return this.term_sessions.filter((item) => {
      if (item.session_name != undefined) {
        if (item.session_name.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (item.Coach!= undefined) {
        if (item.Coach.first_name.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (setDay(item.days) != undefined) {
        if (
          setDay(item.days).toLowerCase().indexOf(search_term.toLowerCase()) > -1
        ) {
          return true;
        }
      }
      if (item.ActivityDetails != undefined) {
        if (
          item.ActivityDetails.ActivityName.toLowerCase().indexOf(search_term.toLowerCase()) > -1
        ) {
          return true;
        }
      }
      if (item.start_time != undefined) {
        if (item.start_time.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (item.duration != undefined) {
        if (item.duration.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      this.session_count = this.filter_term_sessions.length;
    });
  }

  //search weekly sessions
  getFilterWeeklySessions(search_term:string){
    return this.weekly_sessions.filter((item) => {
      if (item.session_name != undefined) {
        if (item.session_name.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (item.coach_names != undefined) {
        if (item.coach_names.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (setDay(item.days) != undefined) {
        if (
          setDay(item.days).toLowerCase().indexOf(search_term.toLowerCase()) > -1
        ) {
          return true;
        }
      }
      if (item.ActivityDetails != undefined) {
        if (
          item.ActivityDetails.ActivityName.toLowerCase().indexOf(search_term.toLowerCase()) > -1
        ) {
          return true;
        }
      }
      if (item.start_time != undefined) {
        if (item.start_time.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      // if (item.duration != undefined) {
      //   if (item.duration.toLowerCase().indexOf(val.toLowerCase()) > -1) {
      //     return true;
      //   }
      // }
      this.session_count = this.filter_weekly_sessions.length;
    }); 
  }

  //search monthly sessions
  getFilterMonthlySessions(search_term:string){
    return this.monthly_sessions.filter((item) => {
      if (item.session_name != undefined) {
        if (item.session_name.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (item.coach_names != undefined) {
        if (item.coach_names.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      if (setDay(item.days) != undefined) {
        if (
          setDay(item.days).toLowerCase().indexOf(search_term.toLowerCase()) > -1
        ) {
          return true;
        }
      }
      // if (item.ActivityDetails != undefined) {
      //   if (
      //     item.ActivityDetails.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1
      //   ) {
      //     return true;
      //   }
      // }
      if (item.start_time != undefined) {
        if (item.start_time.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
          return true;
        }
      }
      // if (item.duration != undefined) {
      //   if (item.duration.toLowerCase().indexOf(search_term.toLowerCase()) > -1) {
      //     return true;
      //   }
      // }
      this.session_count = this.filter_monthly_sessions.length;
    }); 
  }
  

  

  clearAllSessions(){
    this.term_sessions = [];
    this.filter_term_sessions = [];
    this.weekly_sessions = [];
    this.filter_weekly_sessions = [];
    this.monthly_sessions = [];
    this.filter_monthly_sessions = [];
  }

  async filterOutSession(men, index) {
    this.clearAllSessions();
    this.Tempfootermenu.forEach((menus) => {
      menus.IsSelect = false;
    });
    men.IsSelect = true;
    switch (index) {
      case 0:
        this.selectedCoach = "All";
        this.switchfilterpage = 1;
        this.canShowTerm = true;
        this.sessionListingInput.ActionType = index!=4 ? 1:0
        this.sessionListingInput.PostgresFields.PostgresClubId = this.selectedClub.toLowerCase()!='all' ? this.clubs.filter(club => club.FirebaseId == this.selectedClub)[0].Id:"";
        if(this.loggedin_type!=4){
          this.sessionListingInput.PostgresFields.PostgresCoachId = this.selectedCoach!="All" ? await this.getCoachIdsByFirebaseKeys([this.selectedCoach]):"";
        }
        
        this.getSessionListData();
        break;
      case 1:
        this.selectedCoach = "All"
        this.switchfilterpage = 2;
        this.canShowWeekly = true;
        //this.weeklySessionListingInput.ActionType = index!=4 ? 1:0
        this.weeklySessionListingInput.PostgresFields.PostgresClubId = this.selectedClub.toLowerCase()!='all' ? this.clubs.filter(club => club.FirebaseId == this.selectedClub)[0].Id:"";
        const club = this.clubs.filter(club => club.FirebaseId === this.selectedClub);
        console.log(`club:${club}`);
        if(this.loggedin_type!=4){
          this.weeklySessionListingInput.PostgresFields.PostgresCoachId = this.selectedCoach!="All" ? await this.getCoachIdsByFirebaseKeys([this.selectedCoach]):"";
        }
        this.getWeeklySessions();
        break;
      case 2:
        this.selectedCoach = "All"
        this.switchfilterpage = 3;
        this.canShowMonthly = true;
        this.sessionListingInput.ActionType = index!=4 ? 1:0
        this.sessionListingInput.PostgresFields.PostgresClubId = this.selectedClub.toLowerCase()!='all' ? this.clubs.filter(club => club.FirebaseId == this.selectedClub)[0].Id:"";
        if(this.loggedin_type!=4){
          this.sessionListingInput.PostgresFields.PostgresCoachId = this.selectedCoach!='All' ? await this.getCoachIdsByFirebaseKeys([this.selectedCoach]):"";
        }
        
        this.getMonthlySessions();
        break;
      case 3:
        // this.selectedCoach = "All";
        // this.category.forEach((eachCategory) => {
        //   eachCategory.SessionCount = this.backupSession.filter(
        //     (session) => session["ActivityCategoryKey"] == eachCategory.Key
        //   ).length;
        // });
        //this.switchfilterpage = 4;
        break;
      case 4:
        this.selectedCoach = "All";
        this.switchfilterpage = 4;
        this.canShowTerm = true;
        this.canShowWeekly = false;
        this.canShowMonthly = false;
        //this.changeType(1);
        this.sessionListingInput.ActionType = 2;
        this.sessionListingInput.PostgresFields.PostgresClubId = this.selectedClub.toLowerCase()!='all' ? this.clubs.filter(club => club.FirebaseId == this.selectedClub)[0].Id:"";
        if(this.loggedin_type!=4){
          this.sessionListingInput.PostgresFields.PostgresCoachId = this.selectedCoach!='All' ? await this.getCoachIdsByFirebaseKeys([this.selectedCoach]):"";
        }
        this.getPastSessions();
        break;
    }
  }
  onChangeofCategory() {
    this.dayList.forEach((day) => {
      day.SessionCount = this.backupSession.filter((session) => {
        let session_days = session.Days.split(",");
        return (
          session_days.includes(day.Name) &&
          session.ActivityKey == this.selectedActivity
        );
      }).length;
    });
  }
  ionViewWillLeave() {
    //unsbscribe all subscription to avoid all unnecessary data leaks
    // Can make a loop too :D
    if(this.$SessionsSubcriber && !this.$SessionsSubcriber.closed){
      this.$SessionsSubcriber.unsubscribe();
    }
    if(this.$ClubSubcriber && !this.$ClubSubcriber.closed){
      this.$ClubSubcriber.unsubscribe();
    }
    if(this.$CoachSubcriber && !this.$CoachSubcriber.closed){
      this.$CoachSubcriber.unsubscribe();
    }
  }

  getCoachIdsByFirebaseKeys(coach_ids): Promise<any> {
    return new Promise((res, rej) => {
      const coach_query = gql`
    query getCoachesByFirebaseIds($coachIds: [String!]) {
      getCoachesByFirebaseIds(coachIds: $coachIds){
        Id
        first_name
        last_name
        coach_firebase_id
       }
    }`
      const coach_query_variables = { coachIds: coach_ids };
      this.graphqlService.query(
        coach_query,
        coach_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getCoachesByFirebaseIds"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })

  }

  ionViewDidLeave(){
    this.commonService.updateCategory("");
  }

  
}

export class SessionListingInput {
  ParentClubKey: string
  ClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  PostgresFields: PostgreInputFields
  SessionType: number
  GroupStatus: number
  ActivityKey: string
  Start_Date: string
  End_Date: string
  fetchForMember?:boolean
}

export class WeeklySessionListingInput {
  // ParentClubKey: string
  // ClubKey: string
  // MemberKey: string
  AppType: number
  // ActionType: number
  // DeviceType: number
  PostgresFields: PostgreInputFields
  // SessionType: number
  // GroupStatus: number
  // ActivityKey: string
  // Start_Date: string
  // End_Date: string
  fetchForMember: boolean
}


export class PostgreInputFields{
  PostgresParentclubId: string
  PostgresClubId: string
  PostgresCoachId:string
  PostgresActivityId?: string
}



