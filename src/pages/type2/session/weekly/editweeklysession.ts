import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content, Platform, NavController, NavParams, LoadingController, ModalController, PopoverController, AlertController, ToastController, Slides } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { WheelSelector } from '@ionic-native/wheel-selector';
import gql from 'graphql-tag';
import { ActivityModel, ClubVenue, IClubDetails } from '../sessions_club.model';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput } from '../../../../shared/model/club.model';
import { WeeklySessionDetails } from './weekly.model';
import { EditWeeklySession } from './editweekly.dto';
import { CreateWeeklySessionDiscountDto } from './create_weekly_session.dto';
import { SharedServices } from '../../../services/sharedservice';
import { GraphqlService } from '../../../../services/graphql.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { DiscountType } from './weeklyConstants/DiscountConstant';
import { IParentClubDetails } from '../../../../shared/model/parentclub.model';



@IonicPage()
@Component({
  selector: 'page-editweeklysession',
  templateUrl: 'editweeklysession.html',

})
export class EditweeklysessionPage {
  @ViewChild(Content) content: Content;
  @ViewChild('myslider') myslider: Slides;
  isBeginSlide: boolean = true;
  isEndSlide: boolean = false;
  LangObj: any = {};//by vinod

  IsLoyaltyAllowed: boolean = false;
  IsDiscountAllSessions: boolean = false;
  IsAdvBookAvailable: boolean = false;
  IsFreeSesAvail: boolean = false;
  AllowAdvDisForFreeSes: boolean = false;
  IsPaid: boolean = true;
  number_of_sessions: number = 0;
  parentClubData: IParentClubDetails[];
  AdvSessionsBooking: string = "No Limit";
  AdvanceVisibleSes: string = "All";
  parentClubId: string
  days = [];
  weeklyDiscounts = {
    all_session:{
      discount_header:"All Session", 
      discount_type:3011,
      discount_name:"Book All Session",
      discount_amount:"0",
      is_active:false
    },
    advance_booking:{
      discount_header:"Advance Booking", 
      discount_type:3001,
      discount_name:"Advance Booking",
      discount_amount:"0",
      no_of_days_advance:2,
      is_active:false,
    },
    free_sessions:{
      discount_header:"Free Sessions", 
      discount_type:3006,
      discount_name:"Free Sessions",
      multiple_of:5,
      include_advance_booking_discount:false,
      is_active:false,
    },
    no_of_sessions:{
      discount_header:"No Of Sessions", 
      discount_type:3005,
      discount_name:"No Of Sessions",
      discount_amount:"0",
      no_of_session:0,
      include_advance_booking_discount:false,
      is_active:false,
    }
  }

  // weeklyDiscounts: Array<any> = [
  //   {
  //     AbsoluteValue: 0,
  //     NoofSessions: 0,
  //     CreationTime: new Date().getTime(),
  //     DiscountCode: "4000",
  //     DiscountName: "No of Sessions",
  //     IsActive: false,
  //     IsEnable: true,
  //     IsAllowAdvBookDisc: false
  //   },
  //   // {
  //   //   AbsoluteValue: 0,
  //   //   NoofSessions:0,
  //   //   CreationTime: new Date().getTime(),
  //   //   DiscountCode: "4001",
  //   //   DiscountName: "No of Sessions",
  //   //   IsActive: false,
  //   //   IsEnable: true,
  //   //   IsAllowAdvBookDisc:false
  //   // }
  // ]

  parentClubKey: any = "";
  clubs: IClubDetails[];
  types = [];
  club_activities: Activity[] = [];
  selectedActivityType: any = "";
  coachs: ActivityCoach[] = [];
  activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
  selectedCoach: any;
  AssistedBy: any;
  selectedCoachName: any;
  activityCategoryList: ActivityCategory[] = [];
  selectActivityCategory: any;
  activityCategoryObj: any;
  isExistActivitySubCategory: boolean;
  activitySubCategoryList: ActivitySubCategory[] = [];
  selectActivitySubCategory: any;
  MemberListsForDeviceToken = [];
  selectedClub: any;
  isActivityCategoryExist = false;
  selectedInterval: any;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;

  maxDate: any;
  minDate: any;
  start_date: string;
  end_date: string;

  jsonData = {
    week: [
      { description: "No Limit" },
      { description: "01" },
      { description: "02" },
      { description: "03" },
      { description: "04" },
      { description: "05" },
      { description: "06" },
      { description: "07" },
      { description: "08" },
      { description: "09" },
      { description: "10" },
    ],
  };
  jsonDataInWeek = {
    payInAdvanceInWeek: [
      { description: "No Limit" },
      { description: "01 Weeks" },
      { description: "02 Weeks" },
      { description: "03 Weeks" },
      { description: "04 Weeks" },
      { description: "05 Weeks" },
      { description: "06 Weeks" },
      { description: "07 Weeks" },
      { description: "08 Weeks" },
      { description: "09 Weeks" },
      { description: "10 Weeks" },
    ],


  };
  jsonPayByDateData = {
    month: [
      { description: "01" },
      { description: "02" },
      { description: "03" },
      { description: "04" },
      { description: "05" },
      { description: "06" },
      { description: "07" },
      { description: "08" },
      { description: "09" },
      { description: "10" },
      { description: "11" },
      { description: "12" },

      { description: "13" },
      { description: "14" },
      { description: "15" },
      { description: "16" },
      { description: "17" },
      { description: "18" },
      { description: "19" },
      { description: "20" },
      { description: "21" },
      { description: "22" },
      { description: "23" },
      { description: "24" },

      { description: "25" },
      { description: "26" },
      { description: "27" },
      { description: "28" }
    ],
  };
  ses_interval_types: Array<any> = [
    { session: "Weekly", value: "weekly", IsActive: true },
    { session: "Trial", value: "trial", IsActive: false },
    // { session: "Single Session", value: "singlesession", IsActive: false },
    // { session: "1:1", value: "1:1", IsActive: false },

  ]
  vissibleSesAdv: string = "No Limit";
  payInAdvance = "";
  advSessions = "No Limit";
  currency: any;
  isDatesReadonly: boolean = false;
  //weeklyDets: any;
  nodeUrl: string = "";
  isAndroid: boolean = false;
  SessionMembers = [];
  clubVenues: ClubVenue[] = [];
  activities: ActivityModel[] = [];
  weeklyData: WeeklySessionDetails;
  editWeeklySession: EditWeeklySession = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    weekly_session_id: '',
    primary_coach_ids: [],
    secondary_coach_ids: [],
    session_name: '',
    start_time: '',
    duration: '',
    days: [],
    catagory: '',
    subCatagory: '',
    age_group: '',
    is_paid:false,
    session_status: 0,
    show_in_apkids: false,
    description: '',
    number_of_weeks: 0,
    contact_email: '',
    contact_phone: '',
    apply_capacity_restriction: false,
    capacity: 10,
    advance_booking_weeks: 0,
    advance_bookable_count: 0,
    advance_visible_sessions: 0,
    minimum_booking_count: 0,
    approve_first_booking: false,
    first_booking_message: '',
    fee_for_member: 0,
    fee_for_nonmember: 0,
    cancel_button_text: '',
    advance_booking_availability: false,
    allow_bacs_payment: false,
    allow_cash_payment: false,
    allow_pay_later: false,
    allow_reward_loyality: false,
    loyalty_mode: '',
    is_fixed_loyalty_allowed: false,
    fixed_loyalty_points: 0,
    payment_instructions: '',
    firebase_categorykey: '',
    firebase_subcategorykey: '',
    pay_button_text: 'Pay',
    discounts: [],
    start_date: '',
    end_date: ''
  }

  
  is_enrolls_there: boolean = false;
  constructor(public events: Events, public platform: Platform, private graphqlService: GraphqlService,
    private sharedservice: SharedServices, private selector: WheelSelector, public loadingCtrl: LoadingController, private modalCtrl: ModalController, private toastCtrl: ToastController, public alertCtrl: AlertController, public commonService: CommonService, public storage: Storage, public fb: FirebaseService, public popoverCtrl: PopoverController, public navCtrl: NavController, public navParams: NavParams) {
    this.isAndroid = this.platform.is('android');

    this.weeklyData = this.navParams.get("weeklysesdets");
    this.is_enrolls_there = this.navParams.get("is_enrolls_there");
    console.log("weekly Details is:", JSON.stringify(this.weeklyData));
    //this.nodeUrl = SharedServices.getTempNodeUrl();

   
    storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      console.log(currencydets);
      this.currency = currencydets.CurrencySymbol;
    });

    //dropdown data
    this.selectedClub = this.weeklyData.club.FirebaseId;
    this.selectedActivityType = this.weeklyData.ActivityDetails.FirebaseActivityKey;
    this.selectedCoach = this.weeklyData.primaryCoaches[0].coach.coach_firebase_id;
    this.selectActivityCategory = this.weeklyData.firebase_categorykey;
    //this.selectActivitySubCategory = this.weeklyData.firebase_subcategorykey;     

    this.parentClubKey = this.sharedservice.getParentclubKey();//firebase
    this.parentClubId = this.sharedservice.getPostgreParentClubId();//postgre
    this.getDiscounts();
    this.getClubList();
    this.getActivityList();
    this.getCoachListForGroup();
    this.getActivityCategoryList();
    this.getActivitySubCategoryList();
    this.getParentClubUserDetails(this.parentClubId)        
    
    const now = moment().add(10, 'year');
    this.maxDate = moment(now).format("YYYY-MM-DD");
    this.minDate = this.commonService.getTodaysDate();
    this.editWeeklySession.session_name = this.weeklyData.session_name;
    this.editWeeklySession.start_date = moment(this.weeklyData.start_date, "DD-MMM-YYYY").format("YYYY-MM-DD");
    this.editWeeklySession.end_date = moment(this.weeklyData.end_date, "DD-MMM-YYYY").format("YYYY-MM-DD");
    this.editWeeklySession.is_paid = this.weeklyData.is_paid;
    this.editWeeklySession.start_time = this.weeklyData.start_time;
    this.editWeeklySession.age_group = this.weeklyData.age_group;
    this.editWeeklySession.duration = this.weeklyData.duration;
    this.editWeeklySession.description = this.weeklyData.description;
    this.editWeeklySession.capacity = this.weeklyData.capacity;
    this.editWeeklySession.allow_pay_later = this.weeklyData.allow_paylater;
    this.editWeeklySession.allow_bacs_payment = this.weeklyData.allow_bacs_payment;
    this.editWeeklySession.allow_cash_payment = this.weeklyData.allow_cash_payment;
    this.editWeeklySession.apply_capacity_restriction = this.weeklyData.apply_capacity_restriction;
    this.editWeeklySession.approve_first_booking = this.weeklyData.approve_first_booking;
    this.editWeeklySession.minimum_booking_count = this.weeklyData.minimum_booking_count;
    this.editWeeklySession.payment_instructions = this.weeklyData.payment_instructions;
    this.editWeeklySession.fee_for_member = Number((this.weeklyData.fee_for_member));
    this.editWeeklySession.fee_for_nonmember = Number((this.weeklyData.fee_for_nonmember));
    this.editWeeklySession.allow_reward_loyality = this.weeklyData.is_loyalty_allowed;
    this.editWeeklySession.is_fixed_loyalty_allowed = this.weeklyData.is_fixed_loyalty_allowed;
    this.editWeeklySession.fixed_loyalty_points = this.weeklyData.fixed_loyalty_points;
   
     this.editWeeklySession.number_of_weeks = this.weeklyData.no_of_weeks;
     this.AssistedBy = this.weeklyData.secondaryCoaches[0].coach.coach_firebase_id;
     this.editWeeklySession.session_status=this.weeklyData.private_status;
     this.editWeeklySession.contact_email=this.weeklyData.contact_email;
     this.editWeeklySession.contact_phone=this.weeklyData.contact_phone;
     this.editWeeklySession.first_booking_message=this.weeklyData.first_booking_message;
    
    //adv visible sessions
    this.vissibleSesAdv = this.weeklyData.advance_visible_sessions && this.weeklyData.advance_visible_sessions!=100 ? this.weeklyData.advance_visible_sessions.toString():"No Limit";
    this.editWeeklySession.advance_visible_sessions = this.weeklyData.advance_visible_sessions && this.weeklyData.advance_visible_sessions!=100 ?this.weeklyData.advance_visible_sessions:100;

    //adv weeks
    this.editWeeklySession.advance_booking_weeks = this.weeklyData.advance_booking_weeks && this.weeklyData.advance_booking_weeks!==100 ?this.weeklyData.advance_booking_weeks:100;
    this.advSessions = this.weeklyData.advance_booking_weeks && this.weeklyData.advance_booking_weeks!==100 ?this.weeklyData.advance_booking_weeks.toString()+" "+"Weeks":"All";

    this.editWeeklySession.days = [this.weeklyData.days];
    //if start_date passed current_date or already enrol there we can't change the start and end_date
    this.isDatesReadonly = this.is_enrolls_there ? true:false; //moment(this.weeklyData.start_date,"DD-MM-YYYY").isBefore(moment()) || this.is_enrolls_there ? true:false;

    //this.isDatesReadonly = this.SessionMembers.length > 0 ? true : false;
    let tempdays = this.weeklyData.days.split(",");
    let DaysArray: Array<string> = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


    for (let i = 0; i < tempdays.length; i++) {
      switch (tempdays[i]) {
        case "Mon":
          this.days.push(1);
          this.isSelectMon = true;
          break;
        case "Tue":
          this.isSelectTue = true;
          this.days.push(2);
          break
        case "Wed":
          this.isSelectWed = true;
          this.days.push(3);
          break;
        case "Thu":
          this.isSelectThu = true;
          this.days.push(4);
          break;
        case "Fri":
          this.isSelectFri = true;
          this.days.push(5);
          break;
        case "Sat":
          this.isSelectSat = true;
          this.days.push(6);
          break;
        case "Sun":
          this.isSelectSun = true;
          this.days.push(7);
          break;
      }
    }
  }
  
  getDiscounts(){
    if(this.weeklyData.discounts.length > 0){
      for(const discount of this.weeklyData.discounts){
        if(discount.discount_types === 3000){ //free sessions
          this.weeklyDiscounts.free_sessions.is_active = true;
          //this.weeklyDiscounts.free_sessions.discount_amount = discount.discount_amount;
          this.weeklyDiscounts.free_sessions.discount_name = discount.discount_name;
          this.weeklyDiscounts.free_sessions.include_advance_booking_discount = discount.include_advance_booking_discount;
          this.weeklyDiscounts.free_sessions.multiple_of = Number(discount.no_of_session);
        }
        if(discount.discount_types === 3001){
          this.weeklyDiscounts.advance_booking.is_active = true;
          this.weeklyDiscounts.advance_booking.discount_amount = discount.discount_amount;
          this.weeklyDiscounts.advance_booking.discount_name = discount.discount_name;
          this.weeklyDiscounts.advance_booking.no_of_days_advance = discount.advance_no_of_days;
          //this.weeklyDiscounts.advance_booking.multiple_of = Number(discount.no_of_session);
        }
        if(discount.discount_types === 3005){
          this.weeklyDiscounts.no_of_sessions.is_active = true;
          this.weeklyDiscounts.no_of_sessions.discount_amount = discount.discount_amount;
          this.weeklyDiscounts.no_of_sessions.discount_name = discount.discount_name;
          this.weeklyDiscounts.no_of_sessions.include_advance_booking_discount = discount.include_advance_booking_discount;
          this.weeklyDiscounts.no_of_sessions.no_of_session = Number(discount.no_of_session);
        }
        if(discount.discount_types === 3011){
          this.weeklyDiscounts.all_session.is_active = true;
          this.weeklyDiscounts.all_session.discount_amount = discount.discount_amount;
          this.weeklyDiscounts.all_session.discount_name = discount.discount_name;
          // this.weeklyDiscounts.all_session.include_advance_booking_discount = this.weeklyDiscounts.free_sessions.include_advance_booking_discount;
          // this.weeklyDiscounts.all_session.multiple_of = Number(discount.no_of_session);
        }
      }
    }
  }

  getParentClubUserDetails(parentclubId) {
    const parentClub_query = gql`
    query getParentClub($parentclubId: String!){
      getParentClub(parentclubId:$parentclubId){
        Id
        ParentClubName
        ParentClubAppIconURL
        ParentClubAdminEmailID
        Website
        FireBaseId
        }
    }
    `;
    this.graphqlService.query(parentClub_query, { parentclubId: parentclubId },)
      .subscribe((res: any) => {
        this.parentClubData = res.data.getParentClub;

        if (this.parentClubData.length > 0) {
          for (let i = 0; i < this.parentClubData.length; i++) {
            this.editWeeklySession.contact_email = this.parentClubData[i].ParentClubAdminEmailID;
            //  this.createSession.contact_phone = data[i].ContactPhone;

          }
        }
      },
        (error) => {
          console.error("Error in fetching:", error);
        })
  }

  showPrompt(discount: any, index: number) {
    // let myModal = this.modalCtrl.create("EditweeklydiscountPage", { discountObj: discount });
    // myModal.onDidDismiss(data => {
    //   //console.log(data);  // <------- returning the SAME data I sent ...
    //   discount = discount;
    //   console.log(discount);
    // });
    // myModal.present();
    this.weeklyDiscounts.no_of_sessions.is_active = true;
    let myModal = this.modalCtrl.create("EditweeklydiscountPage", { discountObj: discount });
    myModal.onDidDismiss(data => {
      //console.log(data);  // <------- returning the SAME data I sent ...
      discount = discount;
      console.log(discount);
    });
    myModal.present();
  }



  //checking ispaid when sessin is trial
  CheckIsPaid() {
    console.log();
    setTimeout(() => {
      if (!this.editWeeklySession.is_paid) {
        this.isEndSlide = true;
        this.editWeeklySession.fee_for_member = 0.00;
        this.editWeeklySession.fee_for_nonmember = 0.00;
      } else {
        this.editWeeklySession.fee_for_member = Number((this.weeklyData.fee_for_member));
        this.editWeeklySession.fee_for_nonmember = Number((this.weeklyData.fee_for_nonmember));
        this.isEndSlide = false;
      }
    }, 500);
  }


  ionViewWillEnter() {

  }
  ionViewDidLoad() {
    this.myslider.lockSwipes(true);
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.showToast(message, 5000);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  CheckLoyaltyType(){
    
  }

  getClubList() {
    const clubs_input = {
      parentclub_id:this.sharedservice.getPostgreParentClubId(),
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
        if (this.clubs.length == 0) {
          // this.selectedClub = this.weeklyData.club.FirebaseId;
          // this.editWeeklySession.ClubKey = this.clubs[0].FirebaseId;
          this.commonService.toastMessage("No clubs found", 2500, ToastMessageType.Error);
        }
      
      },
      (error) => {
          console.error("Error in fetching:", error);
      })
  }

  getActivityList() {
    const club_activity_input: ClubActivityInput = {
      ParentClubKey: this.parentClubKey,
      ClubKey: this.selectedClub,
      VenueKey: this.selectedClub,
      AppType: 0, //0-Admin
      DeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }

    const clubs_activity_query = gql`
      query getAllActivityByVenue($input_obj: VenueDetailsInput!){
        getAllActivityByVenue(venueDetailsInput:$input_obj){
          ActivityCode
          ActivityName
          ActivityImageURL
          FirebaseActivityKey
          ActivityKey
        }
      }
      `;
    this.graphqlService.query(clubs_activity_query, { input_obj: club_activity_input }, 0)
      .subscribe((res: any) => {
        if (res.data.getAllActivityByVenue.length > 0) {
          this.club_activities = res.data.getAllActivityByVenue as Activity[];
          //console.log("clubs lists:", JSON.stringify(this.clubs));
          // this.selectedActivityType = this.club_activities[0].ActivityKey;
          // this.getCoachListForGroup();
          // this.getActivityCategoryList();
        } else {
          this.commonService.toastMessage("no activities found", 2500, ToastMessageType.Error)
        }


      },
        (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          // Handle the error here, you can display an error message or take appropriate action.
        })
  }


  getCoachListForGroup() {
    this.coachs = [];

    const club_coaches_input: ActivityInfoInput = {
      firebase_fields: {
        parentclub_id: this.parentClubKey,
        club_id: this.selectedClub,
        activity_id: this.selectedActivityType
      },
      AppType: 0, //0-Admin
      DeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }

    const activity_coaches_query = gql`
      query getAllActivityCoachs($input_obj: ActivityInfoInput!){
        getAllActivityCoachs(activityCoachsInput:$input_obj){
          EmailID
          FirstName
          LastName
          Gender
          DOB
          CoachId
        }
      }
      `;
    this.graphqlService.query(activity_coaches_query, { input_obj: club_coaches_input }, 0)
      .subscribe((res: any) => {
        if (res.data.getAllActivityCoachs.length > 0) {
          this.coachs = res.data.getAllActivityCoachs as ActivityCoach[];
          // this.selectedCoach = this.coachs[0].CoachId;
          // this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].LastName;
        } else {
          this.commonService.toastMessage("no coachs found", 2500, ToastMessageType.Error)
          this.selectedCoach = "";
          this.selectedCoachName = "";
        }
      },
        (error) => {
          console.error("Error in fetching:", error);
        })
  }


  //get activity category according to activity list
  //calling from getActivityList method
  //Done
  getActivityCategoryList() {

    const activity_categories_input: ActivityInfoInput = {
      firebase_fields: {
        parentclub_id: this.parentClubKey,
        club_id: this.selectedClub,
        activity_id: this.selectedActivityType,

      },
      AppType: 0, //0-Admin
      DeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }

    const activity_categories_query = gql`
      query getAllActivityCategories($input_obj: ActivityInfoInput!){
        getAllActivityCategories(activity_category_input:$input_obj){
          ActivityCategoryCode
          ActivityCategoryName
          ActivityCategoryId
        }
      }
      `;
    this.graphqlService.query(activity_categories_query, { input_obj: activity_categories_input }, 0)
      .subscribe((res: any) => {
        this.activityCategoryList = res.data.getAllActivityCategories as ActivityCategory[];
        if (this.activityCategoryList.length > 0) {
          this.activityCategoryList = res.data.getAllActivityCategories as ActivityCategory[];
          // this.selectActivityCategory = this.activityCategoryList[0].ActivityCategoryId;
          // this.editWeeklySession.catagory = this.activityCategoryList.find(ac => ac.ActivityCategoryId === this.selectActivityCategory).ActivityCategoryName;
          // this.getActivitySubCategoryList();
        } else {
          // this.selectedCoach = "";
          // this.selectedCoachName = "";
          // this.coachs = [];
          this.commonService.toastMessage("no activity categories found", 2500, ToastMessageType.Error)
        }
      },
      (error) => {
          console.error("Error in fetching:", error);
      })

  }

  getActivitySubCategoryList() {
    const activity_subcategories_input: ActivityInfoInput = {
      firebase_fields: {
        parentclub_id: this.parentClubKey,
        club_id: this.selectedClub,
        activity_id: this.selectedActivityType,
        category_id: this.selectActivityCategory
      },
      AppType: 0, //0-Admin
      DeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }

    const activity_sub_categories_query = gql`
      query getAllActivityCategorySubCategories($input_obj: ActivityInfoInput!){
        getAllActivityCategorySubCategories(activity_subcategory_input:$input_obj){
          ActivitySubCategoryCode
          ActivitySubCategoryName
          ActivitySubCategoryId
        }
      }
      `;
    this.graphqlService.query(activity_sub_categories_query, { input_obj: activity_subcategories_input }, 0)
      .subscribe((res: any) => {
        this.activitySubCategoryList = res.data.getAllActivityCategorySubCategories as ActivitySubCategory[];
        if(this.activitySubCategoryList.length > 0){
          this.isExistActivitySubCategory = true;
          if(!this.selectActivitySubCategory){ //first time
            this.selectActivitySubCategory = this.weeklyData.firebase_subcategorykey;
          }else{
            this.selectActivitySubCategory = this.activitySubCategoryList[0].ActivitySubCategoryId;
          }
          //this.isExistActivitySubCategory = this.selectActivitySubCategoryKey ? this.selectActivitySubCategoryKey : false;
        }else{
          this.commonService.toastMessage("no subcategories found",2500,ToastMessageType.Error)
        }
      },
      (error) => {
          console.error("Error in fetching:", error);
      })
  }

  onChangeCoach() {
    this.coachs.forEach(element => {
      if (element.CoachId == this.selectedCoach) {
        this.selectedCoachName = element.FirstName + " " + element.LastName;
      }
    });
  }

  selectInterval(index: number) {
    this.ses_interval_types[index].IsActive = true;
    if (this.ses_interval_types[index].IsActive) {
      this.ses_interval_types.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item.IsActive = false;
      });
    }

  }

  // onChangeOfClub method calls when we changing venue
  //Done
  onChangeOfClub() {

    this.selectedActivityType = "";
    this.selectedCoach = "";
    this.selectActivityCategory = "";
    this.types = [];
    this.coachs = [];
    this.activityCategoryList = [];


    // this.getFinancialYearList();
    this.getActivityList();
  }
  //onchange of activity type this method will call
  //Done
  onChangeActivity() {
    this.activitySubCategoryList = [];
    this.activityCategoryList = [];
    this.club_activities.forEach(element => {


    });
    this.getCoachListForGroup();
    this.getActivityCategoryList();
  }

  onChangeAssist() {

  }
  selectDays(day, index) {
    let isPresent = false;

    switch (day) {
      case "Mon":
        this.isSelectMon = !this.isSelectMon;
        break;
      case "Tue":
        this.isSelectTue = !this.isSelectTue;
        break;
      case "Wed":
        this.isSelectWed = !this.isSelectWed;
        break;
      case "Thu":
        this.isSelectThu = !this.isSelectThu;
        break;
      case "Fri":
        this.isSelectFri = !this.isSelectFri;
        break;
      case "Sat":
        this.isSelectSat = !this.isSelectSat;
        break;
      case "Sun":
        this.isSelectSun = !this.isSelectSun;
        break;
    }

    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i] == index) {
        this.days.splice(i, 1);
        isPresent = true;
      }
    }
    if (!isPresent) {
      this.days.push(index);
      console.log(this.days);
    }

    let end_date = moment(this.editWeeklySession.end_date);
    let start_date = moment(this.editWeeklySession.start_date);
    let noofweeks = end_date.diff(start_date, "weeks");
    console.log(noofweeks);
    this.editWeeklySession.number_of_weeks = noofweeks;
    this.number_of_sessions = noofweeks * this.days.length;
    console.log(this.days);
  }

  selectedDayDetails(day) {
    if (!this.editWeeklySession.days) {
      this.editWeeklySession.days = [day];
    }
    else {
      this.editWeeklySession.days.push(day);
    }
  }

  onChangeActivityCategory() {
    this.getActivitySubCategoryList();
  }

  // On Fees changes inputs
  inputChanged() {
    // this.weeklySessionObj.SessionFee = parseFloat((this.weeklySessionObj.NoOfWeeks * parseFloat(this.weeklySessionObj.FeesPerDayForMember)).toFixed(2)).toFixed(2);
    // this.weeklySessionObj.SessionFeeForNonMember = parseFloat((this.weeklySessionObj.NoOfWeeks * parseFloat(this.weeklySessionObj.FeesPerDayForNonMember)).toFixed(2)).toFixed(2);
    // this.weeklySessionObj.SessionFee = isNaN(parseFloat(this.weeklySessionObj.SessionFee)) ? "" : this.weeklySessionObj.SessionFee;
    // this.weeklySessionObj.SessionFeeForNonMember = isNaN(parseFloat(this.weeklySessionObj.SessionFeeForNonMember)) ? "" : this.weeklySessionObj.SessionFeeForNonMember;
  }

  //validating final slide and creating a session
  Update() {
    if (this.myslider.getActiveIndex() == 2) {

      // if (this.IsDiscountAllSessions) {
      //   if (this.discount.discount_name == "") {
      //     let message = "Please enter discount name.";
      //     this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      //     return false;
      //   } else if (this.discount.discount_amount == "0") {
      //     let message = "Please enter discount amount.";
      //     this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      //     return false;
      //   } else if (this.IsAdvBookAvailable) {
      //     if (this.discount.advance_no_of_days == 0) {
      //       let message = "Please enter no of advance days for the sesssion.";
      //       this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      //       return false;
      //     } else if (this.discount.discount_amount == "0") {
      //       let message = "Please enter discount amount for advanced sesssion.";
      //       this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      //       return false;
      //     } else {
      //       this.UpdateConfirmation();
      //     }
      //   } else {
      //     this.UpdateConfirmation();
      //   }
      // } else {
      //   this.UpdateConfirmation();
      // }
      this.UpdateConfirmation();
    } else {
      this.UpdateConfirmation();
    }
  }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  //Validating first two slides
  validateSlides() {
    if (this.myslider.getActiveIndex() == 0) {
      if (this.editWeeklySession.session_name == "" || this.editWeeklySession.session_name == undefined) {
        let message = "Please enter group name.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.selectedClub == "" || this.selectedClub == undefined) {
        let message = "Please select a venue.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.selectedActivityType == "" || this.selectedActivityType == undefined) {
        let message = "Please select an activity for the session creation.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
        let message = "Please select a coach for the session creation.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.selectActivityCategory && !this.selectActivitySubCategory) {
        let message = "Please choose subcategory.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      } if (this.editWeeklySession.contact_email!= "" && (!this.validateEmail(this.editWeeklySession.contact_email))) {
        let message = "Please enter correct email id";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else {
        return true;
      }
    }
    if (this.myslider.getActiveIndex() == 1) {
      if (this.days.length == 0) {
        let message = "Please select a day for the session.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.editWeeklySession.start_time == "" || this.editWeeklySession.start_time == undefined) {
        let message = "Please choose session start time.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.editWeeklySession.duration == "" || this.editWeeklySession.duration == undefined) {
        let message = "Enter Session Duration in minutes.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }

      // else if (this.editWeeklySession.StartDate == "" || this.weeklySessionObj.StartDate == undefined) {
      //   let message = "Please choose session start date.";
      //   this.showToast(message, 2500);
      //   return false;
      // }
      // else if (this.weeklySessionObj.EndDate == "" || this.weeklySessionObj.EndDate == undefined) {
      //   let message = "Please choose session end date.";
      //   this.showToast(message, 2500);
      //   return false;
      // }
      // else if (this.weeklySessionObj.PayByDate == "" || this.weeklySessionObj.PayByDate == undefined) {
      //   let message = "Please choose session pay by date.";
      //   this.showToast(message, 2500);
      //   return false;
      // }

      // else if (this.editWeeklySession.number_of_weeks == 0 || this.editWeeklySession.number_of_weeks == undefined) {
      //   let message = "Enter session duration in terms of weeks.";
      //   this.showToast(message, 2500);
      //   return false;
      // }
      // else if (this.editWeeklySession.number_of_weeks == 0 || this.editWeeklySession.number_of_weeks == undefined) {
      //   let message = "Enter session duration in terms of weeks.";
      //   this.showToast(message, 2500);
      //   return false;
      // }
      else {
        return true;
      }
    }
  }

  UpdateConfirmation() {
    let confirm = this.alertCtrl.create({
      title: "Session Edit",
      message: 'Are you sure you want to update the session?',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes:Update',
          handler: () => {
            this.initializeWeeklySession();
          }
        }
      ]
    });
    confirm.present();
  }

  multidaySessions: Array<any> = [];
  loading: any;
  
  eventfrom: string;
  CalcEndDate(ev: any) {

    if (this.number_of_sessions > 0 && this.eventfrom == "sescount") {
      let noofweeks = Math.round(this.number_of_sessions / this.days.length);
      console.log(moment(this.editWeeklySession.start_date).add(noofweeks, 'weeks'));
      let enddate: any;
      enddate = moment(this.editWeeklySession.start_date).add(noofweeks, 'weeks');
      this.editWeeklySession.end_date = moment(enddate).format("YYYY-MM-DD");
      this.editWeeklySession.number_of_weeks = noofweeks;
      console.log(ev);
      return false;
    }
  }

  enddateChanged(event: any) {
    console.log(event);
    //this.weeklySessionObj.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.weeklySessionObj.StartDate, this.weeklySessionObj.EndDate); // has to comment
    if (this.validateSessionDate() && this.eventfrom == "date") {
      //findout weeks b/w to dates and multiply no.of weeks with days length

      let end_date = moment(this.end_date);
      let start_date = moment(this.start_date);
      let noofweeks = end_date.diff(start_date, "weeks");
      console.log(noofweeks);
      this.editWeeklySession.number_of_weeks = noofweeks;
      this.number_of_sessions = noofweeks * this.days.length;
      this.editWeeklySession.number_of_weeks = noofweeks;
      return false;
    }
    // else {
    //   if(this.eventfrom == ""){
    //     this.weeklySessionObj.StartDate = this.weeklySessionObj.EndDate;
    //     this.weeklySessionObj.EndDate = this.weeklySessionObj.EndDate;
    //     this.weeklySessionObj.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.weeklySessionObj.StartDate, this.weeklySessionObj.EndDate); 
    //   }

    // }
  }


  dateChanged() {
    if (this.validateSessionDate()) {
      this.editWeeklySession.number_of_weeks = this.commonService.calculateWeksBetweenDates(this.start_date, this.end_date);
    } else {
      this.editWeeklySession.start_date = this.editWeeklySession.start_date;
      this.editWeeklySession.end_date = this.editWeeklySession.end_date;
      this.editWeeklySession.number_of_weeks = this.commonService.calculateWeksBetweenDates(this.start_date, this.end_date);
    }


  }


  validateSessionDate() {
    if (new Date(this.editWeeklySession.start_date).getTime() > new Date(this.editWeeklySession.end_date).getTime()) {
      this.showToast("Session start date should be greater than end date.", 5000);
      return false;
    }
    return true;
  }

  startdateChanged() {
    //this.weeklySessionObj.NoOfWeeks = Math.ceil( this.days.length / 7);
  }


  // Select advance weeks to pay
  AllowAdvanceBooking() {
    this.selector.show({
      title: "Advance Booking Session(s)",
      theme: this.isAndroid ? 'dark' : 'light',
      items: [
        this.jsonDataInWeek.payInAdvanceInWeek
      ],
    }).then(
      result => {
        console.log(result);
        console.log(result[0].description);
        this.advSessions = result[0].description;
        if (result[0].index != 0) {
          this.AdvSessionsBooking = result[0].description[0] + result[0].description[1];
          console.log(this.AdvSessionsBooking);
        } else {
          this.AdvSessionsBooking = "No Limit";
          console.log(this.AdvSessionsBooking);
        }
      },
      err => console.log('Error: ', err)
    );
  }


  // Select advance sessions to visible
  VisibleAdvanceSessions() {
    this.selector.show({
      title: "Advance Visible Sessions ",
      theme: this.isAndroid ? 'dark' : 'light',
      items: [
        this.jsonData.week
      ],
    }).then(
      result => {
        //this.vissibleSesAdv = result[0].description;
        if (result[0].index != 0) {
          this.vissibleSesAdv = result[0].description[0] + result[0].description[1];
        } else {
          this.vissibleSesAdv = "No Limit";
        }
      },
      err => console.log('Error: ', err)
    );
  }



  cancelSessionCreation() {
    let confirm = this.alertCtrl.create({
      message: 'Are you sure you want to cancel the session creation? ',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }

  sortTheDates(arrValuesToBeSort = []): Array<number> {
    let arr = arrValuesToBeSort;
    let iteration = arr.length;
    let sortedArray = [];
    let currentSmallElementIndex = 0;
    let currentElement;

    for (let count = 0; count < iteration; count++) {
      currentElement = arr[0];
      currentSmallElementIndex = 0;
      for (let loop = 1; loop < arr.length; loop++) {
        if (currentElement > arr[loop]) {
          currentSmallElementIndex = loop;
          currentElement = arr[loop];
        }
      }
      sortedArray.push(new Date(currentElement));
      arr.splice(currentSmallElementIndex, 1);
    }
    return sortedArray;
  }

  //Click on next button for previusslide
  GotoPrevious() {
    //this.myslider.slidePrev();// for testing
    this.isBeginSlide = this.myslider.isBeginning();
    if (!this.isBeginSlide) {
      this.myslider.lockSwipes(false);
      this.myslider.slidePrev();
      this.myslider.lockSwipes(true);
    }
  }

  //Click on next button for nextslide and validations
  GotoNext() {
    // this.myslider.lockSwipes(false);
    // this.myslider.slideNext();
    if (this.validateSlides()) {
      this.myslider.lockSwipes(false);
      let isSlideEnd = this.myslider.isEnd();
      if (!isSlideEnd) {
        this.myslider.slideNext();
        this.myslider.lockSwipes(true);
      }
    }
  }
  //when slide changed
  slideChanged() {
    setTimeout(() => {
      this.content.scrollToTop(200);
    });
    this.isBeginSlide = this.myslider.isBeginning();
    this.isEndSlide = this.myslider.isEnd();
    console.log(this.isEndSlide);
    let slideslen = this.myslider.length();
    console.log(slideslen);
  }

  async initializeWeeklySession() {
    // Display the loader
    try {
      this.prepareEditWeeklySession();
      await this.setCoachIds();
      this.formatDates();
      this.setupDiscounts();
      this.updateWeeklySession();
      console.log("created sssn:", JSON.stringify(this.editWeeklySession));
    } catch (err) {
      console.log("Error initializing weekly session:", err);
    }
  }

  prepareEditWeeklySession() {
    try{
      this.editWeeklySession.ParentClubKey = this.parentClubKey;
      this.editWeeklySession.DeviceType = this.sharedservice.getPlatform() === "android" ? 1 : 2;
      this.editWeeklySession.days = this.days.map(day => {
        return this.getDayAbbreviation(day);
      });
  
      if(this.isDatesReadonly){ //readonly means no change in start and end_date
        delete this.editWeeklySession.start_date
        delete this.editWeeklySession.end_date
        delete this.editWeeklySession.days
      }

      // if(this.AdvSessionsBooking == "No Limit"){
      //   this.editWeeklySession.advance_booking_weeks = 100;
      // }else{
      //   const str_length = this.AdvSessionsBooking.split(" ").length;
      //   this.editWeeklySession.advance_booking_weeks = str_length == 1 ? Number(this.AdvSessionsBooking) : Number(this.AdvSessionsBooking.split(" ")[0]);
      // }
      this.editWeeklySession.advance_booking_weeks = 100;
      this.editWeeklySession.advance_visible_sessions = this.vissibleSesAdv == "No Limit" ? 100 : Number(this.vissibleSesAdv),
      this.editWeeklySession.fee_for_member = Number((this.editWeeklySession.fee_for_member));
      this.editWeeklySession.fee_for_nonmember = Number((this.editWeeklySession.fee_for_nonmember));
      this.editWeeklySession.session_name = this.editWeeklySession.session_name;
      this.editWeeklySession.duration = this.editWeeklySession.duration;
      this.editWeeklySession.firebase_categorykey = this.selectActivityCategory;
      this.editWeeklySession.firebase_subcategorykey = this.selectActivitySubCategory;
      this.editWeeklySession.catagory = this.activityCategoryList.filter(ac => ac.ActivityCategoryId === this.selectActivityCategory)[0].ActivityCategoryName;
      this.editWeeklySession.subCatagory = this.activitySubCategoryList.filter(ac => ac.ActivitySubCategoryId === this.selectActivitySubCategory)[0].ActivitySubCategoryName;
      this.editWeeklySession.age_group = this.editWeeklySession.age_group;
      this.editWeeklySession.ClubKey = this.selectedClub;
      this.editWeeklySession.weekly_session_id = this.weeklyData.id;
      this.editWeeklySession.start_time = this.editWeeklySession.start_time;
      this.editWeeklySession.capacity = parseFloat(this.editWeeklySession.capacity.toString());
      //this.editWeeklySession.minimum_booking_count = parseFloat(this.editWeeklySession.minimum_booking_count.toString());
      this.editWeeklySession.session_status = parseFloat(this.editWeeklySession.session_status.toString());
      this.editWeeklySession.number_of_weeks = parseFloat(this.editWeeklySession.number_of_weeks.toString());
      this.editWeeklySession.allow_bacs_payment = this.editWeeklySession.allow_bacs_payment;
      this.editWeeklySession.allow_cash_payment = this.editWeeklySession.allow_cash_payment;
      this.editWeeklySession.allow_pay_later = this.editWeeklySession.allow_pay_later;
      this.editWeeklySession.apply_capacity_restriction = this.weeklyData.apply_capacity_restriction;
      this.editWeeklySession.approve_first_booking = this.editWeeklySession.approve_first_booking;
      this.editWeeklySession.minimum_booking_count = Number(this.editWeeklySession.minimum_booking_count);
      this.editWeeklySession.fixed_loyalty_points = Number(this.editWeeklySession.fixed_loyalty_points);
      this.editWeeklySession.payment_instructions = this.editWeeklySession.payment_instructions;
    
    }catch(err){
      this.commonService.toastMessage("Error preparing weekly session:", 2500,ToastMessageType.Error);
    }
  }

  async setCoachIds() {
    const pcoachId = await this.getCoachIdsByFirebaseKeys(this.selectedCoach);
    this.editWeeklySession.primary_coach_ids = [pcoachId];
    const scoachId = await this.getCoachIdsByFirebaseKeys(this.AssistedBy);
    this.editWeeklySession.secondary_coach_ids = [scoachId];
  }

  formatDates() {
    if (this.editWeeklySession.start_date) {
      const startDate = moment(this.editWeeklySession.start_date);
      this.editWeeklySession.start_date = startDate.format('DD-MMM-YYYY');
    }
    if (this.editWeeklySession.end_date) {
      const endDate = moment(this.editWeeklySession.end_date);
      this.editWeeklySession.end_date = endDate.format('DD-MMM-YYYY');
    }
  }

  setupDiscounts() {
    // let newDiscount = new CreateWeeklySessionDiscountDto();
    // if (this.IsLoyaltyAllowed === true) {
    //   this.editWeeklySession.is_fixed_loyalty_allowed = this.editWeeklySession.is_fixed_loyalty_allowed;
    //   this.editWeeklySession.fixed_loyalty_points = parseFloat(this.editWeeklySession.fixed_loyalty_points.toString());
    // }
    // if (this.IsDiscountAllSessions) {
    //   newDiscount = this.setupAllSessionDiscount(newDiscount);
    // }
    // if (this.IsAdvBookAvailable) {
    //   newDiscount = this.setupAdvanceBookingDiscount(newDiscount);
    // }
    // if (this.IsFreeSesAvail) {
    //   newDiscount = this.setupFreeSessionDiscount(newDiscount);
    // }
    // // Make sure that discount_type is set for each discount object
    // if (newDiscount.discount_type !== undefined) {
    //   this.editWeeklySession.discounts = [newDiscount];
    // } else {
    //   console.error("Discount type is not set properly");
    // }


     if(this.weeklyDiscounts.all_session.is_active) {
        const newDiscount = new CreateWeeklySessionDiscountDto();
        this.editWeeklySession.discounts.push(this.setupAllSessionDiscount(newDiscount))
      } 
      if(this.weeklyDiscounts.advance_booking.is_active) {
          const newDiscount = new CreateWeeklySessionDiscountDto();
          this.editWeeklySession.discounts.push(this.setupAdvanceBookingDiscount(newDiscount))
      } 
      if(this.weeklyDiscounts.free_sessions.is_active) {
          const newDiscount = new CreateWeeklySessionDiscountDto();
          this.editWeeklySession.discounts.push(this.setupFreeSessionDiscount(newDiscount))
      }
      if(this.weeklyDiscounts.no_of_sessions.is_active){
        const newDiscount = new CreateWeeklySessionDiscountDto();
        this.editWeeklySession.discounts.push(this.setupNoOfSessionDiscount(newDiscount))
      }
  }

  setupAllSessionDiscount(discount) {
    discount.advance_no_of_days =  0
    discount.discount_amount = this.weeklyDiscounts.all_session.discount_amount;
    discount.discount_name = this.weeklyDiscounts.all_session.discount_name;
    discount.discount_type = parseFloat(DiscountType.ALL_SESSION.toString());
    discount.include_advance_booking_discount = false
    discount.no_of_session = 0;          
    return discount;
  }
  
  setupAdvanceBookingDiscount(discount) {
    discount.advance_no_of_days = Number(this.weeklyDiscounts.advance_booking.no_of_days_advance)
    discount.discount_amount = this.weeklyDiscounts.advance_booking.discount_amount;
    discount.discount_name = this.weeklyDiscounts.advance_booking.discount_name;
    discount.discount_type = parseFloat(DiscountType.ADVANCE_BOOKING.toString());
    discount.include_advance_booking_discount = false
    discount.no_of_session = 0;
    return discount;
  }
  setupFreeSessionDiscount(discount) {
    discount.advance_no_of_days = 0;
    discount.discount_amount = "0";
    discount.discount_name = this.weeklyDiscounts.free_sessions.discount_name;
    discount.discount_type = parseFloat(DiscountType.FREE_SESSIONS.toString());
    discount.include_advance_booking_discount = this.weeklyDiscounts.free_sessions.include_advance_booking_discount;
    discount.no_of_session = Number(this.weeklyDiscounts.free_sessions.multiple_of);
    return discount;
  }
  setupNoOfSessionDiscount(discount) {
    discount.advance_no_of_days = 0;
    discount.discount_amount = this.weeklyDiscounts.no_of_sessions.discount_amount;
    discount.discount_name = this.weeklyDiscounts.no_of_sessions.discount_name;
    discount.discount_type = parseFloat(DiscountType.NO_OF_SESSIONS.toString());
    discount.include_advance_booking_discount = this.weeklyDiscounts.no_of_sessions.include_advance_booking_discount;
    discount.no_of_session = Number(this.weeklyDiscounts.no_of_sessions.no_of_session);
    return discount;
  }

  getDayAbbreviation(dayIndex) {
    switch (dayIndex) {
      case 1:
        return "Mon";
      case 2:
        return "Tue";
      case 3:
        return "Wed";
      case 4:
        return "Thu";
      case 5:
        return "Fri";
      case 6:
        return "Sat";
      case 7:
        return "Sun";
      default:
        return "";
    }
  }

  //update weekly session
  updateWeeklySession() {
    try {
      this.commonService.showLoader("Please wait")
      const editSesMutation = gql`
        mutation updateWeeklySession($editWeeklySession: EditWeeklySession!) {
            updateWeeklySession(editWeeklySession: $editWeeklySession){
                session_name
            }
        }`;
      const editMutationVariable = { editWeeklySession: this.editWeeklySession };
      this.graphqlService.mutate(
        editSesMutation,
        editMutationVariable,
        0
      ).subscribe(
        (response) => {
          this.commonService.hideLoader();
          const message = "Weekly session updated successfully";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.navCtrl.pop();
          this.commonService.updateCategory("update_session_list");
        },
        (err) => {
          this.commonService.hideLoader();
          console.error("GraphQL mutation error:", err);
          this.commonService.toastMessage("Session creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        },
      );
    } catch (err) {
      this.commonService.hideLoader();
      console.log("Error in updateWeeklySession:", err);
      // Hide loader in case of error
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

  getActivityIdsByFirebaseKeys(activity_ids): Promise<any> {
    return new Promise((res, rej) => {
      const activity_query = gql`
    query getActivityByFirebaseIds($activityIds: [String!]) {
      getActivityByFirebaseIds(activityIds: $activityIds){
        Id
        FirebaseActivityKey
        ActivityCode
        ActivityName
      }  
    }`
      const activity_query_variables = { activityIds: activity_ids };
      this.graphqlService.query(
        activity_query,
        activity_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getActivityByFirebaseIds"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })
  }

  getClubByFirebaseId(club_id): Promise<any> {
    return new Promise((res, rej) => {
      const club_query = gql`
    query getClubByFirebaseId($clubId: String!) {
      getClubByFirebaseId(firebaseId: $clubId){
        Id
        ClubName
      }  
    }`
      const club_query_variables = { clubId: club_id };
      this.graphqlService.query(
        club_query,
        club_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getClubByFirebaseId"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })
  }


}
