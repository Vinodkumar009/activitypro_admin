//Author: Abinash Pradhan
//Date:- 06/10/2017
//Creation of holiday camp


import { NavController, LoadingController, Navbar, PopoverController, ToastController, AlertController } from "ionic-angular";
import { Component, ViewChild } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Events } from 'ionic-angular';
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
import { WheelSelector } from '@ionic-native/wheel-selector';
import moment, { Moment } from 'moment';
import { IFirebaseCreateCamp } from "./models/firebase_create_camp.dto";
import { CreateHolidayCampDTO } from "./models/create_camp.dto";
import gql from "graphql-tag";
import { GraphqlService } from "../../../services/graphql.service";
import { Activity, ActivityCoach, ActivityInfoInput, ClubActivityInput, IClubDetails, SchoolDto } from "../../../shared/model/club.model";
import { HolidayCamp } from "./models/holiday_camp.model";
//import { CurrencyPipe } from "@angular/common";
@IonicPage()
@Component({
  selector: 'createholidaycamp-page',
  templateUrl: 'createholidaycamp.html'
})
// @Pipe({name: 'currency'})
export class Type2CreateHolidayCamp {
  @ViewChild(Navbar) navBar: Navbar;
  LangObj: any = {};//by vinod
  allactivity = [];

  //Varriables
  themeType: any;
  parentClubKey: string = "";

  holidayCampResponse: HolidayCamp;
  schoolVenues: SchoolDto[] = [];
  selectedSchoolVenue: string = "";
  clubVenues: IClubDetails[] = [];
  selectedClub:string = "";
  activities: Activity[] = [];
  selectedActivity: string | string[];
  coaches: ActivityCoach[] = [];
  selectedCoach: string;
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

  holidayCamp: IFirebaseCreateCamp =
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
      EndDate: "",
      FullAmountForMember: '0.00',
      FullAmountForNonMember: '0.00',
      ImageUrl: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FHoliday-Camp.png?alt=media&token=3d8ecc29-5e8b-4c06-a4fc-96f1862f5070',
      Instruction: "",
      IsActive: true,
      IsAllowMemberEnrollment: true,
      IsAllowEarlyDrop:false,
      IsAllowLatePickUp: false,
      IsAllowLunch: false,
      IsAllowSnacks: false,
      LunchPrice_Member:'0.00',      
      LunchPrice_NonMember:'0.00',
      SnacksPrice_Member:'0.00',
      SnacksPrice_NonMember:'0.00',
      Earlydrop_Time:"08:00",
      Latepickup_Time:"18:00",
      Earlydrop_MemberFee:'0.00',
      Earlydrop_NonMemberFee:'0.00',
      Latepickup_MemberFee:'0.00',
      Latepickup_NonMemberFee:'0.00',
      IsMultiSports: false,
      IsPromotionPushFlag: false,
      IsrestrictedSquadSize: false,
      MemberAllowmentText: '',
      LunchText:"",
      Moderator: '',
      ParentClubKey: '',
      PerDayAmountForMember: '0.00',
      PerDayAmountForNonMember: '0.00',
      SquadSize: 30,
      StartDate: "",
      UpdatedDate: new Date().getTime(),
      Activity: {},
      IsAllowCashPayment: false,
      Coach: {},
      VenueAddress: "",
      VenuePostCode: "",
      MinSessionBooking: 1,
      AllowChildCare: true
    }
  //{ Key: 500, Value: "Half Day" },
  campList = [{ Key: 501, Value: "Single Day" }, { Key: 502, Value: "Multi Day" }];
  campType = 502;

  // venues = [];
  // selectedVenue: string = "";

  clubs = [];
  // selectedClub: string = "";
  // types = [];
  allActivities = [];
  allClubCoachAccordingToActivity = [];
  // coachs = [];
  // selectedCoach: any;

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

  minuteValues = "00";
  Currency: any;
  loggedin_user: string;
  constructor(public events: Events, private selector: WheelSelector,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private navCtrl: NavController, public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,

  ) {
    for (let i = 1; i < 60; i++) {
      if (i % 5 == 0) {
        this.minuteValues += "," + i;
      }
    }
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();
    this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
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

    let month = "";
    let date = "";
    let year = "";
    year = (new Date().getFullYear()).toString();
    month = ((new Date().getMonth()) + 2) > 9 ? ((new Date().getMonth()) + 2).toString() : "0" + ((new Date().getMonth()) + 2).toString();
    // month = (parseInt(month) -1).toString();;
    year = parseInt(month) > 12 ? (parseInt(year) + 1).toString() : year;
    month = parseInt(month) > 12 ? "0" + (parseInt(month) - 12) : month;
    date = new Date().getDate() > 9 ? (new Date().getDate()).toString() : "0" + (new Date().getDate());
    this.holidayCamp.StartDate = year + "-" + month + "-" + date;
    this.holidayCamp.EndDate = year + "-" + month + "-" + date;
    this.holidayCamp.PayByDate = year + "-" + month + "-" + date;

    this.multidayHolidayCampSessionList.push(this.multiDaySession);
    this.holidayCamp.MemberAllowmentText = "Enrol";
    //this.selectANumber();
  }


  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });


    this.commonService.screening("Type2CreateHolidayCamp");
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

  //checking some part of the form is filled,if filled showing confirmation prompt to go back or not
  checkIsFormFilled() {
    if (this.holidayCamp.CampName.trim() != "" && this.holidayCamp.CampName != undefined) {
      this.promptAlert();
    }
    else if (this.selectedSchoolVenue.trim() != "" && this.selectedSchoolVenue != undefined) {
      this.promptAlert();
    }
    else if (this.selectedClub.trim() != "" && this.selectedClub != undefined) {
      this.promptAlert();
    }
    else if (Array.isArray(this.selectedActivity)) {
      if (this.selectedActivity.length > 0) {
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
        session.Duration = hh[0] + ":" + mm[0];
      },
      err => console.log('Error: ', err)
    );
  }

  convertToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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
    this.commonService.toastMessage(message, 3000,ToastMessageType.Info);
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

  //get club details
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
        this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0).subscribe((res: any) => {
        this.clubVenues = res.data.getVenuesByParentClub;
        console.log("clubs lists:", JSON.stringify(this.clubVenues));
        if (this.clubVenues.length > 0) {
          this.clubVenues = this.clubVenues.map((club_venue) => {
            return {
              VenueType: "Club",
              ...club_venue
            }
          })
          this.selectedClub = this.clubVenues[0].Id;
          this.club_activity_input.VenueKey = this.clubVenues[0].FirebaseId;
          // this.club_activity_input.VenueKey = '-KuFU3C068bQzKW_9WO2';
          this.club_coaches_input.firebase_fields.club_id = this.clubVenues[0].FirebaseId;
          this.getAllActivity();
          this.getSchools();
        } else {
          this.commonService.toastMessage("clubs not found", 2500, ToastMessageType.Error)
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
              id: club_venue.Id,
              school_name: club_venue.ClubName,
              firebasekey: club_venue.FirebaseId,
              postcode: '',
              firstline_address: '',
              secondline_address: ''
            })
          })
        }
        console.table(this.schoolVenues);
        console.table(this.clubVenues);
        if (this.schoolVenues.length != 0) {

          this.selectedSchoolVenue = this.schoolVenues[0].id;
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
      }
      `;
    this.graphqlService.query(clubs_activity_query, { input_obj: this.club_activity_input }, 0)
      .subscribe(async (res: any) => {
        if (res.data.getAllActivityByVenue.length > 0) {
          this.activities = res.data.getAllActivityByVenue;
          //console.log("clubs lists:", JSON.stringify(this.clubs));
          this.selectedActivity = this.activities[0].ActivityKey;
          this.club_coaches_input.firebase_fields.activity_id = this.selectedActivity;
          this.coaches = await this.getCoachList();
        } else {
          this.commonService.toastMessage("no activities found", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
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

  onChangeCoach() {
    this.coaches.forEach(element => {
      if (element.CoachId == this.selectedCoach) {
        this.selectedCoachName = element.FirstName + " " + element.LastName;
      }
    });
  }


  async onChangeActivity() {

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
      this.selectedCoach = this.coaches[0].CoachId;
    }
    console.log('coachesssss' + tempCoaches);
  }



  onChangeOfClub() {
    this.selectedActivity = "";
    this.activities = [];
    this.coaches = [];
    this.selectedCoach = "";
    //this.club_coaches_input.firebase_fields.club_id = this.selectedClub;
    this.club_coaches_input.firebase_fields.club_id = this.clubVenues.find(club => club.Id == this.selectedClub).FirebaseId;
    //this.club_coaches_input.postgre_fields.club_id = this.selectedClub;
    this.club_activity_input.VenueKey = this.club_coaches_input.firebase_fields.club_id
    this.getAllActivity();
  }

  onChangeOfSchoolVenue() {
    const school = this.schoolVenues.find(school => school.id === this.selectedSchoolVenue)
    if (school.VenueType == "School") {
      this.holidayCamp.VenueType = "School";

    } else {
      this.holidayCamp.VenueType = "Club";
    }
    this.holidayCamp.VenueKey = school.id;
    this.holidayCamp.VenueName = school.school_name;
    this.holidayCamp.VenuePostCode = school.postcode;
    this.holidayCamp.VenueAddress = school.firstline_address + " " + school.secondline_address;
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

  removemultidayHolidayCampSessionList(index) {
    this.multidayHolidayCampSessionList.splice(index, 1);
    this.commonService.toastMessage("Session removed successfully", 3000,ToastMessageType.Success);
  }
  addMultiDayHolidayCampSession() {
    this.multiDaySession = {
      CreationDate: new Date().getTime(),
      UpdatedDate: new Date().getTime(),
      SessionName: 'Session-' + (this.multidayHolidayCampSessionList.length + 1),
      // Duration: this.convertToMinutes("01:00"),
      Duration: "01:00",
      EndTime: '',
      StartTime: '',
      AmountForMember: '0.00',
      AmountForNonMember: '0.00',
      IsActive: true,
      Day: "",
      SessionDate: "",
      SessionId: `${new Date().getTime()}${this.multidayHolidayCampSessionList.length + 1}`
    };
    // this.singleHolidayCampSessionList.forEach(element => {
    //   this.singleDaySession.Duration = this.holidayCamp.TotalDuration - element.Duration;
    // });

    this.multidayHolidayCampSessionList.push(this.multiDaySession);
    console.log(this.multidayHolidayCampSessionList);
  }


  validateMultiDaySession(): boolean {
    if (this.holidayCamp.CampName.trim() == "" || this.holidayCamp.CampName == undefined) {
      let msg = "Enter camp name";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if (this.selectedSchoolVenue.trim() == "" || this.selectedSchoolVenue == undefined) {
      let msg = "Choose a venue";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    if (this.selectedClub.trim() == "" || this.selectedClub == undefined) {
      let msg = "Choose hosted by";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    if (Array.isArray(this.selectedActivity)) {
      if (this.selectedActivity.length == 0) {
        let msg = "Choose an activity";
        this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
    }
    if (!Array.isArray(this.selectedActivity)) {
      if (this.selectedActivity == undefined || this.selectedActivity.length == 0) {
        let msg = "Choose an activity";
        this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
    }
    else if (this.selectedCoach == undefined || this.selectedCoach.length == 0 || this.coaches.length === 0) {
      let msg = "Choose primary moderator";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if(this.campType == 502 && moment(this.holidayCamp.EndDate,"YYYY-MM-DD").isBefore(moment(this.holidayCamp.StartDate,"YYYY-MM-DD"))){
      const msg = "End date should be bigger than start date";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    // else if (this.holidayCamp.AgeGroup == undefined || this.holidayCamp.AgeGroup.trim() == "") {
    //   let msg = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    //   this.showToast(msg, 3000);
    //   return false;
    // }
    else if (this.campType == 502 && this.days.length == 0) {
      let msg = "Please select day";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    return true;
  }
  //keeping days in holiday camp
  selectedDayDetails(day) {

    if (this.holidayCamp.Days == "") {
      this.holidayCamp.Days += day;
    }
    else {
      this.holidayCamp.Days += "," + day;
    }
  }

  //saving holidaycamp in postgre
  async saveCampInPostgre() {
    try{
      this.commonService.showLoader("Please wait");
      const holiday_camp = new CreateHolidayCampDTO(this.holidayCamp, this.multidayHolidayCampSessionList);
      if (this.holidayCamp.VenueType == 'School') {
        //holiday_camp.holidaycamp_details.camp_postgre_fields.venue_id = this.schoolVenues.find(school => school.firebasekey == this.selectedSchoolVenue).id;
        holiday_camp.holidaycamp_details.camp_firebase_fields.venue_id = this.schoolVenues.find(school => school.id == this.selectedSchoolVenue).firebasekey;
      } else {
        //holiday_camp.holidaycamp_details.camp_postgre_fields.venue_id = this.clubVenues.find(club => club.FirebaseId == this.selectedClub).Id;
        holiday_camp.holidaycamp_details.camp_firebase_fields.venue_id = this.clubVenues.find(club => club.Id == this.selectedSchoolVenue).FirebaseId;
      }
      holiday_camp.holidaycamp_details.camp_firebase_fields.club_id = this.clubVenues.find(club => club.Id == this.selectedClub).FirebaseId;
      holiday_camp.holidaycamp_details.squad_size = Number(holiday_camp.holidaycamp_details.squad_size);
      holiday_camp.holidaycamp_details.minumum_session_booking = Number(holiday_camp.holidaycamp_details.minumum_session_booking);
      holiday_camp.holidaycamp_details.updated_by = this.loggedin_user;
      holiday_camp.holidaycamp_details.camp_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
      holiday_camp.holidaycamp_details.camp_postgre_fields.club_id = this.selectedClub;
      //holiday_camp.holidaycamp_details.camp_firebase_fields.club_id = this.selectedClub;
      holiday_camp.holidaycamp_details.camp_firebase_fields.parentclub_id = this.parentClubKey;
      holiday_camp.holidaycamp_details.camp_postgre_fields.coach_ids = await this.getCoachIdsByFirebaseKeys(this.selectedCoach);
      var activities = [];
      if (!Array.isArray(this.selectedActivity)) {
        activities = Object.keys(this.selectedActivity)
      } else {
        for (var activity of this.selectedActivity) {
          activities.push(activity);
        }
      }
      holiday_camp.holidaycamp_details.camp_postgre_fields.activity_ids = await this.getActivityIdsByFirebaseKeys(activities);
      //holiday_camp.holidaycamp_details.camp_postgre_fields.club_id = this.clubVenues.find(club => club.FirebaseId == this.selectedClub).Id;
      holiday_camp.holidaycamp_details.camp_firebase_fields.camp_id = '';
      //const school = this.schoolVenues.find(schoolvenue => schoolvenue.firebasekey == this.selectedSchoolVenue);
      if(holiday_camp.holidaycamp_details.camp_postgre_fields.activity_ids.length == 0){
        this.commonService.hideLoader();
        this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
        return false;
      }
      if(holiday_camp.holidaycamp_details.camp_postgre_fields.coach_ids.length == 0){
        this.commonService.hideLoader();
        this.commonService.toastMessage("Coaches fetch failed",2500,ToastMessageType.Error);
        return false;
      }

      console.table(holiday_camp)

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
          // Handle the result
          // this.holidayCampResponse = result.data.createHolidayCamp;
          this.commonService.hideLoader();
          this.commonService.toastMessage("Successfully created camp", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.commonService.updateCategory('update_camps_list') ;
          console.log(`camp_created_res:${result}`);
          // console.log("CREATE CAMP RESPONSE Data:", JSON.stringify(this.holidayCampResponse));
          this.navCtrl.pop();
        },
        error => {
          // Handle errors
          this.commonService.hideLoader();
          console.error(error);
          this.commonService.toastMessage("Failed to create camp", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
  
    }catch(ex){
      this.commonService.hideLoader();
      console.log(`camp_creation_failed:${ex}`);
      this.commonService.toastMessage("Failed to create camp", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
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
    // console.log(this.holidayCamp.IsMultiSports);
    if (this.activities.length > 0) {
      //this.activities = this.allactivity[0];
      if (this.activities.length != 0) {
        this.selectedActivity = this.activities[0].ActivityKey;
        this.onChangeActivity();
      }
    }
  }


  CheckIsAllowEarlyDropOff() {
    setTimeout(() => {
      if (!this.holidayCamp.IsAllowEarlyDrop) {
        this.holidayCamp.Earlydrop_Time = '08:00'
        this.holidayCamp.Earlydrop_MemberFee = '0.00'
        this.holidayCamp.Earlydrop_NonMemberFee = '0.00'
      }
    }, 200);
  }

  CheckIsAllowLatePickup() {
   setTimeout(() => {
      if(!this.holidayCamp.IsAllowLatePickUp) {
        this.holidayCamp.Latepickup_Time = '18:00'
        this.holidayCamp.Latepickup_MemberFee = '0.00'
        this.holidayCamp.Latepickup_NonMemberFee = '0.00'
      }
    }, 200);
  }

  checkLunchAllowed(){
    setTimeout(() => {
      if(!this.holidayCamp.IsAllowLunch) {
        this.holidayCamp.LunchText = ''
        this.holidayCamp.LunchPrice_Member = '0.00'
        this.holidayCamp.LunchPrice_NonMember = '0.00'
      }
    }, 200);
  }

  checkSnacksAllowed(){
    setTimeout(() => {
      if(!this.holidayCamp.IsAllowLunch) {
        this.holidayCamp.Latepickup_MemberFee = '0.00'
        this.holidayCamp.Latepickup_NonMemberFee = '0.00'
      }
    }, 200);
  }

  changeCampType() {
    this.holidayCamp.EndDate = this.holidayCamp.StartDate;
    this.holidayCamp.PayByDate = this.holidayCamp.PayByDate;
    this.holidayCamp.Days = "";
  }
  cancel() {
    this.navCtrl.pop();
  }



  onChangeOfSessionMemberAmount() {
    this.holidayCamp.PerDayAmountForMember = "0.00";
    for (let i = 0; i < this.multidayHolidayCampSessionList.length; i++) {
      let calculateAmount = parseFloat(this.multidayHolidayCampSessionList[i].AmountForMember) + parseFloat(this.holidayCamp.PerDayAmountForMember);
      if (!isNaN(calculateAmount)) {
        this.holidayCamp.PerDayAmountForMember = calculateAmount.toFixed(2);
      }
    }
  }
  onChangeOfSessionNonMemberAmount() {
    this.holidayCamp.PerDayAmountForNonMember = "0.00";
    for (let i = 0; i < this.multidayHolidayCampSessionList.length; i++) {
      let calculateAmount = parseFloat(this.multidayHolidayCampSessionList[i].AmountForNonMember) + parseFloat(this.holidayCamp.PerDayAmountForNonMember);
      if (!isNaN(calculateAmount)) {
        this.holidayCamp.PerDayAmountForNonMember = calculateAmount.toFixed(2);
      }
    }

  }
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

      //initialize selected venue to holiday camp object

      // for (let i = 0; i < this.venues.length; i++) {
      //   if (this.selectedVenue == this.venues[i].$key) {
      //     this.holidayCamp.VenueName = this.venues[i].VenueName;
      //     this.holidayCamp.VenueKey = this.venues[i].$key;
      //     this.holidayCamp.VenueType = this.venues[i].VenueType;
      //     this.holidayCamp.VenueAddress = this.venues[i].FirstLineAddress;
      //     this.holidayCamp.VenuePostCode = this.venues[i].PostCode;
      //     break;
      //   }
      // }




      // //keeping activitys in array format
      // if (!Array.isArray(this.selectedActivityType)) {
      //   let str = this.selectedActivityType;
      //   this.selectedActivityType = [];
      //   this.selectedActivityType.push(str);
      // }

      // // keeping activity in holiday camp object in object format
      // this.holidayCamp.Activity = {};
      // for (let i = 0; i < this.selectedActivityType.length; i++) {
      //   for (let j = 0; j < this.types.length; j++) {
      //     if (this.types[j].Key == this.selectedActivityType[i]) {
      //       this.holidayCamp.Activity[this.types[j].Key] = {};
      //       this.holidayCamp.Activity[this.types[j].Key]["ActivityCode"] = this.types[j].ActivityCode;
      //       this.holidayCamp.Activity[this.types[j].Key]["ActivityName"] = this.types[j].ActivityName;
      //       this.holidayCamp.Activity[this.types[j].Key]["ActivityKey"] = this.types[j].Key;
      //       this.holidayCamp.Activity[this.types[j].Key]["ActivityCategoryKey"] = "";
      //       this.holidayCamp.Activity[this.types[j].Key]["ActivitySubCategoryKey"] = "";
      //       break;
      //     }
      //   }
      // }

      // //keeping Coach in array format
      // if (!Array.isArray(this.selectedCoach)) {
      //   let str = this.selectedCoach;
      //   this.selectedCoach = [];
      //   this.selectedCoach.push(str);
      // }

      // // keeping coach in holiday camp object in object format
      // this.holidayCamp.Coach = {};
      // for (let i = 0; i < this.selectedCoach.length; i++) {
      //   for (let j = 0; j < this.coachs.length; j++) {
      //     if (this.coachs[j].CoachKey == this.selectedCoach[i]) {
      //       this.holidayCamp.Coach[this.coachs[j].CoachKey] = {};
      //       this.holidayCamp.Coach[this.coachs[j].CoachKey]["CoachKey"] = this.coachs[j].CoachKey;
      //       this.holidayCamp.Coach[this.coachs[j].CoachKey]["CoachName"] = this.coachs[j].FirstName + " " + this.coachs[j].LastName;
      //       break;
      //     }
      //   }
      // }

      //##### For creation of multiday camp 
      //##### multiday camp type code is 502 

      if (this.holidayCamp.CampType == 502) {
        this.holidayCamp.Days = "";
        this.days.sort();
        for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

          switch (this.days[daysIndex]) {
            case 0:
              this.selectedDayDetails("Sun");
              break;
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

          }
        }

        // let daysArray = this.holidayCamp.Days.split(",");
        let daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        // let startDate = new Date(this.holidayCamp.StartDate);
        // let endDate = new Date(this.holidayCamp.EndDate);
        let startDate = moment(new Date(this.holidayCamp.StartDate));
        let endDate = moment(new Date(this.holidayCamp.EndDate));
        let currentDate: any = startDate;
        let selectedDatesInSeconds = [];
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
        this.multidayHolidayCampSessionList.forEach(element => {
          if (element.SessionName == undefined || element.SessionName.trim() == "") {
            this.commonService.toastMessage("Enter session name", 3000,ToastMessageType.Error);
            isExecute = false;

          } else if (isNaN(parseFloat(element.AmountForMember))) {
            this.commonService.toastMessage("Enter amount for member", 3000,ToastMessageType.Error);
            isExecute = false;

          } else if (isNaN(parseFloat(element.AmountForNonMember))) {
            this.commonService.toastMessage("Enter amount for non member", 3000,ToastMessageType.Error);
            isExecute = false;
          }
          else if (element.StartTime == undefined || element.StartTime.trim() == "") {
            this.commonService.toastMessage("Choose start time", 3000,ToastMessageType.Error);
            isExecute = false;
          }

          let duration = element.Duration.split(":");
          let hh = duration[0];
          let mm = duration[1];


          let campDuraiton = this.holidayCamp.DurationPerDay.split(":");
          console.log(this.holidayCamp.DurationPerDay)
          let hhOfCamp: any = campDuraiton[0];
          let mmOfCamp: any = campDuraiton[1];
          if (+hhOfCamp == 0 && +mmOfCamp == 0) {
            this.commonService.toastMessage("Choose duration", 3000,ToastMessageType.Error);
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


          this.holidayCamp.DurationPerDay = hour + ":" + minute;

        });

        //Ends here
        //

        if (isExecute) {
          for (let k = 0; k < sessionArr.length; k++) {
            for (let j = 0; j < this.multidayHolidayCampSessionList.length; j++) {

              //calculate endtime 
              let duration = this.multidayHolidayCampSessionList[j].Duration.split(":");
              let hh = duration[0];
              let mm = duration[1];
              let hour = "";
              let minute = "";
              let time = this.multidayHolidayCampSessionList[j].StartTime.split(":");


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
                AmountForMember: parseFloat(this.multidayHolidayCampSessionList[j].AmountForMember).toFixed(2),
                AmountForNonMember: parseFloat(this.multidayHolidayCampSessionList[j].AmountForNonMember).toFixed(2),
                CreationDate: new Date().getTime(),
                Duration: this.convertToMinutes(this.multidayHolidayCampSessionList[j].Duration),
                EndTime: hour + ":" + minute,
                IsActive: this.multidayHolidayCampSessionList[j].IsActive,
                SessionName: this.multidayHolidayCampSessionList[j].SessionName,
                StartTime: this.multidayHolidayCampSessionList[j].StartTime,
                UpdatedDate: new Date().getTime(),
                Day: daysArray[new Date(sessionArr[k].SessionDate).getDay()],
                SessionDate: sessionArr[k].SessionDate,
                SessionId: this.multidayHolidayCampSessionList[j].SessionId,
              });

              totoalAmountForMember = totoalAmountForMember + parseFloat(multidaySessions[j].AmountForMember);
              totalAmountForNonMember = totalAmountForNonMember + parseFloat(multidaySessions[j].AmountForNonMember);
            }
          }
          //
          // camp validation
          //

          if (this.holidayCamp.StartDate == this.holidayCamp.EndDate) {
            this.commonService.toastMessage("For multiday camp start date should be different to the end date", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return;
          }

          else if (multidaySessions.length == 0) {
            this.commonService.toastMessage(`Selected day does not lie in between ${this.holidayCamp.StartDate} - ${this.holidayCamp.EndDate}`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return;
          }
          //
          //ends here
          //
          this.holidayCamp.FullAmountForMember = totoalAmountForMember.toFixed(2);
          this.holidayCamp.FullAmountForNonMember = totalAmountForNonMember.toFixed(2);

          let prompt = this.alertCtrl.create({
            title: 'Full Price for the Camp',//Full Camp Amount
            //message: "For member = £" + this.holidayCamp.FullAmountForMember + " , For non-member= £" + this.holidayCamp.FullAmountForNonMember,
            message: `<div><p class="p1">Member: ${this.Currency}${this.holidayCamp.FullAmountForMember} </p><p class="p1">Non-member: ${this.Currency}${this.holidayCamp.FullAmountForNonMember}</p>
            <p class="p2">Enter the revised amount in case there is a discount if someone is booking all the sessions</p>
            <span class="span1">Member(${this.Currency})</span>
            <span class="span2">Non-member(${this.Currency})</span>
            </div>`,
            cssClass: 'camp_confirm_alert',
            inputs: [
              {
                name: 'FullAmountForMember',
                placeholder: 'For Non-member',
                value: this.holidayCamp.FullAmountForMember,
                type: "number"
              },
              {
                label: `Non-member(${this.Currency})`,
                name: 'FullAmountForNonMember',
                placeholder: 'Full amount for non-member',
                value: this.holidayCamp.FullAmountForNonMember,
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
                  
                  this.holidayCamp.FullAmountForMember = data.FullAmountForMember;
                  this.holidayCamp.FullAmountForNonMember = data.FullAmountForNonMember;

                  // this.multidayHolidayCampSessionList = this.commonService.sortingObjects(this.multidayHolidayCampSessionList, "CreationDate");
                  // let returnedKey = this.fb.saveReturningKey("HolidayCamp/" + this.parentClubKey + "/", this.holidayCamp);
                  // for (let sessionIndex = 0; sessionIndex < this.multidayHolidayCampSessionList.length; sessionIndex++) {
                  //   this.fb.saveReturningKey("HolidayCamp/" + this.parentClubKey + "/" + returnedKey + "/SessionConfig/", this.multidayHolidayCampSessionList[sessionIndex]);
                  // }
                  // for (let sessionIndex = 0; sessionIndex < multidaySessions.length; sessionIndex++) {
                  //   this.fb.saveReturningKey("HolidayCamp/" + this.parentClubKey + "/" + returnedKey + "/Session/", multidaySessions[sessionIndex]);
                  // }
                  
                  this.saveCampInPostgre();
                  // this.commonService.toastMessage("Successfully created multi day camp", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                  // this.commonService.updateCategory("holidaycamp");
                  // this.navCtrl.pop();
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

      else if (this.holidayCamp.CampType == 501) {
        let day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        this.holidayCamp.Days = day[new Date(this.holidayCamp.StartDate).getDay()];
        this.holidayCamp.EndDate = this.holidayCamp.StartDate;
        // this.holidayCamp.PayByDate = this.holidayCamp.PayByDate;

        let totoalAmountForMember = 0.00;
        let totalAmountForNonMember = 0.00;


        let isExecute = true;
        //Added on 14 june by abinash
        // holiday camp total duration calculation
        //
        this.holidayCamp.DurationPerDay = "00 hours:00 minutes";
        let j = 0;
        this.multidayHolidayCampSessionList.forEach(element => {
          if (element.SessionName == undefined || element.SessionName.trim() == "") {
            this.commonService.toastMessage("Enter session name", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            //return false;
            isExecute = false;
          }
          else if (element.StartTime == undefined || element.StartTime.trim() == "") {
            this.commonService.toastMessage("Choose start time", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            isExecute = false;
          }

          else if (isNaN(parseFloat(element.AmountForMember))) {
            this.commonService.toastMessage("Enter amount for member", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            //return false;
            isExecute = false;
          }

          else if (isNaN(parseFloat(element.AmountForNonMember))) {
            this.commonService.toastMessage("Enter amount for non member", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            //return false;
            isExecute = false;
          }


          let duration = element.Duration.split(":");
          let hh = duration[0];
          let mm = duration[1];


          let campDuraiton = this.holidayCamp.DurationPerDay.split(":");
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


          this.holidayCamp.DurationPerDay = hour + ":" + minute;

          //For time being patch done


          hour = "";
          minute = "";
          let time = this.multidayHolidayCampSessionList[j].StartTime.split(":");
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
            AmountForMember: parseFloat(this.multidayHolidayCampSessionList[j].AmountForMember).toFixed(2),
            AmountForNonMember: parseFloat(this.multidayHolidayCampSessionList[j].AmountForNonMember).toFixed(2),
            CreationDate: new Date().getTime(),
            Duration: this.multidayHolidayCampSessionList[j].Duration,
            EndTime: hour + ":" + minute,
            IsActive: this.multidayHolidayCampSessionList[j].IsActive,
            SessionName: this.multidayHolidayCampSessionList[j].SessionName,
            StartTime: this.multidayHolidayCampSessionList[j].StartTime,
            UpdatedDate: new Date().getTime(),
            Day: this.holidayCamp.Days,
            SessionDate: this.holidayCamp.StartDate,
            SessionId: this.multidayHolidayCampSessionList[j].SessionId
          });

          totoalAmountForMember = totoalAmountForMember + parseFloat(multidaySessions[j].AmountForMember);
          totalAmountForNonMember = totalAmountForNonMember + parseFloat(multidaySessions[j].AmountForNonMember);



          j++;

        });


        //Ends here
        //








        // for (let j = 0; j < this.multidayHolidayCampSessionList.length; j++) {

        //   //calculate endtime 

        //   let hour = "";
        //   let minute = "";
        //   let time = this.multidayHolidayCampSessionList[j].StartTime.split(":");

        //   let calculatedHour = (parseInt(time[0]) + parseInt(this.multidayHolidayCampSessionList[j].Duration));

        //   if (calculatedHour < 10) {
        //     hour += "0" + calculatedHour.toString();
        //     minute = (parseInt(time[1]) + (parseInt(time[1]) * 60)).toString();
        //   } else if (calculatedHour < 24) {
        //     hour += calculatedHour.toString();
        //     minute = (parseInt(time[1]) + (parseInt(time[1]) * 60)).toString();
        //   }
        //   else {
        //     calculatedHour = calculatedHour - 24;
        //     if (calculatedHour < 10) {
        //       hour += "0" + calculatedHour.toString();
        //       minute = (parseInt(time[1]) + (parseInt(time[1]) * 60)).toString();
        //     } else if (calculatedHour < 24) {
        //       hour += calculatedHour.toString();
        //       minute = (parseInt(time[1]) + (parseInt(time[1]) * 60)).toString();
        //     }
        //   }



        //   // ends here

        //   multidaySessions.push({
        //     AmountForMember: this.multidayHolidayCampSessionList[j].AmountForMember,
        //     AmountForNonMember: this.multidayHolidayCampSessionList[j].AmountForNonMember,
        //     CreationDate: new Date().getTime(),
        //     Duration: this.multidayHolidayCampSessionList[j].Duration,
        //     EndTime: hour + ":" + minute,
        //     IsActive: this.multidayHolidayCampSessionList[j].IsActive,
        //     SessionName: this.multidayHolidayCampSessionList[j].SessionName,
        //     StartTime: this.multidayHolidayCampSessionList[j].StartTime,
        //     UpdatedDate: new Date().getTime(),
        //     Day: this.holidayCamp.Days,
        //     SessionDate: this.holidayCamp.StartDate
        //   });

        //   totoalAmountForMember = totoalAmountForMember + parseFloat(multidaySessions[j].AmountForMember);
        //   totalAmountForNonMember = totalAmountForNonMember + parseFloat(multidaySessions[j].AmountForNonMember);
        // }

        // perday amount and full day amount is same for single day camp
        // As single day camp held for only a day so fulday and singledayamount should be same

        this.holidayCamp.PerDayAmountForMember = totoalAmountForMember.toFixed(2);
        this.holidayCamp.PerDayAmountForNonMember = totalAmountForNonMember.toFixed(2);
        this.holidayCamp.FullAmountForMember = totoalAmountForMember.toFixed(2);
        this.holidayCamp.FullAmountForNonMember = totalAmountForNonMember.toFixed(2);
        if (isExecute) {
          let prompt = this.alertCtrl.create({
            title: 'Full Camp Amount',
            message: "For member = £" + this.holidayCamp.FullAmountForMember + " , For non-member= £" + this.holidayCamp.FullAmountForNonMember,
            inputs: [
              {
                name: 'FullAmountForMember',
                placeholder: 'For Non-member',
                value: this.holidayCamp.FullAmountForMember
              },
              {
                name: 'FullAmountForNonMember',
                placeholder: 'Full amount for non-member',
                value: this.holidayCamp.FullAmountForNonMember
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
                  //
                  

                  this.holidayCamp.FullAmountForMember = data.FullAmountForMember;
                  this.holidayCamp.FullAmountForNonMember = data.FullAmountForNonMember;

                  // console.log(this.holidayCamp);
                  // console.log(multidaySessions);

                  // this.multidayHolidayCampSessionList = this.commonService.sortingObjects(this.multidayHolidayCampSessionList, "CreationDate");
                  // let returnedKey = this.fb.saveReturningKey("HolidayCamp/" + this.parentClubKey + "/", this.holidayCamp);
                  // for (let sessionIndex = 0; sessionIndex < this.multidayHolidayCampSessionList.length; sessionIndex++) {
                  //   this.fb.saveReturningKey("HolidayCamp/" + this.parentClubKey + "/" + returnedKey + "/SessionConfig/", this.multidayHolidayCampSessionList[sessionIndex]);
                  // }
                  // for (let sessionIndex = 0; sessionIndex < multidaySessions.length; sessionIndex++) {
                  //   this.fb.saveReturningKey("HolidayCamp/" + this.parentClubKey + "/" + returnedKey + "/Session/", multidaySessions[sessionIndex]);
                  // }
                  this.saveCampInPostgre();
                  // this.commonService.hideLoader();
                  // this.commonService.toastMessage("Successfully created single day camp", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                  // this.navCtrl.pop();

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


  showToast(message) {
    this.commonService.toastMessage(message, 2500, ToastMessageType.Info, ToastPlacement.Bottom)
  }


}
