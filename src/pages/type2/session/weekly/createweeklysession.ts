import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content, Platform, NavController, NavParams, Navbar, LoadingController, ModalController, PopoverController, AlertController, ToastController, Slides } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { WheelSelector } from '@ionic-native/wheel-selector';
import gql from 'graphql-tag';
import { ActivityModel, ClubVenue, IClubDetails } from '../sessions_club.model';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput } from '../../../../shared/model/club.model';
import { CreateWeeklySession, CreateWeeklySessionDiscountDto, weekly_session_id_fields } from './create_weekly_session.dto';
import { SharedServices } from '../../../services/sharedservice';
import { GraphqlService } from '../../../../services/graphql.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { DiscountType } from './weeklyConstants/DiscountConstant';
import { IParentClubDetails } from '../../../../shared/model/parentclub.model';



/**
 * Generated class for the CreateweeklysessionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createweeklysession',
  templateUrl: 'createweeklysession.html',

})
export class CreateweeklysessionPage {
  @ViewChild(Content) content: Content;
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Navbar) navBar: Navbar;
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
   
    // {
    //   discount_header:"No of Sessions",
    //   advance_no_of_days: 0,
    //   discount_amount:"0",
    //   discount_name:"No of Sessions",
    //   discount_type:3005,
    //   include_advance_booking_discount:false,
    //   no_of_session:0,
    //   is_active:false
    // }
  
  parentClubId: string;
  parentClubKey: any = "";
  clubs: IClubDetails[];
  types = [];
  club_activities: Activity[] = [];
  selectedActivityType: any = "";
  coachs: ActivityCoach[] = [];
  selectedCoach: any;
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
  AssistedBy: any;

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
      { description: "01 Week" },
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
    // {session:"Single Session",value:"singlesession",IsActive:false},
    // {session:"1:1",value:"1:1",IsActive:false},
    { session: "Trial", value: "trial", IsActive: false },
  ]
  vissibleSesAdv = "No Limit";
  payInAdvance = "";
  advSessions = "No Limit";
  currency: any;
  sessionFor: string = "";
  isAndroid: boolean = false;
  title: any;
  loginUserDetails: any;
  clubVenues: ClubVenue[] = [];
  activities: ActivityModel[] = []

  createSession: CreateWeeklySession = {
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    camp_postgre_fields: new weekly_session_id_fields,
    session_name: '',
    start_date: '',
    start_time: '16:00',
    end_date: '',
    duration: '60',
    days: [],
    catagory: '',
    subCatagory: '',
    age_group: '',
    session_status: 1,
    show_in_apkids: false,
    description: '',
    number_of_weeks: 0,
    contact_email: '',
    contact_phone: '',
    apply_capacity_restriction: true,
    capacity: 10,
    advance_booking_weeks: 0,
    advance_bookable_count: 0,
    advance_visible_sessions: 0,
    minimum_booking_count: 1,
    is_paid:true,
    approve_first_booking: false,
    first_booking_message: '',
    fee_for_member: 10.00,
    fee_for_nonmember:12.00,
    cancel_button_text: '',
    advance_booking_availability: true,
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
    discounts: []
  }
 
  discount: CreateWeeklySessionDiscountDto = {
    discount_amount: '',
    discount_percentage: '',
    discount_name: 'Book All Session',
    discount_type: 0,
    discount_session_count: 0,
    advance_no_of_days: 2,
    no_of_session: 5,
    include_advance_booking_discount: false
  }

  constructor(public events: Events, 
    public platform: Platform, 
    private selector: WheelSelector,
     public loadingCtrl: LoadingController, 
     private modalCtrl: ModalController, 
     private toastCtrl: ToastController, 
     public alertCtrl: AlertController, 
     public commonService: CommonService, 
     public storage: Storage, public fb: FirebaseService, public popoverCtrl: PopoverController, public navCtrl: NavController, public navParams: NavParams,
    private sharedService: SharedServices, private graphqlService: GraphqlService, private sharedservice: SharedServices) {
    this.isAndroid = this.platform.is('android');
    this.sessionFor = navParams.get("session");
    console.log(this.sessionFor);

    this.createSession.first_booking_message = "Please send an email to your coach since you are booking for the first time in this group. Coach will discuss with you and add you in the group.";
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.loginUserDetails = val;
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;

        this.parentClubId = this.sharedService.getPostgreParentClubId();
        //api to get parent club data    
        this.getListOfClub();
        this.getParentClubUserDetails(this.parentClubId)
      }
    });
    storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      console.log(currencydets);
      this.currency = currencydets.CurrencySymbol;
    });
    
    this.createSession.start_date = moment().format("YYYY-MM-DD");
    this.createSession.end_date = moment((moment().add(2, 'month'))).format("YYYY-MM-DD");
    this.createSession.number_of_weeks = this.commonService.calculateWeksBetweenDates(this.createSession.start_date, this.createSession.end_date);
    let now = moment().add(10, 'year');
    this.maxDate = moment(now).format("YYYY-MM-DD");
    this.minDate = moment().format("YYYY-MM-DD");
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
            this.createSession.contact_email = this.parentClubData[i].ParentClubAdminEmailID;
            //this.createSession.contact_email
          }
        }
      },
        (error) => {
          console.error("Error in fetching:", error);
        })
  }


  showPrompt(discount) {
    this.weeklyDiscounts.no_of_sessions.is_active = true;
    let myModal = this.modalCtrl.create("EditweeklydiscountPage", { discountObj: discount });
    myModal.onDidDismiss(data => {
      //console.log(data);  // <------- returning the SAME data I sent ...
      discount = discount;
      console.log(discount);
    });
    myModal.present();
    //this.navCtrl.push("EditweeklydiscountPage", { navigationFrom: "create", CampDetails: this.campDetails });
  }

  //checking ispaid when sessin is trial
  CheckIsPaid() {
    console.log();
    setTimeout(() => {
      if (!this.createSession.is_paid) {
        //this.createSession.is_paid = false;
        this.isEndSlide = true;
        this.createSession.fee_for_member = 0.00;
        this.createSession.fee_for_nonmember = 0.00;
      } else {
        //this.createSession.is_paid = true;
        this.createSession.fee_for_member = 10.00;
        this.createSession.fee_for_nonmember = 12.00;
        this.isEndSlide = false;
      }
    }, 500);
  }

  ionViewWillEnter() {
    console.log("ionViewDidLoad CreateleaguePage");
  }

  ionViewDidLoad() {
    this.myslider.lockSwipes(true);
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });

    //when you clicked on device button
    this.navBar.backButtonClick = (e: UIEvent) => {
      console.log("todo something");
      this.checkIsFormFilled();
    }
  }


  checkIsFormFilled() {
    if (this.createSession.session_name != "" || this.createSession.end_date != "" || this.createSession.number_of_weeks != 0) {
      this.promptAlert();
    } else {
      this.navCtrl.pop();
    }
  }

  promptAlert() {
    let alert = this.alertCtrl.create({
      title: 'Discard Session',
      message: "Do you want to discard the changes ?",
      buttons: [
        {
          text: "Yes:Discard",
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Continue',
          role: 'cancel',
          handler: data => {

          }
        }
      ]
    });
    alert.present();
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

  getListOfClub() {
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
        this.selectedClub = this.clubs[0].FirebaseId;
        this.getActivityList();
      },
      (error) => {
          console.error("Error in fetching:", error);
      })
  }

  onChangeOfClub() {
    //this.selectedActivityType = "";
    this.selectedCoach = "";
    //this.selectActivityCategory = "";
    this.club_activities = [];
    this.coachs = [];
    this.activityCategoryList = [];
    this.getActivityList();
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
          this.selectedActivityType = this.club_activities[0].ActivityKey;
          this.getCoachListForGroup();
          this.getActivityCategoryList();
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
          this.selectedCoach = this.coachs[0].CoachId;
          this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].LastName;
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
          this.isActivityCategoryExist = true;
          this.selectActivityCategory = this.activityCategoryList[0].ActivityCategoryId;
          this.createSession.catagory = this.activityCategoryList.find(ac => ac.ActivityCategoryId === this.selectActivityCategory).ActivityCategoryName;
          this.getActivitySubCategoryList();
        } else {
          this.isActivityCategoryExist = false;
          this.selectActivityCategory = "";
          this.activityCategoryList = [];
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
        if (this.activitySubCategoryList.length > 0) {
          this.selectActivitySubCategory = this.activitySubCategoryList[0].ActivitySubCategoryId;
          this.createSession.subCatagory = this.activitySubCategoryList.find(ac => ac.ActivitySubCategoryId === this.selectActivitySubCategory).ActivitySubCategoryName;
          this.isExistActivitySubCategory = true;
        }else{
          this.selectActivitySubCategory = '';
          this.activitySubCategoryList = []
          this.isExistActivitySubCategory = false;
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

  //onchange of activity type this method will call
  //Done
  onChangeActivity() {
    this.selectedCoach = "";
    this.activitySubCategoryList = [];
    this.activityCategoryList = [];
    this.activitySubCategoryList = [];
    this.coachs = [];
    this.getCoachListForGroup();
    this.getActivityCategoryList();
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
    }

    let end_date = moment(this.createSession.end_date);
    let start_date = moment(this.createSession.start_date);
    let noofweeks = end_date.diff(start_date, "weeks");
    console.log(noofweeks);
    this.createSession.number_of_weeks = noofweeks;
    this.number_of_sessions = noofweeks * this.days.length;

  }
  days = [];
  selectedDayDetails(day) {

    if (!this.createSession.days) {
      this.createSession.days = [day];
    } else {
      this.createSession.days.push(day);
    }
  }
  onChangeActivityCategory() {

    this.getActivitySubCategoryList();
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

  onChangeAssist() {

  }



  // On Fees changes inputs
  inputChanged() {
  }


  //validating final slide and creating a session
  Create() {
    if (this.myslider.getActiveIndex() == 2) {
      if (this.IsDiscountAllSessions) {
        if (this.discount.discount_name == "") {

          let message = "Please enter discount name.";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
          return false;
        } else if (this.discount.discount_amount == "0") {
          let message = "Please enter discount amount.";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
          return false;
        } else if (this.IsAdvBookAvailable) {
          if (this.discount.advance_no_of_days == 0) {
            let message = "Please enter no of advance days for the sesssion.";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
            return false;
          } else if (this.discount.discount_amount == "0") {
            let message = "Please enter discount amount for advanced sesssion.";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
            return false;
          } else {
            this.CreateConfirmation();
          }
        } else {
          this.CreateConfirmation();
        }
      } else {
        this.CreateConfirmation();
      }
    } else { // means its a trial session
      if (this.validateSlides()) {
        this.CreateConfirmation();
      }
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
      if (this.createSession.session_name == "" || this.createSession.session_name == undefined) {
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
      } else if (this.selectActivityCategory == "" || this.selectActivitySubCategory == undefined) {
        let message = "Please choose subcategory.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.createSession.contact_email != "" && (!this.validateEmail(this.createSession.contact_email))) {
        let message = "Please enter correct email id";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      } 
      else if (this.AssistedBy == undefined || this.AssistedBy == '') {
        let message = "Please select assisted by";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else {
        return true;
      }
    }
    if (this.myslider.getActiveIndex() == 1) {
      if (this.days.length == 0) {
        let message = "Please select days for the session.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.createSession.start_time == "" || this.createSession.start_time == undefined) {
        let message = "Please choose session start time.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.createSession.duration == "" || this.createSession.duration == undefined) {
        let message = "Enter Session Duration in minutes.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }

      else if (this.createSession.start_date == "" || this.createSession.start_date == undefined) {
        let message = "Please choose session start date.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.createSession.end_date == "" || this.createSession.end_date == undefined) {
        let message = "Please choose session end date.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      // else if (this.weeklySessionObj.PayByDate == "" || this.weeklySessionObj.PayByDate == undefined) {
      //   let message = "Please choose session pay by date.";
      //   this.showToast(message, 2500);
      //   return false;
      // }

      else if (this.createSession.number_of_weeks == 0 || this.createSession.number_of_weeks == undefined) {
        let message = "Enter session duration in terms of weeks.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else if (this.createSession.number_of_weeks == 0 || this.createSession.number_of_weeks == undefined) {
        let message = "Enter session duration in terms of weeks.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }
      else {
        return true;
      }
    }
  }

  //create weekly confirmation
  CreateConfirmation() {
    let confirm = this.alertCtrl.create({
      title: "Session Creation",
      message: 'Are you sure you want to create the session?',
      buttons: [
        {
          text: 'No',
          handler: () => {}
        },
        {
          text: 'Yes:Create',
          handler: () => {
            this.saveSessionInPostgre();
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
    // if (this.weeklySessionObj.NoOfSessions > 0 && this.eventfrom == "sescount") {
    //   let noofweeks = Math.round(this.weeklySessionObj.NoOfSessions / this.days.length);
    //   console.log(moment(this.weeklySessionObj.StartDate).add(noofweeks, 'weeks'));
    //   let enddate: any;
    //   enddate = moment(this.weeklySessionObj.StartDate).add(noofweeks, 'weeks');
    //   this.weeklySessionObj.EndDate = moment(enddate).format("YYYY-MM-DD");
    //   this.weeklySessionObj.NoOfWeeks = noofweeks;
    //   console.log(ev);
    //   return false;
    // }

    if (this.number_of_sessions > 0 && this.eventfrom == "sescount") {
      let noofweeks = Math.round(this.number_of_sessions / this.days.length);
      console.log(moment(this.createSession.start_date).add(noofweeks, 'weeks'));
      let enddate: any;
      enddate = moment(this.createSession.start_date).add(noofweeks, 'weeks');
      this.createSession.end_date = moment(enddate).format("YYYY-MM-DD");
      this.createSession.number_of_weeks = noofweeks;
      console.log(ev);
      return false;
    }
  }

  validateSessionDate() {
    if (new Date(this.createSession.start_date).getTime() > new Date(this.createSession.end_date).getTime()) {
      this.commonService.toastMessage("Session start date should be greater than end date", 2500, ToastMessageType.Error);
      return false;
    }
    return true;
  }

  dateChanged() {
    if (this.validateSessionDate()) {
      this.createSession.number_of_weeks = this.commonService.calculateWeksBetweenDates(this.createSession.start_date, this.createSession.end_date);
    } else {
      this.createSession.start_date = this.createSession.start_date;
      this.createSession.end_date = this.createSession.end_date;
      this.createSession.number_of_weeks = this.commonService.calculateWeksBetweenDates(this.createSession.start_date, this.createSession.end_date);
    }


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
        this.advSessions = result[0].description;
        if (result[0].index != 0) {
          this.AdvSessionsBooking = result[0].description[0] + result[0].description[1];
          console.log(this.AdvSessionsBooking);
        } else {
          this.AdvSessionsBooking = "No Limit";
          console.log(this.AdvSessionsBooking);
        }
        console.log(this.advSessions);
        console.log(this.AdvSessionsBooking);
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
        this.vissibleSesAdv = result[0].description;
        if (result[0].index != 0) {
          this.AdvanceVisibleSes = result[0].description[0] + result[0].description[1];
        } else {
          this.AdvanceVisibleSes = "No Limit";
        }
        console.log(result);
        console.log(this.vissibleSesAdv);
        console.log(this.AdvanceVisibleSes);
      },
      err => console.log('Error: ', err)
    );
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

  CheckLoyaltyType(){
    setTimeout(()=>{
      //console.log(this.sessionDetails.IsFixedLoyaltyAllowed);
      if(this.createSession.is_fixed_loyalty_allowed){
        this.fb.getAllWithQuery(`StandardCode/Wallet/LoyaltyPoint/${this.parentClubKey}/${this.selectedClub}/Reward/${this.selectedActivityType}`,{ orderByKey: true, equalTo: "TermGroupSession" }).subscribe((data) => {
          if(data.length > 0 && data[0].IsActive){
            this.createSession.fixed_loyalty_points = 0.0;
            this.createSession.fixed_loyalty_points = (data[0].StandardPoint) * this.createSession.fee_for_member;
          }
        });
      }else{
        this.createSession.fixed_loyalty_points = 0.00;
      }
    },200);
  }
 
  
  
//creating weekly session
async saveSessionInPostgre() {
    try {
        const parentClubId = this.sharedservice.getPostgreParentClubId();
        this.createSession.camp_postgre_fields.parentclub_id = parentClubId;
        this.createSession.DeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.createSession.days = this.days.map(dayIndex => this.getDayAbbreviation(dayIndex)).sort();
        this.createSession.fixed_loyalty_points = Number(this.createSession.fixed_loyalty_points);
        const [clubId, activityId, pCoachId, sCoachId] = await Promise.all([
            this.getClubByFirebaseId(this.selectedClub),
            this.getActivityIdsByFirebaseKeys(this.selectedActivityType),
            this.getCoachIdsByFirebaseKeys(this.selectedCoach),
            this.getCoachIdsByFirebaseKeys(this.AssistedBy)
        ]);

        this.createSession.camp_postgre_fields.club_id = clubId;
        this.createSession.camp_postgre_fields.activity_id = activityId;
        this.createSession.camp_postgre_fields.primary_coach_ids = [pCoachId];
        this.createSession.camp_postgre_fields.secondary_coach_ids = [sCoachId];
        
        if(this.createSession.camp_postgre_fields.club_id == "" || this.createSession.camp_postgre_fields.club_id == undefined){
          this.commonService.toastMessage("Club fetch failed",2500,ToastMessageType.Error);
          return false;
        }
        if(this.createSession.camp_postgre_fields.activity_id == "" || this.createSession.camp_postgre_fields.activity_id == undefined){
          this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
          return false;
        }
        if(this.createSession.camp_postgre_fields.primary_coach_ids.length == 0){
          this.commonService.toastMessage("Coaches fetch failed",2500,ToastMessageType.Error);
          return false;
        }

        this.createSession.firebase_categorykey = this.selectActivityCategory;
        this.createSession.firebase_subcategorykey = this.selectActivitySubCategory;
        this.createSession.catagory = this.activityCategoryList.find(x => x.ActivityCategoryId == this.selectActivityCategory).ActivityCategoryName;
        this.createSession.subCatagory = this.activitySubCategoryList.find(x => x.ActivitySubCategoryId == this.selectActivitySubCategory).ActivitySubCategoryName;
        this.createSession.description=this.createSession.description;
        this.createSession.age_group=this.createSession.age_group; 
        this.createSession.first_booking_message=this.createSession.first_booking_message;

        this.createSession.capacity = parseFloat(this.createSession.capacity.toString());
        this.createSession.minimum_booking_count = parseFloat(this.createSession.minimum_booking_count.toString());
        this.createSession.session_status = parseFloat(this.createSession.session_status.toString());
        this.createSession.number_of_weeks = parseFloat(this.createSession.number_of_weeks.toString());
        this.createSession.allow_bacs_payment = this.createSession.allow_bacs_payment;
        this.createSession.allow_cash_payment = this.createSession.allow_cash_payment;
        this.createSession.allow_pay_later = this.createSession.allow_pay_later;
        //this.createSession.advance_booking_weeks = this.AdvSessionsBooking == "No Limit" ? 100: Number(this.AdvSessionsBooking)
        this.createSession.advance_booking_weeks = 100;
        this.createSession.advance_visible_sessions = this.vissibleSesAdv == "No Limit" ? 100 : Number(this.AdvanceVisibleSes),
        this.createSession.advance_booking_availability = true,

        this.formatDates();
        this.setupCostAndLoyalty();
        this.setupDiscounts();
        
        //console.log("Created session:", JSON.stringify(this.createSession));
        //alert(this.createSession.advance_booking_weeks) //allow advance booking weeks
        //alert(this.createSession.advance_visible_sessions);//allow advance booking sessions
        //return false;
        this.executeCreateWeeklySessionMutation();
    } catch (error) {
        console.error("Error saving session in Postgre:", error);
        this.commonService.toastMessage("Creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        throw error; // Re-throw error for handling in higher level
    }
}

formatDates() {
    if (this.createSession.start_date) {
        const startDate = moment(this.createSession.start_date);
        this.createSession.start_date = startDate.format('DD-MMM-YYYY');
    }
    if (this.createSession.end_date) {
        const endDate = moment(this.createSession.end_date);
        this.createSession.end_date = endDate.format('DD-MMM-YYYY');
    }
}

setupCostAndLoyalty() {
    this.createSession.fee_for_member = parseFloat(this.createSession.fee_for_member.toString());
    this.createSession.fee_for_nonmember = parseFloat(this.createSession.fee_for_nonmember.toString());
    if (this.IsLoyaltyAllowed) {
        this.createSession.is_fixed_loyalty_allowed = this.createSession.is_fixed_loyalty_allowed;
        this.createSession.fixed_loyalty_points = parseFloat(this.createSession.fixed_loyalty_points.toString());
    }
}

setupDiscounts() {
    //let newDiscount = new CreateWeeklySessionDiscountDto();
    if (this.weeklyDiscounts.all_session.is_active) {
        const newDiscount = new CreateWeeklySessionDiscountDto();
        this.createSession.discounts.push(this.setupAllSessionDiscount(newDiscount))
    } 
    if (this.weeklyDiscounts.advance_booking.is_active) {
        const newDiscount = new CreateWeeklySessionDiscountDto();
        this.createSession.discounts.push(this.setupAdvanceBookingDiscount(newDiscount))
    } 
    if (this.weeklyDiscounts.free_sessions.is_active) {
        const newDiscount = new CreateWeeklySessionDiscountDto();
        this.createSession.discounts.push(this.setupFreeSessionDiscount(newDiscount))
    }
    if(this.weeklyDiscounts.no_of_sessions.is_active){
      const newDiscount = new CreateWeeklySessionDiscountDto();
      this.createSession.discounts.push(this.setupNoOfSessionDiscount(newDiscount))
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

async executeCreateWeeklySessionMutation() {
  try{
    this.commonService.showLoader("Please wait")
    const createWeeklySessionMutation = gql`
        mutation createWeeklySession($createWeeklySessionDto: CreateWeeklySession!) {
            createWeeklySession(createWeeklySessionDto: $createWeeklySessionDto){
                session_name
                firebase_categorykey
                firebase_subcategorykey
                category_name
                sub_category_name
                description
                age_group
                ClubKey
            }
        }`;
    const mutationVariables = { createWeeklySessionDto: this.createSession };
    
    await this.graphqlService.mutate(createWeeklySessionMutation, mutationVariables, 0).toPromise();
    this.commonService.hideLoader();
    const message = "Weekly session created successfully";
    this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    this.navCtrl.pop();
    this.commonService.updateCategory("update_session_list");
  }catch(error){
    this.commonService.hideLoader();
    this.commonService.toastMessage("Creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
  }
  
}

getDayAbbreviation(dayIndex) {
    const daysAbbreviation = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysAbbreviation[dayIndex] || "";
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

