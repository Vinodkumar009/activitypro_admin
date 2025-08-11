//Author: Abinash Pradhan
//Date:- 06/10/2017
//Creation of holiday camp


import { NavController, LoadingController, PopoverController, ToastController, AlertController } from "ionic-angular";
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { IonicPage, NavParams, Events } from 'ionic-angular';
import { WheelSelector } from '@ionic-native/wheel-selector';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
import gql from "graphql-tag";
import { GraphqlService } from "../../../services/graphql.service";
import { Activity, ActivityCoach, ActivityInfoInput, ClubActivityInput, IClubDetails, SchoolDto } from "../../../shared/model/club.model";
import { EditHolidayCampDetails, UpadteHolidayCampDTO, UpdateHolidayCampDTO } from "./models/update_camp_dto";
import moment from "moment";
import { HolidayCamp } from "./models/holiday_camp.model";


@IonicPage()
@Component({
  selector: 'editholidaycamp-page',
  templateUrl: 'editholidaycamp.html'
})

export class Type2EditHolidayCamp {

  schoolVenues: SchoolDto[] = [];
  selectedSchoolVenue: string = "";
  clubVenues: IClubDetails[] = [];
  selectedClub = "";
  activities: Activity[] = [];
  selectedActivity: string | string[];
  selectedCampDetails: HolidayCamp;
  coaches: ActivityCoach[] = [];
  loggedin_user: string;


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

  LangObj: any = {};//by vinod
  allactivity = [];

  //Varriables
  themeType: any;
  parentClubKey: string = "";

  Currency: any;//added by vinod
  holidayCampDetails = {};

  updateHolidayCampDTO: UpdateHolidayCampDTO = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    holidaycamp_details: new EditHolidayCampDetails,
    session_config_details: []
  }
  holidayCamp: any =
    {
      $key: "",
      PayByDate: '',
      AgeGroup: '',
      CampName: '',
      CampType: 502, //Single day || Half day || multiple day codes
      ClubKey: '',
      ClubName: '',
      VenueKey: "",
      VenueName: "",
      VenueType: "",
      CreationDate: new Date().getTime(),
      Description: '',
      Days: "",
      DurationPerDay: 8,
      EarlyDropFees: '6.00',
      EndDate: "",
      FullAmountForMember: '0.00',
      FullAmountForNonMember: '0.00',
      ImageUrl: '',
      Instruction: "",
      IsActive: true,
      IsAllowMemberEnrollment: false,
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
      SquadSize: 6,
      StartDate: "",
      UpdatedDate: new Date().getTime(),
      Activity: {},
      IsAllowCashPayment: false,
      Coach: {},
      VenueAddress: "",
      VenuePostCode: "",
      Session: {},
      Member: {},
      AllowChildCare: true
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
  campList = [{ Key: 500, Value: "Half Day" }, { Key: 501, Value: "Single Day" }, { Key: 502, Value: "Multi Day" }];
  campType = 502;
  sessionList = [];
  perDaySessionList = [];
  memberArr = [];
  userData: any;
  SessionConfig = [];
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
    SessionId: ''
  }
  venues = [];
  selectedVenue: string = "";
  clubs = [];
  // selectedClub: string = "";
  selectedActivityType: any;
  allActivities = [];
  allClubCoachAccordingToActivity = [];
  coachs = [];
  selectedCoach: any;
  types = [];
  constructor(public graphqlService: GraphqlService, private navParams: NavParams, private selector: WheelSelector, public events: Events, public comonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private toastCtrl: ToastController, public navCtrl: NavController, private storage: Storage, public fb: FirebaseService, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();
    this.selectedCampDetails = navParams.get('holidayCampDetails');
    this.selectedCampDetails.start_date = moment(this.selectedCampDetails.start_date, 'DD-MMM-YYYY').format('YYYY-MM-DD');
    this.selectedCampDetails.end_date = moment(this.selectedCampDetails.end_date, 'DD-MMM-YYYY').format('YYYY-MM-DD');
    this.selectedCampDetails.pay_by_date = moment(this.selectedCampDetails.pay_by_date, 'YYYY-MM-DD').format('YYYY-MM-DD');
    console.log('SELECTED CAMPDetails data  ' + JSON.stringify(this.selectedCampDetails));

    this.campType = this.holidayCamp.CampType;
    this.holidayCamp.AllowChildCare = this.holidayCamp.AllowChildCare != undefined ? this.holidayCamp.AllowChildCare : true;
    this.holidayCamp.IsAllowCashPayment = this.holidayCamp.IsAllowCashPayment != undefined ? this.holidayCamp.IsAllowCashPayment : false;
  
    storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      //console.log(currencydets);
      this.Currency = currencydets.CurrencySymbol;
    });

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
  }

  ionViewDidLoad() {
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

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  // //get club details
  // getClubList() {
  //   const clubs$Obs = this.fb.getAllWithQuery("/Club/Type2/" + this.holidayCamp.ParentClubKey, { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
  //     clubs$Obs.unsubscribe();
  //     this.clubs = data;
  //     if (this.clubs.length != 0) {
  //       this.selectedClub = this.clubs[0].$key;
  //     }
  //   });
  //   this.getSchools();
  // }

  

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
        this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
          .subscribe((res: any) => {
        this.clubVenues = res.data.getVenuesByParentClub;
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
          this.getAllActivity();
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
        //console.table(this.schoolVenues);
        //console.table(this.clubVenues);
        if (this.schoolVenues.length != 0) {

          // this.selectedSchoolVenue = this.schoolVenues[0].firebasekey;
          this.selectedSchoolVenue = this.selectedCampDetails.venuekey
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
      .subscribe((res: any) => {
        if (res.data.getAllActivityByVenue.length > 0) {
          this.activities = res.data.getAllActivityByVenue;
          console.log("getAllActivityByVenue DATA:", JSON.stringify(this.activities));
          // this.selectedActivity = this.activities[0].ActivityKey;
          // this.selectedActivity = this.selectedCampDetails.Activity.FirebaseActivityKey;
          //this.club_coaches_input.firebase_fields.activity_id = this.selectedCampDetails.Activity[0].FirebaseActivityKey;
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

  async onChangeActivity() {
    let temp_coaches = [];
    if (!Array.isArray(this.selectedActivity)) {
      let str = this.selectedActivity;
      //this.selectedActivity = [];
      temp_coaches.push(str);
    }else{
      temp_coaches = this.selectedActivity;
    }
    const coach_promise = []
    for (var activity in temp_coaches) {
      this.club_coaches_input.firebase_fields.activity_id = temp_coaches[activity];
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
      this.selectedCoach = this.selectedCampDetails.Coach[0].coach_firebase_id;
    }
    console.log('coachesssss' + tempCoaches);
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

  // onChangeOfSessionMemberAmount() {
  //   this.selectedCampDetails.per_day_amount_for_member = "0.00";
  //   let memFullAmt: any = "0.00";
  //   for (let i = 0; i < this.selectedCampDetails.session_configs.length; i++) {
  //     let calculateAmount = parseFloat(this.selectedCampDetails.session_configs.amount_for_member) + parseFloat(this.selectedCampDetails.per_day_amount_for_member);
  //     if (!isNaN(calculateAmount)) {
  //       this.selectedCampDetails.per_day_amount_for_member = calculateAmount.toFixed(2);
  //       memFullAmt = parseFloat(this.selectedCampDetails.session_configs.amount_for_member) + parseFloat(memFullAmt);
  //     }
  //   }
  //   let sesLen = this.selectedCampDetails.session_configs.length;
  //   this.selectedCampDetails.full_amount_for_member = (parseFloat(memFullAmt) * (sesLen)).toFixed(2);
  // }

  // onChangeOfSessionNonMemberAmount() {
  //   this.selectedCampDetails.per_day_amount_for_non_member = "0.00";
  //   let nonMemFullAmt: any = "0.00";
  //   for (let i = 0; i < this.selectedCampDetails.session_configs.length; i++) {
  //     let calculateAmount = parseFloat(this.selectedCampDetails.session_configs[i].amount_for_non_member) + parseFloat(this.selectedCampDetails.per_day_amount_for_non_member);
  //     if (!isNaN(calculateAmount)) {
  //       this.selectedCampDetails.per_day_amount_for_non_member = calculateAmount.toFixed(2);
  //       nonMemFullAmt = parseFloat(this.selectedCampDetails.session_configs[i].amount_for_non_member) + parseFloat(nonMemFullAmt);
  //     }
  //   }
  //   let sesLen = this.selectedCampDetails.session_configs.length;
  //   this.selectedCampDetails.full_amount_for_non_member = (parseFloat(nonMemFullAmt) * (sesLen)).toFixed(2);
  // }

  onChangeOfSessionMemberAmount() {
    this.selectedCampDetails.per_day_amount_for_member = "0.00";
    for (let i = 0; i < this.selectedCampDetails.session_configs.length; i++) {
      let calculateAmount = parseFloat(this.selectedCampDetails.session_configs[i].amount_for_member) + parseFloat(this.selectedCampDetails.per_day_amount_for_member);
      if (!isNaN(calculateAmount)) {
        this.selectedCampDetails.per_day_amount_for_member = calculateAmount.toFixed(2);
      }
    }
    //let sesLen = this.selectedCampDetails.sessions.length;
    //this.selectedCampDetails.full_amount_for_member = (parseFloat(this.selectedCampDetails.per_day_amount_for_member) * (sesLen)).toFixed(2);
  }

  onChangeOfSessionNonMemberAmount() {
    this.selectedCampDetails.per_day_amount_for_non_member = "0.00";
    for (let i = 0; i < this.selectedCampDetails.session_configs.length; i++) {
      let calculateAmount = parseFloat(this.selectedCampDetails.session_configs[i].amount_for_non_member) + parseFloat(this.selectedCampDetails.per_day_amount_for_non_member);
      if (!isNaN(calculateAmount)) {
        this.selectedCampDetails.per_day_amount_for_non_member = calculateAmount.toFixed(2);
      }
    }
    //let sesLen = this.selectedCampDetails.sessions.length;
    //this.selectedCampDetails.full_amount_for_non_member = (parseFloat(this.selectedCampDetails.per_day_amount_for_non_member) * (sesLen)).toFixed(2);
  }


  ageGroupHint() {
    let message = "Input age group separte by comma (,) Example:- 14U,16U";
    this.comonService.toastMessage(message, 2500,ToastMessageType.Error);
  }


  //update camp confirmation alert
  updateHolidayCampConfirm() {
   this.comonService.commonAlert_V4("Update Camp","Are you sure you want to update?","Yes:Update", "No", ()=>{
    this.updateCampInPostgre();
   })
  }

  //saving holidaycamp in postgre
  async updateCampInPostgre() {
    try{
      //this.comonService.showLoader("Please wait");
      const campdetails = UpadteHolidayCampDTO.updateCampDetails(this.selectedCampDetails);
      const session_config = UpadteHolidayCampDTO.updateSessionDetails(this.selectedCampDetails.session_configs);
      this.updateHolidayCampDTO.holidaycamp_details = campdetails;
      this.updateHolidayCampDTO.session_config_details = session_config;
      // holiday_camp.holidaycamp_details.updated_by = this.loggedin_user;
      // holiday_camp.holidaycamp_details.camp_postgre_fields.parentclub_id = "78c25502-a302-4276-9460-2114db73de03";
      // holiday_camp.holidaycamp_details.camp_firebase_fields.club_id = this.selectedClub;
      // holiday_camp.holidaycamp_details.camp_firebase_fields.parentclub_id = this.parentClubKey;
      // holiday_camp.holidaycamp_details.camp_postgre_fields.coach_ids = await this.getCoachIdsByFirebaseKeys(this.selectedCoach);
      // var activities = [];
      // if (!Array.isArray(this.selectedActivity)) {
      //   activities = Object.keys(this.selectedActivity)
      // } else {
      //   for (var activity of this.selectedActivity) {
      //     activities.push(activity);
      //   }
      // }
      // holiday_camp.holidaycamp_details.camp_postgre_fields.activity_ids = await this.getActivityIdsByFirebaseKeys(activities);
      // holiday_camp.holidaycamp_details.camp_postgre_fields.club_id = await this.clubVenues.find(club => club.FirebaseId == this.selectedClub).Id;
      // holiday_camp.holidaycamp_details.camp_firebase_fields.camp_id = '';
      // //const school = this.schoolVenues.find(schoolvenue => schoolvenue.firebasekey == this.selectedSchoolVenue);

      if (!this.selectedCampDetails.is_early_drop_allowed) {
        this.updateHolidayCampDTO.holidaycamp_details.early_drop_time = '08:00'
        this.updateHolidayCampDTO.holidaycamp_details.early_drop_fee = '0.00'
        this.updateHolidayCampDTO.holidaycamp_details.early_drop_non_member_fee = '0.00'
      }

       if(!this.selectedCampDetails.is_late_pickup_allowed) {
          this.updateHolidayCampDTO.holidaycamp_details.late_pickup_time = '18:00'
          this.updateHolidayCampDTO.holidaycamp_details.late_pickup_non_member_fee = '0.00'
          this.updateHolidayCampDTO.holidaycamp_details.late_pickup_fee = '0.00'
        }

      if(!this.selectedCampDetails.is_lunch_allowed) {
        this.updateHolidayCampDTO.holidaycamp_details.lunch_text = ''
        this.updateHolidayCampDTO.holidaycamp_details.lunch_price = '0.00'
        this.updateHolidayCampDTO.holidaycamp_details.lunch_price_non_member = '0.00'
      }

      if(!this.selectedCampDetails.is_snacks_allowed) {
        this.updateHolidayCampDTO.holidaycamp_details.snacks_price = '0.00'
        this.updateHolidayCampDTO.holidaycamp_details.snack_price_non_member = '0.00'
      }

  
      console.table(this.updateHolidayCampDTO);
      //return false;
      //
      const update_camp_mutation = gql`
      mutation updateHolidayCamp($holidayCampupdateInput: UpdateHolidayCampDTO!) {
        updateHolidayCamp(holidayCampupdateInput: $holidayCampupdateInput){
          id
          camp_name
          camp_type
        }
      }`
  
      const variables = { holidayCampupdateInput: this.updateHolidayCampDTO }
  
      this.graphqlService.mutate(update_camp_mutation, variables, 0).subscribe(
        result => {
          this.comonService.hideLoader();
          this.comonService.toastMessage("Successfully updated the camp", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.comonService.updateCategory('update_camps_list') ;
          console.log(`camp_upadted_res:${result}`);
          this.navCtrl.pop();
        },
        error => {
          // Handle errors
          this.comonService.hideLoader();
          this.comonService.toastMessage("Failed to update camp", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error(error);
        }
      );
    }catch(ex){
      this.comonService.hideLoader();
      console.log(`camp_upadted_failed:${ex}`);
      this.comonService.toastMessage("Failed to update camp", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    

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

  cancel() {
    this.navCtrl.pop();
  }

  getEndTime(StartTime: any, Duration: any) {
    let duration = Duration.split(":");
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
    let time = StartTime.split(":");
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

    return hour + ":" + minute;
  }


}
