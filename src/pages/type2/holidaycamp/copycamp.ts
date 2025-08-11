import { NavController, LoadingController, Navbar, PopoverController, ToastController, AlertController, TabHighlight } from "ionic-angular";
import { Component, ViewChild } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Events, NavParams } from 'ionic-angular';
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
import { WheelSelector } from '@ionic-native/wheel-selector';
import moment, { Moment } from 'moment';
import { LanguageService } from '../../../services/language.service';
import { GraphqlService } from "../../../services/graphql.service";
import gql from "graphql-tag";
import { Activity, ActivityCoach, ActivityInfoInput, ClubActivityInput, IClubDetails, SchoolDto } from "../../../shared/model/club.model";
//import { IFirebaseCreateCamp } from "./models/firebase_create_camp.dto";
import { HolidayCamp, HolidayCampSessions } from "./models/holiday_camp.model";
import { CopyHolidayCampDTO } from "./models/copy_camp.dto";
//import { threadId } from "worker_threads";

/**
 * Generated class for the CopycampPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-copycamp',
  templateUrl: 'copycamp.html',
})
export class Type2CopyCamp {
  updatedCampStartDate;
  is_initial_req:boolean = true;
  schoolVenues: SchoolDto[] = [];
  selectedSchoolVenue: string = "";
  clubVenues: IClubDetails[] = [];
  selectedClub = "";
  activities: Activity[] = [];
  selectedActivity: string | string[];
  selectedCampDetails: HolidayCamp;
  //selectedCampDetails: any;
  selectedSessions: any
  //selectedSessionsConfigs: HolidayCampSessions[]=[]
  selectedSessionsConfigs = [];
  coaches: ActivityCoach[] = [];
  loggedin_user: string;
  selectedCoachName: any;


  club_activity_input: ClubActivityInput = {
    ParentClubKey: '',
    ClubKey: '',
    VenueKey: '',
    AppType: 0, //0-Admin
    DeviceType: 0
  }

  club_coaches_input: ActivityInfoInput = {
    firebase_fields: {
      parentclub_id: '',
      club_id: '',
      activity_id: ''
    },
    AppType: 0,
    DeviceType: 0
  }
  
  
  @ViewChild(Navbar) navBar: Navbar;
  LangObj: any = {};//by vinod
  allactivity = [];
  //Varriables
  themeType: any;
  parentClubKey: string = "";

  holidayCamp =
    {
      PayByDate: '',
      AgeGroup: '',
      CampName: '',
      CampType: 502, //Single day || Half day || multiple day codes
      ClubKey: '',
      ClubName: '',
      // CoachKey: '',
      // CoachName: '',
      VenueKey: "",
      VenueName: "",
      VenueType: "",
      CreationDate: new Date().getTime(),
      Description: '',
      Days: "",
      DurationPerDay: "00 hours:00 minutes",
      EarlyDropFees: '6.00',
      EndDate: "",
      FullAmountForMember: '0.00',
      FullAmountForNonMember: '0.00',
      ImageUrl: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FHoliday-Camp.png?alt=media&token=3d8ecc29-5e8b-4c06-a4fc-96f1862f5070',
      Instruction: "",
      IsActive: true,
      IsAllowMemberEnrollment: true,
      IsAllowEarlyDropAndLatePickUp: false,
      IsMultiSports: false,
      IsPromotionPushFlag: false,
      IsrestrictedSquadSize: false,
      LatePickUpFees: '6.00',
      MemberAllowmentText: '',
      Moderator: '',
      ParentClubKey: '',
      PerDayAmountForMember: '0.00',
      PerDayAmountForNonMember: '0.00',
      SquadSize: 30,
      StartDate: "",
      UpdatedDate: new Date().getTime(),
      Activity: {},
      Coach: {},
      VenueAddress: "",
      VenuePostCode: "",
      MinSessionBooking: 1,
      Session: {},
      Member: {},
      SessionConfig: {},
      AllowChildCare: true
    }
  //{ Key: 500, Value: "Half Day" },
  campList = [{ Key: 501, Value: "Single Day" }, { Key: 502, Value: "Multi Day" }];
  campType = 502;

  venues = [];
  selectedVenue: string = "";

  clubs = [];
  types = [];
  selectedActivityType: any;
  allActivities = [];
  allClubCoachAccordingToActivity = [];
  coachs = [];
  selectedCoach: any;

  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  days = [];



  multidayHolidayCampSessionList = [];
  multiDaySession = {
    AmountForMember: '0.00',
    AmountForNonMember: '0.00',
    CreationDate: new Date().getTime(),
    Duration: "04:00",
    EndTime: '',
    IsActive: true,
    SessionName: 'Session-1',
    StartTime: '09:00',
    UpdatedDate: new Date().getTime(),
    Day: "",
    SessionDate: '',
    SessionId: `${new Date().getTime()}0`
  }

  maxDate = "";
  totalDuration = {
    hour: "04",
    minute: "00"
  }

  jsonData = {
    hours: [
      { description: "00 hours" },
      { description: "01 hours" },
      { description: "02 hours" },
      { description: "03 hours" },
      { description: "04 hours" },
      { description: "05 hours" },
      { description: "06 hours" },
      { description: "07 hours" },
      { description: "08 hours" },
      { description: "09 hours" },
      { description: "10 hours" },
      { description: "11 hours" },
      { description: "12 hours" },
      { description: "13 hours" },
      { description: "14 hours" },
      { description: "15 hours" },
      { description: "16 hours" },
      { description: "17 hours" },
      { description: "18 hours" },
      { description: "19 hours" },
      { description: "20 hours" },
      { description: "21 hours" },
      { description: "22 hours" },
      { description: "23 hours" }
    ],
    minutes: [
      { description: "00 minutes" },
      { description: "15 minutes" },
      { description: "30 minutes" },
      { description: "45 minutes" },
    ]

  };
  userData: any;
  sessionList = [];
  perDaySessionList = [];
  SessionConfig = [];
  memberArr = [];
  minuteValues = "00";
  Currency: any;
  constructor(public graphqlService: GraphqlService, private navParams: NavParams, public events: Events, private selector: WheelSelector, public comonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private toastCtrl: ToastController, public navCtrl: NavController, public storage: Storage, public fb: FirebaseService, public sharedservice: SharedServices, public popoverCtrl: PopoverController, private langService: LanguageService) {
    this.userData = sharedservice.getUserData();
    // this.holidayCamp = navParams.get('CampDetails');
    this.selectedCampDetails = navParams.get('holidayCampDetails');
    this.selectedCampDetails.start_date = moment(this.selectedCampDetails.start_date, 'DD-MMM-YYYY').format('YYYY-MM-DD');
    this.selectedCampDetails.end_date = moment(this.selectedCampDetails.end_date, 'DD-MMM-YYYY').format('YYYY-MM-DD');
    this.selectedCampDetails.pay_by_date = moment(this.selectedCampDetails.pay_by_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
    //this.selectedSessions = this.selectedCampDetails.sessions;
    this.selectedSessionsConfigs = this.selectedCampDetails.session_configs;
    console.log('SELECTED Sessions CONFIG data  ' + JSON.stringify(this.selectedSessionsConfigs));
    console.log('SELECTED CAMPDetails data  ' + JSON.stringify(this.selectedCampDetails));
    console.log('SELECTED CAMPDetails start_date  ' + JSON.stringify(this.selectedCampDetails.start_date));


    for (let i = 1; i < 60; i++) {
      if (i % 5 == 0) {
        this.minuteValues += "," + i;
      }
    }
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();
    this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
   
    this.campType = this.holidayCamp.CampType;
    this.checkSelectedWeeks();
    console.log(this.holidayCamp);
    //get data from storage
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.loggedin_user = val.$key;
        this.club_activity_input.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.club_activity_input.DeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2
        this.club_coaches_input.firebase_fields.parentclub_id = val.UserInfo[0].ParentClubKey;
        this.club_coaches_input.DeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2
        this.getClubList();
      }
    });
    storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      //console.log(currencydets);
      this.Currency = currencydets.CurrencySymbol;
    });


    this.holidayCamp.MemberAllowmentText = "Enrol";
    //this.selectANumber();
  }


  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });


    this.comonService.screening("Type2CreateHolidayCamp");
    //when you clicked on device button
    this.navBar.backButtonClick = (e: UIEvent) => {
      console.log("todo something");
      this.checkIsFormFilled();
    }

  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  checkSelectedWeeks() {
    //****************************************** */
    //   Separating the selected days and binding with the days circle
    //   

    let x = this.selectedCampDetails.days.split(",");
    // let x = this.holidayCamp.Days.split(",");
    for (let i = 0; i < x.length; i++) {
      switch (x[i]) {
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

  convertDateFormat(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    const monthMap: { [key: string]: string } = {
      "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
      "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
    };
    return `${day}/${monthMap[month]}/${year}`;
  }

  onChangeOfSchoolVenue() {
    const school = this.schoolVenues.find(school => school.firebasekey === this.selectedSchoolVenue)
    if (school.VenueType == "School") {
      this.holidayCamp.VenueType = "School";
    } else {
      this.holidayCamp.VenueType = "Club";
    }
    this.holidayCamp.VenueKey = school.firebasekey;
    this.holidayCamp.VenueName = school.school_name;
    this.holidayCamp.VenuePostCode = school.postcode;
    this.holidayCamp.VenueAddress = school.firstline_address + " " + school.secondline_address;
  }


  onChangeOfClub() {
    //this.selectedActivity = "";
    this.activities = [];
    this.coaches = [];
    this.selectedCoach = "";
    this.club_coaches_input.firebase_fields.club_id = this.selectedClub;
    this.club_activity_input.VenueKey = this.selectedClub;
    this.getAllActivity();
  }

  async onChangeActivity() {
    // let temp_coaches = [];
    // if (!Array.isArray(this.selectedActivity)) {
    //   let str = this.selectedActivity;
    //   //this.selectedActivity = [];
    //   temp_coaches.push(str);
    // }else{
    //   temp_coaches = this.selectedActivity;
    // }
    // const coach_promise = []
    // for (var activity in temp_coaches) {
    //   this.club_coaches_input.firebase_fields.activity_id = temp_coaches[activity];
    //   coach_promise.push(this.getCoachList())
    // }

    // const tempCoaches = await Promise.all(coach_promise);
    // const uniqueCoaches = [];
    // for (const temp of tempCoaches) {
    //   if (Array.isArray(temp)) {
    //     for (const coach of temp) {
    //       // Add unique coaches to the final array:
    //       if (!uniqueCoaches.some(c => c.CoachId === coach.CoachId)) { // Assuming CoachId for uniqueness
    //         uniqueCoaches.push(coach);
    //       }
    //     }
    //   }
    // }
    // this.coaches = uniqueCoaches;
    // //this.selectedCoach = this.coaches.length > 0 ? this.coaches[0] : null;
    // if (this.coaches.length > 0) {
    //   this.selectedCoach = this.selectedCampDetails.Coach[0].coach_firebase_id;
    // }
    // console.log('coachesssss' + tempCoaches);
    if (!Array.isArray(this.selectedActivity)) {
      let str = this.selectedActivity;
      this.selectedActivity = [];
      this.selectedActivity.push(str);
    }
    const coach_promise = []
    for (var activity in this.selectedActivity) {
      this.club_coaches_input.firebase_fields.activity_id = this.selectedActivity[activity];
      coach_promise.push(this.getCoachList())
    }

    const tempCoaches = await Promise.all(coach_promise);
    const uniqueCoaches = [];
    for (const temp of tempCoaches) {
      if (Array.isArray(temp)) {
        for (const coach of temp) {
          // Add unique coaches to the final array:
          if (!uniqueCoaches.some(c => c.CoachId === coach.CoachId)) { // Assuming CoachId for uniqueness
            uniqueCoaches.push(coach);
          }
        }
      }
    }
    this.coaches = uniqueCoaches;
    //this.selectedCoach = this.coaches.length > 0 ? this.coaches[0] : null;
    if (this.coaches.length > 0) {
      //this.selectedCoach = this.coaches[0].CoachId;
      this.selectedCoach = this.selectedCampDetails.Coach[0].coach_firebase_id;
    }
    console.log('coachesssss' + tempCoaches);
  }
  

  onChangeCoach() {
    this.coaches.forEach(element => {
      if (element.CoachId == this.selectedCoach) {
        this.selectedCoachName = element.FirstName + " " + element.LastName;
      }
    });
  }


  //get club details
  getClubList() {
    const clubs_query = gql`
  query getParentClubVenues($firebase_parentclubId: String!){
    getParentClubVenues(firebase_parentclubId:$firebase_parentclubId){
        Id
        ClubName
        FirebaseId
        MapUrl
        sequence
    }
  }
  `;
    this.graphqlService.query(clubs_query, { firebase_parentclubId: this.parentClubKey }, 0)
      .subscribe((res: any) => {
        this.clubVenues = res.data.getParentClubVenues;
        console.log("clubs lists:", JSON.stringify(this.clubVenues));
        if (this.clubVenues.length > 0) {
          this.clubVenues = this.clubVenues.map((club_venue) => {
            return {
              VenueType: "Club",
              ...club_venue
            }
          })
          // this.selectedClub = this.clubVenues[0].FirebaseId;
          this.selectedClub = this.selectedCampDetails.club.FirebaseId;
          this.club_activity_input.VenueKey = this.selectedClub;
          this.club_coaches_input.firebase_fields.club_id = this.selectedClub;
          //this.getAllActivity();
          this.getSchools();
        } else {
          this.comonService.toastMessage("clubs not found", 2500, ToastMessageType.Error)
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
        })
  }

  //getSchools for venue purpose
  getSchools() {
    const schools_query = gql`
      query getParentClubSchoolsById($parentclubId: String!){
          getParentClubSchoolsById(parentclubId:$parentclubId){
             id
             school_name
             firebasekey
             postcode
             firstline_address
             secondline_address
          }
      }
      `;
    this.graphqlService.query(schools_query, { parentclubId: this.sharedservice.getPostgreParentClubId() }, 0)
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        // this.schoolVenues = res.data.getParentClubSchoolsById;
        if (res.data.getParentClubSchoolsById.length > 0) {
          this.schoolVenues = res.data.getParentClubSchoolsById.map((school_venue) => {
            return {
              VenueType: "School",
              ...school_venue,
              postcode: school_venue.postcode,
              firstline_address: school_venue.firstline_address,
              secondline_address: school_venue.secondline_address,
            }
          })
        }
        if (this.clubVenues.length > 0) {
          this.clubVenues.forEach((club_venue) => {
            this.schoolVenues.push({
              VenueType: "Club",
              id: '',
              school_name: club_venue.ClubName,
              firebasekey: club_venue.FirebaseId,
              postcode: '',
              firstline_address: '',
              secondline_address: ''
            })
          })
        }
        // console.table(this.schoolVenues);
        // console.table(this.clubVenues);
        if (this.schoolVenues.length != 0) {

          // this.selectedSchoolVenue = this.schoolVenues[0].firebasekey;
          this.selectedSchoolVenue = this.selectedCampDetails.venuekey;
          //this.onChangeOfSchoolVenue();
        }

        console.log("Venue List Data Is:", JSON.stringify(this.schoolVenues));
      },
        (error) => {
          // this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          // Handle the error here, you can display an error message or take appropriate action.
        })
  }

  //get Activity list
  getAllActivity() {
    const clubs_activity_query = gql`
      query getAllActivityByVenue($input_obj: VenueDetailsInput!){
        getAllActivityByVenue(venueDetailsInput:$input_obj){
          ActivityCode
          ActivityName
          ActivityImageURL
          FirebaseActivityKey
          ActivityKey
        }
      }`;
     this.graphqlService.query(clubs_activity_query, { input_obj: this.club_activity_input }, 0)
      .subscribe(async(res: any) => {
        if (res.data.getAllActivityByVenue.length > 0) {
          this.activities = res.data.getAllActivityByVenue;
          //console.log("getAllActivityByVenue DATA:", JSON.stringify(this.activities));
          // if(this.is_initial_req){
          //   if(Array.isArray(this.selectedCampDetails.Activity)){
          //    // console.table(`${this.selectedCampDetails.Activity}`)
          //    const exited_activities = [];
          //     this.selectedCampDetails.Activity.forEach(activity => exited_activities.push(activity.FirebaseActivityKey));
          //     //console.table(`filtered:${exited_activities}`)
          //     this.selectedActivity = exited_activities;
          //     this.is_initial_req = false;
          //     this.onChangeActivity();
          //   }
          // }else{
          //   this.selectedActivity = this.activities[0].ActivityKey;
          // }
          
          this.selectedActivity = this.selectedCampDetails.is_multi_sport ? this.selectedCampDetails.Activity.map(activity => activity.FirebaseActivityKey) : this.selectedCampDetails.Activity[0].FirebaseActivityKey;
          this.onChangeActivity();
        } else {
          this.comonService.toastMessage("no activities found", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
        }
      },
      (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          // Handle the error here, you can display an error message or take appropriate action.
      })
  }

  async getCoachList():Promise<ActivityCoach[]> {
    this.coaches = [];
    const ativity_coachs_input = {
      firebase_fields: {
        parentclub_id: this.parentClubKey,
        club_id: '',
        activity_id: this.club_coaches_input.firebase_fields.activity_id
      },
      AppType: 0,
      DeviceType: 0
    }
    return new Promise((res, rej) => {
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
      this.graphqlService.query(activity_coaches_query, { input_obj: ativity_coachs_input }, 0)
        .subscribe((response: any) => {
          res(response.data.getAllActivityCoachs);
        },
        (error) => {
            rej(error)
        })
    })     
  }

  //saving holidaycamp in postgre
  async saveCampInPostgre() {
    try{
      this.comonService.showLoader("Please wait");
      const holiday_camp = new CopyHolidayCampDTO(this.selectedCampDetails, this.selectedSessionsConfigs);
      if (this.holidayCamp.VenueType == 'School') {
        holiday_camp.holidaycamp_details.camp_postgre_fields.venue_id = await this.schoolVenues.find(school => school.firebasekey == this.selectedSchoolVenue).id;
      } else {
        holiday_camp.holidaycamp_details.camp_postgre_fields.venue_id = await this.clubVenues.find(club => club.FirebaseId == this.selectedSchoolVenue).Id;
      }
      
      holiday_camp.holidaycamp_details.venue_address = this.holidayCamp.VenueAddress;
      holiday_camp.holidaycamp_details.venue_post_code = this.holidayCamp.VenuePostCode;
      holiday_camp.holidaycamp_details.venue_type = this.holidayCamp.VenueType;
      
      holiday_camp.holidaycamp_details.updated_by = this.loggedin_user;
      holiday_camp.holidaycamp_details.camp_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
      holiday_camp.holidaycamp_details.camp_firebase_fields.club_id = this.selectedClub;
      holiday_camp.holidaycamp_details.camp_firebase_fields.parentclub_id = this.parentClubKey;
      holiday_camp.holidaycamp_details.camp_postgre_fields.coach_ids = await this.getCoachIdsByFirebaseKeys(this.selectedCoach);
      //holiday_camp.holidaycamp_details.days = this.holidayCamp.Days;
      var activities = [];
      if (!Array.isArray(this.selectedActivity)) {
        activities = Object.keys(this.selectedActivity)
      } else {
        for (var activity of this.selectedActivity) {
          activities.push(activity);
        }
      }
      
      if (!this.selectedCampDetails.is_early_drop_allowed) {
        holiday_camp.holidaycamp_details.early_drop_time = '08:00'
        holiday_camp.holidaycamp_details.early_drop_fee = '0.00'
        holiday_camp.holidaycamp_details.early_drop_non_member_fee = '0.00'
      }

       if(!this.selectedCampDetails.is_late_pickup_allowed) {
          holiday_camp.holidaycamp_details.late_pickup_time = '18:00'
          holiday_camp.holidaycamp_details.late_pickup_non_member_fee = '0.00'
          holiday_camp.holidaycamp_details.late_pickup_fee = '0.00'
        }

      if(!this.selectedCampDetails.is_lunch_allowed) {
        holiday_camp.holidaycamp_details.lunch_text = ''
        holiday_camp.holidaycamp_details.lunch_price = '0.00'
        holiday_camp.holidaycamp_details.lunch_price_non_member = '0.00'
      }

      if(!this.selectedCampDetails.is_snacks_allowed) {
        holiday_camp.holidaycamp_details.snacks_price = '0.00'
        holiday_camp.holidaycamp_details.snack_price_non_member = '0.00'
      }

      holiday_camp.holidaycamp_details.squad_size = Number(holiday_camp.holidaycamp_details.squad_size);
      holiday_camp.holidaycamp_details.minumum_session_booking = Number(holiday_camp.holidaycamp_details.minumum_session_booking);
      holiday_camp.holidaycamp_details.camp_postgre_fields.activity_ids = await this.getActivityIdsByFirebaseKeys(activities);
      holiday_camp.holidaycamp_details.camp_postgre_fields.club_id = await this.clubVenues.find(club => club.FirebaseId == this.selectedClub).Id;
      holiday_camp.holidaycamp_details.clubname = await this.clubVenues.find(club => club.FirebaseId == this.selectedClub).ClubName;
      holiday_camp.holidaycamp_details.camp_firebase_fields.camp_id = '';
      //const school = this.schoolVenues.find(schoolvenue => schoolvenue.firebasekey == this.selectedSchoolVenue);
  
      console.table(holiday_camp);
      
      const create_camp_mutation = gql`
      mutation createHolidayCamp($campInput: CreateHolidayCampDTO!) {
        createHolidayCamp(holidayCampCreateInput: $campInput){
          id
          camp_name
          camp_type
        }
      }`
  
      const variables = { campInput: holiday_camp }
  
      this.graphqlService.mutate(create_camp_mutation, variables, 0).subscribe(
        result => {
          this.comonService.hideLoader();
          // Handle the result
          // this.holidayCampResponse = result.data.createHolidayCamp;
          this.comonService.toastMessage("Successfully created camp", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.comonService.updateCategory('update_camps_list') ;
          console.log(`camp_created_res:${result}`);
          // console.log("CREATE CAMP RESPONSE Data:", JSON.stringify(this.holidayCampResponse));
          this.navCtrl.pop().then((nav)=> this.navCtrl.pop());
        },
        error => {
          this.comonService.hideLoader();
          this.comonService.toastMessage("Failed to copy camp", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          // Handle errors
          console.error(error);
        }
      );
    }catch(ex){
      this.comonService.hideLoader();
      this.comonService.toastMessage("Failed to copy camp", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
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

      this.graphqlService.query(coach_query, { coachIds: coach_ids }, 0).subscribe(
        result => {
          // Handle the result
          res(result.data["getCoachesByFirebaseIds"].map(coach => coach.Id));
        },
        error => {
          // Handle errors
          console.error(error);
        }
      );

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
      this.graphqlService.query(activity_query, { activityIds: activity_ids }, 0).subscribe(
        result => {
          // Handle the result
          res(result.data["getActivityByFirebaseIds"].map(activity => activity.Id));
        },
        error => {
          // Handle errors
          console.error(error);
        }
      );
    })
  }




  //checking some part of the form is filled,if filled showing confirmation prompt to go back or not
  checkIsFormFilled() {
    if (this.holidayCamp.CampName.trim() != "" && this.holidayCamp.CampName != undefined) {
      this.promptAlert();
    }
    else if (this.selectedVenue.trim() != "" && this.selectedVenue != undefined) {
      this.promptAlert();
    }
    else if (this.selectedClub.trim() != "" && this.selectedClub != undefined) {
      this.promptAlert();
    }
    else if (Array.isArray(this.selectedActivityType)) {
      if (this.selectedActivityType.length > 0) {
        this.promptAlert();
      }
    } else if (this.days.length > 0) {
      this.promptAlert();
    }
    else {
      this.navCtrl.pop();
    }
  }

  promptAlert() {
    let alert = this.alertCtrl.create({
      title: 'Discard Camp',
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

  selectANumber(session) {
    this.selector.show({
      title: "Duration",
      items: [
        this.jsonData.hours,
        this.jsonData.minutes
      ],
      theme: "dark",
    }).then(
      result => {
        //console.log(result[0].description + ' at index: ' + result[0].index);
        //alert(result[0].description);
        //alert(JSON.parse(result[1]));
        let hh = (result[0].description).split(" ");
        let mm = (result[1].description).split(" ");
        session.duration = hh[0] + ":" + mm[0];
      },
      err => console.log('Error: ', err)
    );
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.showToast(message, 3000);
  }

  showToast(m: string, dur: number = 3000) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }




  showPrompt() {
    let confirm = this.alertCtrl.create({
      title: 'Notification Alert',
      message: 'Are you sure you want to create holiday camp?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {

          }
        }
      ]
    });
    confirm.present();

  }

  //select days 

  selectDays(day, index) {
    let isPresent = false;

    switch (day) {
      case "Mon":
        this.isSelectMon = !this.isSelectMon;
        //this.selectedDayDetails(day);
        break;
      case "Tue":
        this.isSelectTue = !this.isSelectTue;
        //this.selectedDayDetails(day);
        break;
      case "Wed":
        this.isSelectWed = !this.isSelectWed;
        // this.selectedDayDetails(day);
        break;
      case "Thu":
        this.isSelectThu = !this.isSelectThu;
        // this.selectedDayDetails(day);
        break;
      case "Fri":
        this.isSelectFri = !this.isSelectFri;
        //this.selectedDayDetails(day);
        break;
      case "Sat":
        this.isSelectSat = !this.isSelectSat;
        //this.selectedDayDetails(day);
        break;
      case "Sun":
        this.isSelectSun = !this.isSelectSun;
        //this.selectedDayDetails(day);
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

  }

  removeMultidayHolidayCampSessionList(index) {
    this.selectedSessionsConfigs.splice(index, 1);
    this.comonService.toastMessage("Session removed successfully", 3000,ToastMessageType.Success);
  }

  addMultiDayHolidayCampSession() {
    const multiDaySession = {
      id: "",
      session_id: new Date().getTime(),
      session_name: 'Session-' + (this.selectedSessionsConfigs.length + 1),
      start_time:"",
      session_day: '',
      StartTime: '',
      duration: '01:00',
      AmountForNonMember: '0.00',
      amount_for_member: true,
      amount_for_non_member: "",
      session_date: "",
      capacity: `${new Date().getTime()}${this.selectedSessionsConfigs.length + 1}`
    };
    // this.singleHolidayCampSessionList.forEach(element => {
    //   this.singleDaySession.Duration = this.holidayCamp.TotalDuration - element.Duration;
    // });

    this.selectedSessionsConfigs.push(multiDaySession);
  }


  validateMultiDaySession(): boolean {
    if (this.selectedCampDetails.camp_name.trim() == "" || this.selectedCampDetails.camp_name == undefined) {
      let message = "Enter camp name";
      this.comonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedSchoolVenue.trim() == "" || this.selectedSchoolVenue == undefined) {
      let message = "Choose a venue.";
      this.comonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    if (this.selectedClub.trim() == "" || this.selectedClub == undefined) {
      let message = "Choose hosted by";
      this.comonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    if (Array.isArray(this.selectedActivityType)) {
      if (this.selectedActivityType.length == 0) {
        let msg = "Choose an activity";
        this.comonService.toastMessage(msg, 3000,ToastMessageType.Error);
        return false;
      }
    }
    if (!Array.isArray(this.selectedActivity)) {
      if (this.selectedActivity == undefined || this.selectedActivity.length == 0) {
        let msg = "Choose an activity";
        this.comonService.toastMessage(msg, 3000,ToastMessageType.Error);
        return false;
      }
    }
    else if (this.selectedCoach == undefined || this.selectedCoach.length == 0) {
      let msg = "Choose primary moderator";
      this.comonService.toastMessage(msg, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.selectedCoach == undefined || this.selectedCoach.length == 0) {
      let msg = "Choose primary moderator";
      this.comonService.toastMessage(msg, 3000,ToastMessageType.Error);
      return false;
    }

    else if(this.selectedCampDetails.camp_type == 502 && moment(this.selectedCampDetails.end_date,"YYYY-MM-DD").isBefore(moment(this.selectedCampDetails.start_date,"YYYY-MM-DD"))){
      const msg = "End date should be bigger than start date";
      this.comonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    else if (this.selectedCampDetails.camp_type == 502 && this.days.length == 0) {
      this.comonService.toastMessage("Please select day", 3000,ToastMessageType.Error);
      return false;
    }
    return true;

  }
  //keeping days in holiday camp
  selectedDayDetails(day) {

    if (this.selectedCampDetails.days == "") {
      this.selectedCampDetails.days += day;
    }
    else {
      this.selectedCampDetails.days += "," + day;
    }
  }
  //   transformAmount(element: any){
  //     let formattedAmount = this.currencyPipe.transform(this.amount, 'USD');
  //     // Remove or comment this line if you dont want
  //     // to show the formatted amount in the textbox.
  //     element.target.value = formattedAmount;
  //  }

  //create Holidaycamp
  createHolidayCamp() {
    // if (this.validateMultiDaySession()) {
    if (this.validateMultiDaySession()) {

      let multidaySessions = [];
      this.holidayCamp.CampType = this.campType;
      this.holidayCamp.ClubKey = this.selectedClub;
      this.holidayCamp.ParentClubKey = this.parentClubKey;
      //initialize club name in holiday camp object
      for (let i = 0; i < this.clubs.length; i++) {
        if (this.selectedClub == this.clubs[i].$key) {
          this.holidayCamp.ClubName = this.clubs[i].ClubName;
          break;
        }
      }
      //##### For creation of multiday camp 
      //##### multiday camp type code is 502 

      if (this.selectedCampDetails.camp_type == 502) {
        this.selectedCampDetails.days = "";
        this.days.sort();
        for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

          switch (this.days[daysIndex]) {
            // case 0:
            //   this.selectedDayDetails("Sun");
            //   break;
            case 1:
              this.selectedDayDetails("Mon");
              break;
            case 2:
              this.selectedDayDetails("Tue");
              break;
            case 3:
              this.selectedDayDetails("Wed");
              break;
            case 4:
              this.selectedDayDetails("Thu");
              break;
            case 5:
              this.selectedDayDetails("Fri");
              break;
            case 6:
              this.selectedDayDetails("Sat");
              break;
            case 7:
              this.selectedDayDetails("Sun");
              break;
          }
        }

        // let daysArray = this.selectedCampDetails.Days.split(",");
        let daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        // let startDate = new Date(this.selectedCampDetails.StartDate);
        // let endDate = new Date(this.selectedCampDetails.EndDate);
        let startDate = moment(new Date(this.selectedCampDetails.start_date));
        let endDate = moment(new Date(this.selectedCampDetails.end_date));
        let currentDate: any = startDate;
        let selectedDatesInSeconds = [];
        // for (let j = 0; j < this.days.length; j++) {
        //   currentDate = startDate;
        //   for (let i = 1; currentDate.getTime() < endDate.getTime(); i++) {
        //     if (this.days[j] == currentDate.getDay()) {
        //       selectedDatesInSeconds.push(currentDate.getTime());
        //     }
        //     currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        //   }
        // }
        for (let j = 0; j < this.days.length; j++) {
          currentDate = startDate;
          for (let i = 1; moment(currentDate).isSameOrBefore(endDate); i++) {
            if (this.days[j] == moment(currentDate).day()) {
              selectedDatesInSeconds.push(new Date(currentDate).getTime());
            }
            //currentDate = new Date(moment(currentDate).format("YYYY"), currentDate.getMonth(), currentDate.getDate() + 1);
            currentDate = moment(currentDate).add(1, "days");

          }
        }
        let x = this.sortTheDates(selectedDatesInSeconds);

        let sessionArr = [];
        x.forEach(element => {
          let d = new Date(element);
          // sessionArr.push({ SessionDate: d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() });
          //  let year="";
          //  let month="";
          //  let date="";
          //  sessionArr.push({ SessionDate: d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() });
          let date = moment(d).format("YYYY-MM-DD");
          sessionArr.push({ SessionDate: date });
        });

        let totoalAmountForMember = 0.00;
        let totalAmountForNonMember = 0.00;
        // create sesions according to day choosen by admin
        //Added on 14 june by abinash
        // holiday camp total duration calculation
        //

        let isExecute = true;
        this.selectedSessionsConfigs.forEach(element => {
          if (element.session_name == undefined || element.session_name.trim() == "") {
            this.comonService.toastMessage("Enter session name", 3000,ToastMessageType.Error);
            isExecute = false;

          } else if (isNaN(parseFloat(element.amount_for_member))) {
            this.comonService.toastMessage("Enter amount for member", 3000,ToastMessageType.Error);
            isExecute = false;

          } else if (isNaN(parseFloat(element.amount_for_non_member))) {
            this.comonService.toastMessage("Enter amount for non member", 3000,ToastMessageType.Error);
            isExecute = false;
          }
          else if (element.start_time == undefined || element.start_time.trim() == "") {
            this.comonService.toastMessage("Choose start time", 3000,ToastMessageType.Error);
            isExecute = false;
          }

          let duration = element.duration.split(":");
          let hh = duration[0];
          let mm = duration[1];


          let campDuraiton = this.selectedCampDetails.duration_per_day.split(":");
          console.log(this.selectedCampDetails.duration_per_day);
          let hhOfCamp: any = campDuraiton[0];
          let mmOfCamp: any = campDuraiton[1];
          if (+hhOfCamp == 0 && +mmOfCamp == 0) {
            this.comonService.toastMessage("Choose duration", 3000,ToastMessageType.Error);
            isExecute = false;
          }
          let minute = "0";
          let calculatedMinute = 0;
          let hour = "0";
          let remainderHour = 0;
          calculatedMinute = parseInt(mm) + parseInt(mmOfCamp);

          if (calculatedMinute >= 60) {
            remainderHour = calculatedMinute / 60;
            remainderHour = parseInt(remainderHour.toString());
            minute = (calculatedMinute - (remainderHour * 60)).toString();
          }
          else {
            minute = calculatedMinute.toString();
          }
          if (parseInt(minute) < 10) {
            minute = "0" + minute;
          }

          let calculatedHour = (parseInt(hh) + parseInt(hhOfCamp)) + remainderHour;
          calculatedHour = calculatedHour <= 24 ? calculatedHour : calculatedHour - 24;
          hour = calculatedHour < 10 ? "0" + calculatedHour : calculatedHour.toString();

          this.selectedCampDetails.duration_per_day = hour + ":" + minute;

        });

        //Ends here
        //

        if (isExecute) {
          for (let k = 0; k < sessionArr.length; k++) {
            for (let j = 0; j < this.selectedSessionsConfigs.length; j++) {

              //calculate endtime 
              let duration = this.selectedSessionsConfigs[j].duration.split(":");
              let hh = duration[0];
              let mm = duration[1];
              let hour = "";
              let minute = "";
              let time = this.selectedSessionsConfigs[j].start_time.split(":");
              let remainderHour = 0;
              let calculatedMinute = ((parseInt(time[1])) + (parseInt(mm)));
              if (calculatedMinute >= 60) {
                remainderHour = calculatedMinute / 60;
                remainderHour = parseInt(remainderHour.toString());
                minute = (calculatedMinute - (remainderHour * 60)).toString();
              }
              else {
                minute = calculatedMinute.toString();
              }
              if (parseInt(minute) < 10) {
                minute = "0" + minute;
              }

              let calculatedHour = (parseInt(time[0]) + parseInt(hh)) + remainderHour;
              calculatedHour = calculatedHour <= 24 ? calculatedHour : calculatedHour - 24;
              hour = calculatedHour < 10 ? "0" + calculatedHour : calculatedHour.toString();

              multidaySessions.push({
                AmountForMember: parseFloat(this.selectedSessionsConfigs[j].amount_for_member).toFixed(2),
                AmountForNonMember: parseFloat(this.selectedSessionsConfigs[j].amount_for_non_member).toFixed(2),
                CreationDate: new Date().getTime(),
                Duration: this.selectedSessionsConfigs[j].duration,
                EndTime: hour + ":" + minute,
                IsActive: this.selectedSessionsConfigs[j].IsActive,
                SessionName: this.selectedSessionsConfigs[j].session_name,
                StartTime: this.selectedSessionsConfigs[j].start_time,
                UpdatedDate: new Date().getTime(),
                Day: daysArray[new Date(sessionArr[k].session_date).getDay()],
                SessionDate: sessionArr[k].session_date,
                SessionId: this.selectedSessionsConfigs[j].id,
              });

              totoalAmountForMember = totoalAmountForMember + parseFloat(this.selectedSessionsConfigs[j].amount_for_member);
              totalAmountForNonMember = totalAmountForNonMember + parseFloat(this.selectedSessionsConfigs[j].amount_for_non_member);
            }
          }
          //
          // camp validation
          //
          //debanjan
          // if (this.selectedCampDetails.StartDate == this.holidayCamp.EndDate) {
          //   this.showToast("For multiday camp start date should be different to the end date", 3000);
          //   return;
          // }

          // else if (multidaySessions.length == 0) {
          //   this.showToast(`Selected day does not lie in between ${this.holidayCamp.StartDate} - ${this.holidayCamp.EndDate}`, 3000);
          //   return;
          // }
          //
          //ends here
          //
          this.selectedCampDetails.full_amount_for_member = totoalAmountForMember.toFixed(2);
          this.selectedCampDetails.full_amount_for_non_member = totalAmountForNonMember.toFixed(2);

          let prompt = this.alertCtrl.create({
            title: 'Full Price for the Camp',//Full Camp Amount
            //message: "For member = £" + this.holidayCamp.FullAmountForMember + " , For non-member= £" + this.holidayCamp.FullAmountForNonMember,
            message: `<div><p class="p1">Member: ${this.Currency}${this.selectedCampDetails.full_amount_for_member} </p><p class="p1">Non-member: ${this.Currency}${this.selectedCampDetails.full_amount_for_non_member}</p>
            <p class="p2">Enter the revised amount in case there is a discount if someone is booking all the sessions</p>
            <span class="span1">Member(${this.Currency})</span>
            <span class="span2">Non-member(${this.Currency})</span>
            </div>`,
            cssClass: 'camp_confirm_alert',
            inputs: [
              {
                name: 'FullAmountForMember',
                placeholder: 'For Non-member',
                value: this.selectedCampDetails.full_amount_for_member,
                type: "number"
              },
              {
                label: `Non-member(${this.Currency})`,
                name: 'FullAmountForNonMember',
                placeholder: 'Full amount for non-member',
                value: this.selectedCampDetails.full_amount_for_non_member,
                type: "number"
              },
            ],
            buttons: [
              {
                text: 'Cancel',
                handler: data => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Create Camp',
                handler: data => {

                  this.selectedCampDetails.full_amount_for_member = data.FullAmountForMember;
                  this.selectedCampDetails.full_amount_for_non_member = data.FullAmountForNonMember;
                  // this.comonService.hideLoader();
                  this.saveCampInPostgre();
                  
                }
              }
            ]
          });
          prompt.present();

        }

      }

      //
      //************ ends here  *************/
      //



      //##### For creation of singleday camp 
      //##### multiday camp type code is 501

      else if (this.selectedCampDetails.camp_type == 501) {
        let day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        this.selectedCampDetails.days = day[new Date(this.selectedCampDetails.start_date).getDay()];
        this.selectedCampDetails.end_date = this.selectedCampDetails.start_date;
        // this.holidayCamp.PayByDate = this.holidayCamp.PayByDate;

        let totoalAmountForMember = 0.00;
        let totalAmountForNonMember = 0.00;

        let isExecute = true;
        //Added on 14 june by abinash
        // holiday camp total duration calculation
        //
        this.selectedCampDetails.duration_per_day = "00 hours:00 minutes";
        let j = 0;
        this.selectedSessionsConfigs.forEach(element => {
          if (element.session_name == undefined || element.session_name.trim() == "") {
            this.comonService.toastMessage("Enter session name", 3000,ToastMessageType.Error);
            //return false;
            isExecute = false;
          }
          else if (element.start_time == undefined || element.start_time.trim() == "") {
            this.comonService.toastMessage("Choose start time", 3000,ToastMessageType.Error);
            isExecute = false;
          }

          else if (isNaN(parseFloat(element.amount_for_member))) {
            this.comonService.toastMessage("Enter amount for member", 3000,ToastMessageType.Error);
            //return false;
            isExecute = false;
          }

          else if (isNaN(parseFloat(element.amount_for_non_member))) {
            this.comonService.toastMessage("Enter amount for non member", 3000,ToastMessageType.Error);
            //return false;
            isExecute = false;
          }

          let duration = element.duration.split(":");
          let hh = duration[0];
          let mm = duration[1];

          let campDuraiton = this.selectedCampDetails.duration_per_day.split(":");
          let hhOfCamp = campDuraiton[0];
          let mmOfCamp = campDuraiton[1];

          let minute = "0";
          let calculatedMinute = 0;
          let hour = "0";
          let remainderHour = 0;
          calculatedMinute = parseInt(mm) + parseInt(mmOfCamp);

          if (calculatedMinute >= 60) {
            remainderHour = calculatedMinute / 60;
            remainderHour = parseInt(remainderHour.toString());
            minute = (calculatedMinute - (remainderHour * 60)).toString();
          }
          else {
            minute = calculatedMinute.toString();
          }
          if (parseInt(minute) < 10) {
            minute = "0" + minute;
          }

          let calculatedHour = (parseInt(hh) + parseInt(hhOfCamp)) + remainderHour;
          calculatedHour = calculatedHour <= 24 ? calculatedHour : calculatedHour - 24;
          hour = calculatedHour < 10 ? "0" + calculatedHour : calculatedHour.toString();

          this.selectedCampDetails.duration_per_day = hour + ":" + minute;
          //For time being patch done

          hour = "";
          minute = "";
          let time = this.selectedSessionsConfigs[j].start_time.split(":");
          remainderHour = 0;
          calculatedMinute = ((parseInt(time[1])) + (parseInt(mm)));
          if (calculatedMinute >= 60) {
            remainderHour = calculatedMinute / 60;
            remainderHour = parseInt(remainderHour.toString());
            minute = (calculatedMinute - (remainderHour * 60)).toString();
          }
          else {
            minute = calculatedMinute.toString();
          }
          if (parseInt(minute) < 10) {
            minute = "0" + minute;
          }

          calculatedHour = (parseInt(time[0]) + parseInt(hh)) + remainderHour;
          calculatedHour = calculatedHour <= 24 ? calculatedHour : calculatedHour - 24;
          hour = calculatedHour < 10 ? "0" + calculatedHour : calculatedHour.toString();
          // alert("ET:-" + hour + ":" + minute);
          multidaySessions.push({
            amount_for_member: parseFloat(this.selectedSessionsConfigs[j].amount_for_member).toFixed(2),
            amount_for_non_member: parseFloat(this.selectedSessionsConfigs[j].amount_for_non_member).toFixed(2),
            CreationDate: new Date().getTime(),
            Duration: this.selectedSessionsConfigs[j].duration,
            EndTime: hour + ":" + minute,
            IsActive: this.selectedSessionsConfigs[j].is_active,
            SessionName: this.selectedSessionsConfigs[j].session_name,
            StartTime: this.selectedSessionsConfigs[j].start_time,
            UpdatedDate: new Date().getTime(),
            Day: this.selectedCampDetails.days,
            SessionDate: this.selectedCampDetails.start_date
          });

          totoalAmountForMember = totoalAmountForMember + parseFloat(this.selectedSessionsConfigs[j].amount_for_member);
          totalAmountForNonMember = totalAmountForNonMember + parseFloat(this.selectedSessionsConfigs[j].amount_for_non_member);

          j++;

        });


        

        // perday amount and full day amount is same for single day camp
        // As single day camp held for only a day so fulday and singledayamount should be same

        // this.selectedCampDetails.per_day_amount_for_member = totoalAmountForMember.toFixed(2);
        // this.selectedCampDetails.per_day_amount_for_non_member = totalAmountForNonMember.toFixed(2);
        this.selectedCampDetails.full_amount_for_member = totoalAmountForMember.toFixed(2);
        this.selectedCampDetails.full_amount_for_non_member = totalAmountForNonMember.toFixed(2);
        if (isExecute) {
          let prompt = this.alertCtrl.create({
            title: 'Full Camp Amount',
            message: "For member = £" + this.selectedCampDetails.full_amount_for_member + " , For non-member= £" + this.selectedCampDetails.full_amount_for_non_member,
            inputs: [
              {
                name: 'FullAmountForMember',
                placeholder: 'Full amount for member',
                value: this.selectedCampDetails.full_amount_for_member
              },
              {
                name: 'FullAmountForNonMember',
                placeholder: 'Full amount for non-member',
                value: this.selectedCampDetails.full_amount_for_non_member
              },
            ],
            buttons: [
              {
                text: 'Cancel',
                handler: data => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Save',
                handler: data => {
                  //save 
                  //keeping data in db
                  this.selectedCampDetails.full_amount_for_member = data.FullAmountForMember;
                  this.selectedCampDetails.full_amount_for_non_member = data.FullAmountForNonMember;
                  this.saveCampInPostgre();
                }
              }
            ]
          });
          prompt.present();


        }


      }

      //
      //************ ends here  *************/
      //
    }

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


  onChangeMultisportsFlag() {
    if (this.activities.length > 0) {
      //this.activities = this.allactivity[0];
      if (this.activities.length != 0) {
        this.selectedActivity = this.activities[0].ActivityKey;
        this.onChangeActivity();
      }
    }

  }

  changeCampType() {
    this.selectedCampDetails.end_date = this.selectedCampDetails.start_date;
    this.selectedCampDetails.pay_by_date = this.selectedCampDetails.pay_by_date;
    this.selectedCampDetails.days = "";
  }

  cancel() {
    this.navCtrl.pop();
  }

  onChangeOfSessionMemberAmount() {
    this.selectedCampDetails.per_day_amount_for_member = "0.00";
    for (let i = 0; i < this.selectedSessionsConfigs.length; i++) {
      let calculateAmount = parseFloat(this.selectedSessionsConfigs[i].amount_for_member) + parseFloat(this.selectedCampDetails.per_day_amount_for_member);
      if (!isNaN(calculateAmount)) {
        this.selectedCampDetails.per_day_amount_for_member = calculateAmount.toFixed(2);
      }
    }
  }

  onChangeOfSessionNonMemberAmount() {
    this.selectedCampDetails.per_day_amount_for_non_member = "0.00";
    for (let i = 0; i < this.selectedSessionsConfigs.length; i++) {
      let calculateAmount = parseFloat(this.selectedSessionsConfigs[i].amount_for_non_member) + parseFloat(this.selectedCampDetails.per_day_amount_for_non_member);
      if (!isNaN(calculateAmount)) {
        this.selectedCampDetails.per_day_amount_for_non_member = calculateAmount.toFixed(2);
      }
    }
  }

}
