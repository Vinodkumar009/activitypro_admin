import { FirebaseService } from "../../services/firebase.service";
import { Component } from "@angular/core";
import { Events, Platform } from "ionic-angular";
import {
  NavController,
  PopoverController,
  IonicPage,
  ToastController,
} from "ionic-angular";
import { SharedServices } from "../services/sharedservice";
import { LanguageService } from "../../services/language.service";
import { Storage } from "@ionic/storage";
import { BookingMemberType, CommonService } from "../../services/common.service";
import { HttpClient } from "@angular/common/http";
import { GoogleAnalytics } from "@ionic-native/google-analytics";
import moment from "moment";
//import { Observable } from "rxjs";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
//import { of } from 'rxjs/observable/of';
import { GraphqlService } from "../../services/graphql.service";

@IonicPage()
@Component({
  selector: "dashboard-page",
  templateUrl: "dashboard.html",
})
export class Dashboard {
  footermenu: Array<any> = [];
  Tempfootermenu: Array<any> = [
    { DisplayName: "Home", Icon: "home", Component: "Dashboard" },
    { DisplayName: "Groups", Icon: "people", Component: "Type2ManageSession" },
    { DisplayName: "Camps", Icon: "tennisball", Component: "Type2HolidayCamp" },
    { DisplayName: "Members", Icon: "contacts", Component: "Type2Member" },
    { DisplayName: "Menu", Icon: "ios-more", Component: "MenupagePage" },
  ];
  isChatEnable: boolean = false;
  isDashboardEmpty: boolean = false;
  EventObj = {
    TotalEvents: 0,
    TotalEnrolled: 0,
    TotRevenue: "0.00",
    TotFreeEvents: 0,
    TotPaidEventd: 0,
    TicketsSold: 0,
  };
  dashboradView: any = {};
  LangObj: any = {}; //by vinod
  userData: any = {};
  parentClubInfo: any = {};
  // sessionDetails: any = {
  //   totalSessionPendingAmount: 0.0,
  //   sessionDetails: [],
  //   totalHours: 0,
  //   totalMemberEnrolled: 0,
  //   totalSessions: 0,
  // };

  sessionDetails:ISessionPendingPayments = {
    TotalAmountDue:"",
    TotalCount:"",
    VenueDetails:[]
  };

  schoolSessionDetails:ISessionPendingPayments = {
    TotalAmountDue:"",
    TotalCount:"",
    VenueDetails:[]
  };

  sessionEnrolDetails:ISessionEnrol = {
    Total_Sessions: "",
    Total_Members: "",
    Total_Hours:"",
    Activity_Summary:[],
    Week_Summary: []
  };

  sclSessionEnrolDetails:ISessionEnrol = {
    Total_Sessions: "",
    Total_Members: "",
    Total_Hours:"",
    Activity_Summary:[],
    Week_Summary: []
  };

  monthlySessionEnrolDetails:ISessionEnrol = {
    Total_Sessions: "",
    Total_Members: "",
    Total_Hours:"",
    Activity_Summary:[],
    Week_Summary: []
  };
  campEnrolDetails:ISessionEnrol = {
    Total_Sessions: "",
    Total_Members: "",
    Total_Hours:"",
    Activity_Summary:[],
    Week_Summary: []
  };

  holidayCampDetails: any = {
    totalHours: 0,
    holidayCamps: [],
    totalMemberEnrolled: 0,
  };
  
  memberDetails = {};
  coachDetails:ICoachSessionsSummary[] = [];
  //coachDetails:ICoachSessionsSummary[] = [];
  nodeUrl: string = "";
  Events: any = [];
  isIOS: boolean = false;
  isAppAdminLoggedin: boolean = false;
  type = 0;
  nestUrl: any;
  backUrl =
    "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2Factivitypro-main-dashboard.png?alt=media&token=d6f852c2-56ad-47a8-9467-db3987c908ae";
  getactivebookinInfo: any;
  bookingInfo = { totalbook: 0, todaycount: 0, slotListing: [] };
  showPendingPayments: boolean = true; // this is used when coach logged in aginst that coach check can he able to see payment card in dashboard
  nesturl: any;
  constructor(
    public events: Events,
    // private cache: CacheService,
    private langService: LanguageService,
    public toastCtrl: ToastController,
    private ga: GoogleAnalytics,
    public storage: Storage,
    public commonService: CommonService,
    public http: HttpClient,
    public sharedService: SharedServices,
    public popoverCtrl: PopoverController,
    public navCtrl: NavController,
    public plt: Platform,
    public fb: FirebaseService,
    private apollo: Apollo,
    private graphqlService: GraphqlService,
  ) {
    this.nestUrl = this.sharedService.getnestURL();
  }

  ionViewDidLoad() {
    this.sharedService.setThemeType(2);
    this.isIOS = this.plt.is("ios");
    this.nodeUrl = this.sharedService.getnodeURL();
    this.userData = this.sharedService.getUserData();
    this.nesturl = this.sharedService.getnestURL();
    
    this.checkDeviceToken();
    this.commonService.screening("DashBoard");
    this.getCurrencyDetials();
    this.getParentClubDetails();
    this.getFooterMenus();
    this.authenticate();
    
    // Use Promise.all to handle all storage operations in parallel
    Promise.all([
      this.storage.get("language"),
      this.storage.get("isAppAdminLogin"),
      this.storage.get("LoginWhen"),
      this.storage.get("dashboard_latest_refresh")
    ])
    .then(([language, isAppAdmin, loginWhen, lastRefresh]) => {
      // Handle language data
      if (language && language.data) {
        this.LangObj = language.data;
      }
      
      // Handle admin login status
      this.isAppAdminLoggedin = isAppAdmin || false;
      
      // Handle first login actions
      if (loginWhen === "first" && this.userData) {
        this.getMemberDetails();
        this.getPostgreParentclub();
        this.storage.set("LoginWhen", "notFirst");
      }
      
      // Handle refresh timing
      if (lastRefresh) {
        const dt1 = new Date().getMinutes();
        const dt2 = new Date(lastRefresh).getMinutes();
        const diff = dt1 - dt2;
        
        if (diff >= 1 && this.userData) {
          this.getSessionDetails();
          this.getTermSessionEnrolDetails();
          this.getMemberDetails();
          this.getPostgreParentclub();
          this.getCoachDetails();
          this.getEvents();
        }
      } else if (this.userData) {
        // If no last refresh time, fetch data anyway
        this.getSessionDetails();
        this.getTermSessionEnrolDetails();
        this.getMemberDetails();
        this.getPostgreParentclub();
        this.getCoachDetails();
        this.getEvents();
      }
    })
    .catch(error => {
      console.error("Error loading dashboard data:", error);
    });
    
    // Subscribe to language changes
    this.events.subscribe("language", () => this.getLanguage());
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
        is_show_revenue
       }
    }`
      const coach_query_variables = { coachIds: coach_ids };
      this.graphqlService.query(
        coach_query,
        coach_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getCoachesByFirebaseIds"][0]);
      }, (err) => {
        rej(err);
      });
    })

  }


  //getting the apikeys which needs for different module api's
  async authenticate(){
    this.fb.loginToFirebaseAuth().then(async(val)=>{
      if(!this.sharedService.getApiKey("group-session")){
        setTimeout(async()=>{
          const access_id = await (await this.fb.getCurrentUser()).getIdToken();
          const authObj = {
            IdToken:access_id,
            AppType:1,
            // ParentClubKey:"",
            // ClubKey:"",
            // MemberKey:"",
            // ActionType:1,
            // DeviceType:1
          }
          const authQuery = gql`
          query authenticateUser($auth: AuthInput!) {
            authenticateUser(authCred: $auth) {
              AuthObj{
                AuthKey
                AuthValue
              }
            }
          }
        `;
        this.apollo
          .query({
            query: authQuery,
            fetchPolicy: "no-cache",
            variables: { auth: authObj},
          })
          .subscribe(
            ({ data }) => {
                if(data["authenticateUser"]["AuthObj"]){
                  data["authenticateUser"]["AuthObj"].forEach((auth:any)=>{
                    const module = auth.AuthKey.split("/");
                    //console.log(module[module.length-1]);
                    if(module[module.length-1] === "group-session")
                      this.sharedService.setApikey("group-session",auth.AuthValue);
                      else if(module[module.length-1] === "leauge-api-key")
                      this.sharedService.setApikey("league",auth.AuthValue);
                  })
                  console.log(`%cgrp_session_auth:${this.sharedService.getApiKey("group-session")}`,'color:green;font-size:20px');
              }
            },
            (err) => {
              //this.commonService.hideLoader();
              console.log(`%cfirebase auth api err:${JSON.stringify(err)}`,'color:red;font-size:20px');
              //this.commonService.toastMessage("Gallery fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
          );          
        },1200)
      }
    }).catch((err)=>{
      console.log(`%cfirebase auth err:${JSON.stringify(err)}`,'color:red;font-size:20px');
    })
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }

  goTo(obj) {
    if (obj.component != "Setup") {
      this.navCtrl.push(obj.component);
    } else {
      this.navCtrl.push("Setup");
    }
  }

  //to know the chat function is available for this parentclub
  getParentClubDetails() {
    this.fb.getAllWithQuery(`ParentClub/Type2/`, {orderByKey: true,equalTo: this.userData.UserInfo[0].ParentClubKey}).subscribe((data) => {
      this.parentClubInfo = data[0];
          if (data.length > 0 && data[0].IsChatEnable != undefined) {
            this.isChatEnable = data[0].IsChatEnable == "true" || data[0].IsChatEnable ? true: false;}
          if (data.length > 0 && data[0].DashboardView != undefined) {
            this.dashboradView = data[0].DashboardView;
          }
          if (data.length > 0 && data[0].DashboardView == undefined) {
            this.dashboradView = {
              SessionCount: true,
              Coach: true,
              Family: true,
            };
          }
          if (data.length > 0 && data[0].DashboardView.FacilityBookings && data[0].DashboardView.FacilityBookings!= 0) {
            this.type = data[0].DashboardView.FacilityBookings;
            this.getactivebookingDetails();
          }
          console.log(this.dashboradView);
          this.checkDashBoardEmpty();
        },
        (err) => {}
      );
  }

  //navigate to inbox page
  gotoInbox() {
    // this.navCtrl.push('PostPage');
    this.navCtrl.push("AdmingroupchatPage");
  }

  user: any;
  ionViewWillEnter() {
    // Handle login and user data first (needs to be sequential due to await)
    this.storage.get("isLogin").then(async (isLoggedIn) => {
      if (isLoggedIn === true) {
        try {
          const userObjStr = await this.storage.get("userObj");
          this.user = JSON.parse(userObjStr);
          this.sharedService.setLoggedInId(this.user.$key);
          this.sharedService.setParentclubKey(this.user.UserInfo[0].ParentClubKey);
          
          if (this.user.RoleType === "4" && this.user.UserType === "2") {
            this.sharedService.setLoggedInType(BookingMemberType.COACH);
            if (this.user.$key !== "") {
              const coach_obj = await this.getCoachIdsByFirebaseKeys([this.user.UserInfo[0].CoachKey]);
              this.sharedService.setCanCoachSeeRevenue(coach_obj.is_show_revenue);
              this.showPendingPayments = coach_obj.is_show_revenue;
            }
          }
        } catch (err) {
          console.error("Error processing user data:", err);
        }
      }
    });
    
    // Load all other storage data in parallel
    Promise.all([
      this.storage.get("postgre_parentclub"),
      this.storage.get("sessionDetails"),
      this.storage.get("session_enroldets"),
      this.storage.get("scl_session_enroldets"),
      this.storage.get("monthly_session_enroldets"),
      this.storage.get("memberDetails"),
      this.storage.get("coachDetails"),
      this.storage.get("activeBookingsCount"),
      this.storage.get("eventDetails"),
      this.storage.get("loggedin_user")
    ])
    .then(([parentClub, sessionDetails, sessionEnrolDets, sclSessionEnrolDets, 
           monthlySessionEnrolDets, memberDetails, coachDetails, activeBookings, eventDetails,loggedinuser]) => {
      
      if(loggedinuser){
        this.sharedService.setLoggedInUserId(loggedinuser);
      }

      // Handle parent club data
      if (parentClub != null && parentClub != undefined) {
        this.sharedService.setPostgreParentClubId(parentClub.Id);
      } else {
        this.getPostgreParentclub();
      }
      
      // Handle session details
      if (sessionDetails != null) {
        this.sessionDetails = sessionDetails;
        this.schoolSessionDetails = sessionDetails; // Both use the same data source
      }
      
      // Handle session enrollment details
      if (sessionEnrolDets != null) {
        this.sessionEnrolDetails = sessionEnrolDets;
      }
      
      // Handle school session enrollment details
      if (sclSessionEnrolDets != null) {
        this.sclSessionEnrolDetails = sclSessionEnrolDets;
      }
      
      // Handle monthly session enrollment details
      if (monthlySessionEnrolDets != null) {
        this.monthlySessionEnrolDetails = monthlySessionEnrolDets;
      }
      
      // Handle member details
      if (memberDetails != null) {
        this.memberDetails = memberDetails;
      }
      
      // Handle coach details
      if (coachDetails != null) {
        this.coachDetails = coachDetails;
      }
      
      // Handle active bookings
      if (activeBookings != null) {
        this.bookingInfo = activeBookings;
      }
      
      // Handle event details
      if (eventDetails != null) {
        this.EventObj = eventDetails;
      }
    })
    .catch(error => {
      console.error("Error loading dashboard cached data:", error);
    });
  }

  checkDashBoardEmpty() {
    //this.dashboradView = { SessionCount:true,Coach:true,Family:true}
    if (
      !this.dashboradView.SessionCount &&
      !this.dashboradView.Coach &&
      !this.dashboradView.Family &&
      this.EventObj.TotalEvents == 0
    ) {
      this.isDashboardEmpty = true;
    }
  }
  
  async getSessionDetails() {
    const session_pending_payload = {
      parentclub_id:this.sharedService.getPostgreParentClubId(),
      date:moment().format("YYYY-MM-DD"),
      user_postgre_metadata:{
        UserMemberId:this.sharedService.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
      }
    }

    const term_pending_ses_query = gql`
    query getPendingPaymentsTermSession($pending_input: SessionSummaryInput!) {
      getPendingPaymentsTermSession(pendingPaymentSummaryInput: $pending_input) {
        TotalAmountDue
        TotalCount
        VenueDetails{
          ClubName
          Percentage
          Total
        }
      }
    }
  `;
  
    this.graphqlService.query(term_pending_ses_query,{pending_input: session_pending_payload},0).subscribe((res)=>{
        if(res.data["getPendingPaymentsTermSession"]){
            console.log(`%pending_sessions:${res.data["getPendingPaymentsTermSession"]}`,'color:green;font-size:20px');
            this.sessionDetails = res.data["getPendingPaymentsTermSession"] as ISessionPendingPayments;
            this.storage.remove("sessionDetails");
            this.storage.set("sessionDetails", this.sessionDetails);
            this.storage.set("dashboard_latest_refresh", new Date().getTime());
        }
      },
      (err) => {
        console.log(`%pending_sessions err:${JSON.stringify(err)}`,'color:red;font-size:10px');
      }
    );     
  }

  // async getSchoolSessionDetails() {
  //   const session_pending_payload = {
  //     parentclub_id:this.sharedService.getPostgreParentClubId(),
  //     date:moment().format("YYYY-MM-DD"),
  //     user_postgre_metadata:{
  //       UserMemberId:this.sharedService.getLoggedInId()
  //     },
  //     user_device_metadata:{
  //       UserAppType:0,
  //       UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
  //     }
  //   }

  //   const school_pending_ses_query = gql`
  //   query getPendingPaymentsSchoolSession($pending_input: SessionSummaryInput!) {
  //     getPendingPaymentsSchoolSession(pendingPaymentSummaryInput: $pending_input) {
  //       TotalAmountDue
  //       TotalCount
  //       VenueDetails{
  //         ClubName
  //         Percentage
  //         Total
  //       }
  //     }
  //   }
  // `;

  //   this.graphqlService.query(school_pending_ses_query,{pending_input: session_pending_payload},0).subscribe((res)=>{
  //       if(res.data["getPendingPaymentsSchoolSession"]){
  //           console.log(`%pending_sessions:${res.data["getPendingPaymentsSchoolSession"]}`,'color:green;font-size:20px');
  //           this.schoolSessionDetails = res.data["getPendingPaymentsSchoolSession"] as ISessionPendingPayments;
  //           this.storage.set("sclSessionDetails", this.sessionDetails);
  //           this.storage.set("dashboard_latest_refresh", new Date().getTime());
  //       }
  //     },
  //     (err) => {
  //       console.log(`%pending_sessions err:${JSON.stringify(err)}`,'color:red;font-size:10px');
  //     }
  //   );     
  // }

  

  //get term-session enrols
  getTermSessionEnrolDetails(){
    const session_summary_payload = {
      parentclub_id:this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedService.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
      }
    }
    const termStatsQuery = gql`
    query getSessionandMemberStats_V2($session_input: SessionSummaryInput!) {
      getSessionandMemberStats_V2(sessionSummaryInput: $session_input) {
        Total_Sessions
        Total_Members
        Total_Hours
        Week_Summary{
          Day
          DaySummary{
            Session
            Member
            ActivityName
          }
        }
      }
    }
  `;
    this.graphqlService.query(termStatsQuery,{session_input: session_summary_payload},0).subscribe((res)=>{
      this.sessionEnrolDetails = res.data.getSessionandMemberStats_V2 as ISessionEnrol;
      this.storage.remove("session_enroldets");
      this.storage.set("session_enroldets", this.sessionEnrolDetails);
      this.storage.set("dashboard_latest_refresh", new Date().getTime()); 
    },(error)=>{
      console.error("Error in fetching:", error);
    })                     
  }

  // getHolidayCampDetails() {
  //   let reqObj = {
  //     parentCLubKey: this.userData.UserInfo[0].ParentClubKey,
  //     loggedInType: "admin",
  //     loggedInKey: this.userData.UserInfo[0].Key,
  //     filterType: "present",
  //     type:'0'
  //   };
  //   if (parseInt(this.userData.RoleType) == 4) {
  //     reqObj.loggedInType = "coach";
  //     reqObj.loggedInKey = this.userData.UserInfo[0].CoachKey;
  //   }

  //   this.http
  //     .post(`${this.nodeUrl}/holidaycamp/history`, reqObj)
  //     .subscribe((data) => {
  //       this.holidayCampDetails = data;
  //       //this.holidayCampDetails.holidayCamps = this.holidayCampDetails.holidayCamps.filter((holidaycamp) => holidaycamp.IsEnable == true || holidaycamp.IsEnable == undefined);
  //       this.holidayCampDetails.totalHours = parseFloat(
  //         this.holidayCampDetails.totalHours
  //       ).toFixed(2);
  //       this.holidayCampDetails["totalMemberEnrolled"] = 0;
  //       this.holidayCampDetails.holidayCamps.forEach((holidayCamp) => {
  //         if (holidayCamp.Member != undefined) {
  //           this.holidayCampDetails["totalMemberEnrolled"] +=
  //             this.commonService.convertFbObjectToArray(
  //               holidayCamp.Member
  //             ).length;
  //         }
  //       });
  //       this.storage.remove("holidayCampDetails");
  //       this.storage.set("holidayCampDetails", this.holidayCampDetails);
  //     });
  // }
  getSchoolSessionEnrolDets() {
    const session_summary_payload = {
      parentclub_id:this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedService.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
      }
    }
    const termStatsQuery = gql`
    query getSchoolSessionMemberStats($session_input: SessionSummaryInput!) {
      getSchoolSessionMemberStats(sessionSummaryInput: $session_input) {
        Total_Sessions
        Total_Members
        Total_Hours
        Week_Summary{
          Day
          DaySummary{
            Session
            Member
            ActivityName
          }
        }
      }
    }
  `;
    this.graphqlService.query(termStatsQuery,{session_input: session_summary_payload},0).subscribe((res)=>{
      this.sclSessionEnrolDetails = res.data.getSchoolSessionMemberStats as ISessionEnrol;
      this.storage.remove("scl_session_enroldets");
      this.storage.set("scl_session_enroldets", this.sclSessionEnrolDetails);
      this.storage.set("dashboard_latest_refresh", new Date().getTime()); 
    },(error)=>{
      console.error("Error in fetching:", error);
    })  
  }

  getMonthlySessionEnrolDets() {
    const session_summary_payload = {
      parentclub_id:this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedService.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
      }
    }
    const sesStatsQuery = gql`
    query getMonthlySessionMemberStats($session_input: SessionSummaryInput!) {
      getMonthlySessionMemberStats(sessionSummaryInput: $session_input) {
        Total_Sessions
        Total_Members
        Total_Hours
        Week_Summary{
          Day
          DaySummary{
            Session
            Member
            ActivityName
          }
        }
      }
    }
  `;
    this.graphqlService.query(sesStatsQuery,{session_input: session_summary_payload},0).subscribe((res)=>{
      this.monthlySessionEnrolDetails = res.data.getMonthlySessionMemberStats as ISessionEnrol;
      this.storage.remove("monthly_session_enroldets");
      this.storage.set("monthly_session_enroldets", this.monthlySessionEnrolDetails);
      this.storage.set("dashboard_latest_refresh", new Date().getTime()); 
    },(error)=>{
      console.error("Error in fetching:", error);
    })  
  }

  getHolidayCampEnrolDets() {
    const session_summary_payload = {
      parentclub_id:this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedService.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
      }
    }
    const sesStatsQuery = gql`
    query getCampMemberStats($session_input: SessionSummaryInput!) {
      getCampMemberStats(sessionSummaryInput: $session_input) {
        Total_Sessions
        Total_Members
        Total_Hours
        Week_Summary{
          Day
          DaySummary{
            Session
            Member
            ActivityName
          }
        }
      }
    }
  `;
    this.graphqlService.query(sesStatsQuery,{session_input: session_summary_payload},0).subscribe((res)=>{
      this.campEnrolDetails = res.data.getCampMemberStats as ISessionEnrol;
      this.storage.remove("camp_enroldets");
      this.storage.set("camp_enroldets", this.campEnrolDetails);
      this.storage.set("dashboard_latest_refresh", new Date().getTime()); 
    },(error)=>{
      console.error("Error in fetching:", error);
    })  
  }

  getEvents() {
    let reqObj = {
      parentCLubKey: this.userData.UserInfo[0].ParentClubKey,
      loggedInType: "admin",
      loggedInKey: this.userData.UserInfo[0].Key,
      filterType: "present",
    };
    this.fb.$post(`${this.nodeUrl}/event/history`, reqObj).subscribe(
      (data) => {
        // console.log(`events:${data}`);

        console.log(this.EventObj);
        this.EventObj.TotalEvents = data.events.length;
        this.EventObj.TicketsSold = data.bookings;
        this.EventObj.TotRevenue = parseFloat(data.totalPaidAmount).toFixed(2);
        this.storage.set("eventDetails", this.EventObj);
        // this.storage.get("eventDetails").then((data) => {
        //   if (data != null) {
        //     this.storage.remove("eventDetails").then(() => {
        //       this.EventObj.TotalEvents = data.events.length;
        //       this.EventObj.TicketsSold = data.bookings;
        //       this.EventObj.TotRevenue = data.totalPaidAmount;
        //       this.storage.set('eventDetails', this.EventObj);
        //     });
        //   } else {
        //     this.EventObj.TotalEvents = data.events.length;
        //     this.EventObj.TicketsSold = data.bookings;
        //     this.EventObj.TotRevenue = data.totalPaidAmount;
        //     this.storage.set('eventDetails', this.EventObj);
        //   }
        // })
      },
      (err) => {
        console.log("err", err);
        //this.showToast("There is some problem,Please try again",2500);
      }
    );
  }

  //Navigate to events
  GotoEvents() {
    this.navCtrl.push("EventsPage");
  }

  checkDeviceToken() {
    if (this.sharedService.getOnesignalPlayerId()) {
      let key = this.userData.UserInfo[0].ParentClubKey;
      let reqObj = {
        parentCLubKey: this.userData.UserInfo[0].ParentClubKey,
        loggedInType: "admin",
        loggedInKey: this.userData.UserInfo[0].Key,
      };
      if (parseInt(this.userData.RoleType) == 4) {
        key = this.userData.UserInfo[0].CoachKey;
        reqObj.loggedInType = "coach";
        reqObj.loggedInKey = this.userData.UserInfo[0].CoachKey;
      }
      this.commonService.saveDeviceDetsforNotify(key);
      
    }
  }
  roundOff(event) {
    event.target.value = parseFloat(event.target.value).toFixed(2);
    if (isNaN(parseInt(event.target.value))) {
      event.target.value = parseFloat("0").toFixed(2);
      console.log(event.target.value);
    }
  }
  goToPage(pageName) { //commented for new app as payment reports not available as of now
    switch (pageName) {
      // case "Payment": {
      //   if (parseInt(this.userData.RoleType) == 2) {
      //     this.navCtrl.push("Payment");
      //   } else if (parseInt(this.userData.RoleType) == 4) {
      //   }
      //   break;
      // }
      case "Type2ManageSession": {
        //if (parseInt(this.userData.RoleType) == 2) {
          this.navCtrl.push("Type2ManageSession");
          this.commonService.updateCategory('update_session_list')
        //} 
        
        break;
      }
      case "Type2SchoolSessionList": {
        //if (parseInt(this.userData.RoleType) == 2) {
          this.commonService.updateCategory("update_scl_session_list");
          this.navCtrl.push("Type2SchoolSessionList");
        //} 
        break;
      }
    //   case "Type2HolidayCamp": {
    //     this.commonService.updateCategory('holidaycamp');
    //     if (parseInt(this.userData.RoleType) == 2) {
    //       this.navCtrl.push("Type2HolidayCamp");
    //     } else if (parseInt(this.userData.RoleType) == 4) {
    //       this.navCtrl.push("Type2HolidayCamp");
    //     }
    //     break;
    //   }
    //   case "SchoolpaymentreportPage": {
    //     if (parseInt(this.userData.RoleType) == 2) {
    //       this.navCtrl.push("SchoolpaymentreportPage");
    //     } else if (parseInt(this.userData.RoleType) == 4) {
    //       this.navCtrl.push("");
    //     }
    //     break;
    //   }
    //   case "HolidaycamppaymentreportPage": {
    //     if (parseInt(this.userData.RoleType) == 2) {
    //       this.navCtrl.push("HolidaycamppaymentreportPage");
    //     } else if (parseInt(this.userData.RoleType) == 4) {
    //       this.navCtrl.push("");
    //     }
    //     break;
    //   }
    //   case "Type2Member": {
    //     if (parseInt(this.userData.RoleType) == 2) {
    //       this.navCtrl.push("Type2Member");
    //     } else if (parseInt(this.userData.RoleType) == 4) {
    //       this.navCtrl.push("CoachMember");
    //     }
    //     break;
    //   }
    //   case "Type2Schedule": {
    //     if (parseInt(this.userData.RoleType) == 2) {
    //       this.navCtrl.push("Type2Schedule");
    //     } else if (parseInt(this.userData.RoleType) == 4) {
    //       this.navCtrl.push("");
    //     }
    //     break;
    //   }
    }
    // this.navCtrl.push("MenupagePage")
  }

  doRefresh(event) {
    console.log("Begin async operation");
    setTimeout(() => {
      if (this.userData != undefined) {
        this.getParentClubDetails();
        this.getPostgreParentclub();
        // this.getSessionDetails();
        // this.getTermSessionEnrolDetails();
        // this.getHolidayCampDetails();
        // this.getSchoolSessionEnrolDets();
        // this.getMemberDetails();
        // //this.getactivebookingDetails(); this dependant on this.getParentClubImage()
        // this.getCoachDetails();
        this.getCurrencyDetials();
        //this.getEvents(); commented for new admin app, as data not migrated to postgre
      }
      event.complete();
    }, 3000);
  }
  
  // getMemberDetails() {
  //   this.http.post(`${this.nodeUrl}/member/list`, { parentclubKey: this.userData.UserInfo[0].ParentClubKey }).subscribe((data) => {
  //     this.memberDetails = data;
  //     this.storage.set('memberDetails', this.memberDetails)
  //   })

  // }
  getMemberDetails() {
    this.http
      .get(
        `${this.nestUrl}/user/usercount/${this.userData.UserInfo[0].ParentClubKey}`
      )
      .subscribe((resp) => {
        this.memberDetails = resp["data"];
        this.storage.set("memberDetails", this.memberDetails);
      });
  }


  getCoachDetails() {
    const coach_summary_payload = {
      parentclub_id:this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedService.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedService.getPlatform() == "android" ? 1:2
      },
      date:new Date()
    }

    const coach_list_query = gql`
    query getParentClubCoachSessionSummary($coach_input: CoachSummaryInput!) {
      getParentClubCoachSessionSummary(parentclubCoachSessionSummaryInput: $coach_input) {
        id
        first_name
        last_name
        profile_image
        sessions
        total_enrol_members
        total_hours
      }
    }
  `;
  this.graphqlService.query(coach_list_query,{coach_input: coach_summary_payload},0).subscribe((res)=>{
    if(res.data["getParentClubCoachSessionSummary"]){
      console.log(`%coach_summary:${res.data["getParentClubCoachSessionSummary"]}`,'color:green;font-size:20px');
      this.coachDetails = res.data["getParentClubCoachSessionSummary"] as ICoachSessionsSummary[];
      this.storage.set("coachDetails", this.coachDetails);
    }
    },
    (err) => {
      console.log(`%coach_summary err:${JSON.stringify(err)}`,'color:red;font-size:10px');
    });          
  }

  getPostgreParentclub(){
    const parentclubId = this.userData.UserInfo[0].ParentClubKey;
    const parentclubQuery = gql`
    query getParentClubByFireabseId($parentclubId:String!) {
      getParentClubByFireabseId(parentclubId:$parentclubId){
        Id
        FireBaseId
        ParentClubName
        ParentClubAdminEmailID
        ParentClubAppIconURL
      }
    }
  `;
    this.apollo
      .query({
        query: parentclubQuery,
        fetchPolicy: 'network-only',
        variables: { parentclubId },
      })
      .subscribe(({data}) => {
        console.log("parentclub_info",data["getParentClubByFireabseId"]);
        if(data["getParentClubByFireabseId"]){
          this.sharedService.setPostgreParentClubId(data["getParentClubByFireabseId"]["Id"]);
          this.storage.set("postgre_parentclub", data["getParentClubByFireabseId"]);
          this.getSessionDetails();
          this.getTermSessionEnrolDetails();
          //this.getHolidayCampDetails();
          this.getSchoolSessionEnrolDets();
          this.getMonthlySessionEnrolDets();
          //this.getHolidayCampEnrolDets();
          //this.getactivebookingDetails(); this dependant on this.getParentClubImage()
          this.getCoachDetails();
        }
      },(err)=>{
        console.log(JSON.stringify(err));
      });
  }

  getFooterMenus() {
    this.fb
      .getAll(
        "/Menu/Type2/adminAppDashboardMenu/" +
          this.userData.UserInfo[0].ParentClubKey +
          "/"
      )
      .subscribe((data) => {
        console.log(data);
        if (data != undefined && data.length > 0) {
          this.footermenu = data.filter((menu) => menu.IsEnable === true);
        } else {
          this.footermenu = this.Tempfootermenu;
        }
      });
  }

  getCurrencyDetials() {
    const currency$Obs = this.fb
      .getAllWithQuery(
        "/Currency/Type2/" + this.userData.UserInfo[0].ParentClubKey,
        { orderByKey: true }
      )
      .subscribe((data) => {
        currency$Obs.unsubscribe();
        this.storage.set("Currency", JSON.stringify(data[0]));
      });
  }

  getactivebookingDetails() {
    let date = moment().format("YYYY-MM-DD");
    let type =
    this.parentClubInfo.DashboardView.FacilityBookings && this.parentClubInfo.DashboardView.FacilityBookings!= ""? +this.parentClubInfo.DashboardView.FacilityBookings: 1;
    this.http
      .get(
        `${this.nesturl}/courtbooking/bookingsummary_v2/${this.userData.UserInfo[0].ParentClubKey}/${type}/${date}`
      )
      .subscribe((data) => {
        let activebooking = data["data"];
        this.bookingInfo.slotListing = [];
        this.bookingInfo.totalbook = activebooking.totalcount;
        this.bookingInfo.todaycount = activebooking.todaycount;
        this.bookingInfo.slotListing = activebooking.totalslot;
        this.bookingInfo.slotListing.forEach((slot) => {
          slot.slot_start_time = moment(
            slot.slot_start_time,
            "HH:mm:ss"
          ).format("HH:mm");
          slot.slot_end_time = moment(slot.slot_end_time, "HH:mm:ss").format(
            "HH:mm"
          );
          slot.booking_transaction_time = moment
            .utc(slot.booking_transaction_time)
            .local()
            .format("DD-MMM-YYYY");
          slot.booking_date = moment
            .utc(slot.booking_date)
            .local()
            .format("DD MM YYYY");
        });
        this.storage.set("activeBookingsCount", this.bookingInfo);
      });
  }
  getTime(date) {
    return moment(date, "DD MM YYYY").format("D-MMM");
  }

  GotoBooking() {
    this.navCtrl.push("BookingPage");
  }

  gotoBookings(i, slot) {
    this.navCtrl.push("ActiveBookingDetail", {
      ParentClubKey: this.userData.UserInfo[0].ParentClubKey,
      selectedClub: slot.ClubName,
      ClubKey: slot.clubkey,
      // courtInfoObj : slot.CourtInfo,
      // selectedCourt :  slot.CourtInfo,
      slotInfo: slot,
      fromDashboard: true,
    });
  }

  navigate(index: number) {
    if(this.footermenu[index].Component === "Type2HolidayCamp"){
      this.commonService.updateCategory('update_camps_list');
      this.navCtrl.push(this.footermenu[index].Component);
    }else if(this.footermenu[index].Component === "Type2SchoolSessionList"){
      this.commonService.updateCategory('schoolsessions'); 
      this.navCtrl.push(this.footermenu[index].Component);
    }else if (this.footermenu[index].Component == "Type2ManageSession") {
      // if (this.user.RoleType == "4" && this.user.UserType == "2") {
      //   this.navCtrl.push("CoachManageSession");
      // }else{
      //   this.commonService.updateCategory('update_session_list')
      //   this.navCtrl.push(this.footermenu[index].Component);
      // }
      this.commonService.updateCategory('update_session_list')
      this.navCtrl.push(this.footermenu[index].Component);
    }else{
      this.navCtrl.push(this.footermenu[index].Component);
    }
  }

}




interface ISessionPendingPayments{
  TotalAmountDue:string;
  TotalCount:string;
  VenueDetails:[]
}

interface IPendingSessionVenues{
  ClubName:string;
  Percentage:string;
  Total:string;
}

export interface ICoachSessionsSummary {
  id:string;
  first_name:string;
  last_name:string
  profile_image:string;
  total_enrol_members:string;
  sessions: number;
  total_hours: number;
}

export interface ISessionEnrol {
  Total_Sessions: string;
  Total_Members: string;
  Total_Hours:string;
  Activity_Summary: IActivity_Summary[];
  Week_Summary: IWeekSummary_V2[];
}
export interface IActivity_Summary {
  ActivityName: string;
  session_count: string;
}

export interface IWeekSummary_V2 {
  Day: string;
  DaySummary: IDaySummary[];
}

export interface IDaySummary {
  Session: string;
  Member: string;
  Total_Hours:string;
  ActivityName: string;
}