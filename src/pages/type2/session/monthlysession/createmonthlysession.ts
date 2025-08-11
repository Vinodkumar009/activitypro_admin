import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, AlertController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import * as moment from 'moment';
import { WheelSelector } from '@ionic-native/wheel-selector';
import gql from "graphql-tag";
import { GraphqlService } from '../../../../services/graphql.service';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../../shared/model/club.model';
import { IMonthlySessionMainDets } from './model/monthly_session_create.model';


/**
 * Generated class for the MonthlysessionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createmonthlysession',
  templateUrl: 'createmonthlysession.html',
})
export class MonthlysessionPage {
  LangObj:any = {};//by vinod
  ActivityCategoryName:string;
  ActivitySubCategoryName:string;
  Status:Array<any>=[
    {StatusCode:1,StatusText:"Public"},
    {StatusCode:0,StatusText:"Hide"}
  ];
  monthlySessionObj:IMonthlySessionMainDets = {
    session_name: '',
    start_date: '',
    end_date: '',
    start_time: '16:00',
    duration: 60,
    days: '',
    groupsize: 15,
    isterm: false,
    group_category:"Monthly",
    comments: '',
    coach_id: '',
    club_id: '',
    PayByDate: "01",
    group_status:1,
    coach_name: '',
    activity_id: '',
    is_exist_activity_category: false,
    is_exist_activity_subcategory: false,
    activity_subCategory_key: '',
    activity_category_key: '',
    activity_category_name:'',
    activity_subCategory_name:'',
    term_id: '',
    financial_year_id: '',
    no_of_weeks: 0,
    //payment_option: 101,
    is_all_memberto_editamendsfees:true,
    is_allow_auto_subcriptions:false,
    free_sesion_interms_of_month: "0",
    no_of_month_mustpay: "0",
    imageurl: "",
  }
  parentClubKey: any = "";
  clubs: IClubDetails[] = [];
  club_activities:Activity[] = [];
  selectedActivityType: any = "";
  coachs:ActivityCoach[] = [];
  activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
  selectedCoach: any;
  selectedCoachName: any;
  activityCategoryList:ActivityCategory[] = [];
  selectActivityCategory: string;
  selectActivitySubCategory:string;
  activityCategoryObj: any;
  isExistActivitySubCategory: boolean;
  activitySubCategoryList:ActivitySubCategory[] = [];
  
  MemberListsForDeviceToken = [];
  selectedClub: any;
  isActivityCategoryExist = false;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;

  maxDate: any;
  minDate: any;

  jsonData = {
    month: [
      { description: "None" },
      { description: "01 Month" },
      { description: "02 Months" },
      { description: "03 Months" },
      { description: "04 Months" },
      { description: "05 Months" },
      { description: "06 Months" },
      { description: "07 Months" },
      { description: "08 Months" },
      { description: "09 Months" },
      { description: "10 Months" },
      { description: "11 Months" },
      { description: "12 Months" }
    ],
  };
  jsonDataInMonth = {
    payInAdvanceInMonth: [
      { description: "None" },
      { description: "01 Month" },
      { description: "02 Months" },
      { description: "03 Months" },
      { description: "04 Months" },
      { description: "05 Months" },
      { description: "06 Months" },
      { description: "07 Months" },
      { description: "08 Months" },
      { description: "09 Months" },
      { description: "10 Months" },
      { description: "11 Months" },
      { description: "12 Months" }
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
  platform = "";
  freeSessionInTermsOfMonth = "None";
  payInAdvance = "None";
  constructor(public events: Events, 
    public sharedservice: SharedServices, 
    private selector: WheelSelector, 
    public alertCtrl: AlertController, 
    public commonService: CommonService, 
    public storage: Storage, public fb: FirebaseService, 
    public popoverCtrl: PopoverController, 
    public navCtrl: NavController, public navParams: NavParams,
    private graphqlService: GraphqlService,) {
  
    this.platform = this.sharedservice.getPlatform(); 
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getClubList();
      }
    });

    

    // this.monthlySessionObj.StartDate = (new Date(moment().format('YYYY-MM-DD'))).toString();
    // this.monthlySessionObj.EndDate = (new Date(moment().format('YYYY-MM-DD'))).toString();

    this.monthlySessionObj.start_date = moment().format("YYYY-MM-DD");
    this.monthlySessionObj.end_date = moment((moment().add(3, 'year'))).format("YYYY-MM-DD");
    this.monthlySessionObj.no_of_weeks = this.commonService.calculateWeksBetweenDates(this.monthlySessionObj.start_date, this.monthlySessionObj.end_date);
    let now = moment().add(10, 'year');
    this.maxDate = moment(now).format("YYYY-MM-DD");
    this.minDate = moment().format("YYYY-MM-DD");
  }

  ionViewDidLoad() {
    this.getLanguage();
      this.events.subscribe('language', (res) => {
        this.getLanguage();
      });
    }
  
    getLanguage(){
      this.storage.get("language").then((res)=>{
        console.log(res["data"]);
       this.LangObj = res.data;
      })
    }

  selectedPayByDate(event) {
    this.monthlySessionObj.PayByDate = event.day;
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  onChangeOfClub() {
    //this.selectedActivityType = "";
    this.selectedCoach = "";
    this.coachs = [];
    //this.selectActivityCategory = "";
    this.club_activities = [];
    this.activityCategoryList = [];
    this.activitySubCategoryList = [];
    this.getActivityList();
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
    //this.selectActivityCategory = '';
    //this.selectActivitySubCategory = '';
    //this.club_activities.forEach(element => {
      // if (element.$key == this.selectedActivityType) {
      //   this.activityObj = element;
      //   this.getCoachListForGroup();

      //   if (!this.activityObj.IsExistActivityCategory) {
      //     this.isActivityCategoryExist = false;
      //     this.isExistActivitySubCategory = false;
      //   }

      //   if (this.activityObj.IsExistActivityCategory) {
      //     this.isActivityCategoryExist = true;
      //     this.getActivityCategoryList();
      //   }
      // }
      
    //});
    this.getCoachListForGroup();
    this.getActivityCategoryList();
  }

 //getting parentclub venues
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
        
        if(this.clubs.length > 0){
          this.selectedClub = this.clubs[0].FirebaseId;
          console.log("clubs lists:", JSON.stringify(this.clubs));
          this.getActivityList();
        }else{
          this.commonService.toastMessage("clubs not found",2500,ToastMessageType.Error)
        }
        
      },
     (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
         // Handle the error here, you can display an error message or take appropriate action.
     })        
  }

  //getting parentclub-venue-activities
  getActivityList() {
    // const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
    //   activity$Obs.unsubscribe();
    //   // this.acType = data;
    //   this.types = [];
    //   if (data.length > 0) {
    //     for (let index = 0; index < data.length; index++) {
    //       if (data[index].IsActive && data[index].IsEnable) {
    //         this.types.push(data[index]);
    //       }
    //     }
    //   }
    //   if (this.types.length != 0) {
    //     this.selectedActivityType = this.types[0].$key;
    //     this.activityObj = this.types[0];
    //     this.getCoachListForGroup();
    //     if (this.activityObj.IsExistActivityCategory) {
    //       this.getActivityCategoryList();
    //     }
    //   }
    // });

    const club_activity_input:ClubActivityInput = {
      ParentClubKey:this.parentClubKey,
      ClubKey:this.selectedClub,
      VenueKey:this.selectedClub,
      AppType:0, //0-Admin
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
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
      this.graphqlService.query(clubs_activity_query,{input_obj:club_activity_input},0)
        .subscribe((res: any) => {
          if(res.data.getAllActivityByVenue.length > 0){
            this.club_activities = res.data.getAllActivityByVenue as Activity[];
            //console.log("clubs lists:", JSON.stringify(this.clubs));
            this.selectedActivityType = this.club_activities[0].ActivityKey;
            this.getCoachListForGroup();
            this.getActivityCategoryList(); 
          }else{
            this.selectedActivityType = "";
            this.commonService.toastMessage("no activities found",2500,ToastMessageType.Error)
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       })        
  }


  getCoachListForGroup() {
    //this.coachs = [];
    // if (this.activityObj.Coach != undefined) {
    //   //this.coachs = this.commonService.convertFbObjectToArray(this.activityObj.Coach);
    //   let coachListArr = this.commonService.convertFbObjectToArray(this.activityObj.Coach);
    //   for (let activeCoachIndex = 0; activeCoachIndex < coachListArr.length; activeCoachIndex++) {
    //     if (coachListArr[activeCoachIndex].IsActive) {
    //       //coachList.push(coachListArr[activeCoachIndex]);
    //       this.coachs.push(coachListArr[activeCoachIndex]);
    //     }
    //   }
    //   this.selectedCoach = this.coachs[0].CoachKey;
    //   this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].MiddleName + " " + this.coachs[0].LastName;
    // }
    // else {
    //   this.selectedCoach = "";
    //   this.selectedCoachName = "";
    //   this.coachs = [];
    // }

    const club_coaches_input:ActivityInfoInput = {
      firebase_fields:{
        parentclub_id:this.parentClubKey,
        club_id:this.selectedClub,
        activity_id:this.selectedActivityType
      },
      AppType:0, //0-Admin
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
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
      this.graphqlService.query(activity_coaches_query,{input_obj:club_coaches_input},0)
        .subscribe((res: any) => {
          if(res.data.getAllActivityCoachs.length > 0){
            this.coachs = res.data.getAllActivityCoachs as ActivityCoach[];
            this.selectedCoach = this.coachs[0].CoachId;
            this.selectedCoachName = this.coachs[0].FirstName+" "+this.coachs[0].LastName;
          }else{
            this.commonService.toastMessage("no coachs found",2500,ToastMessageType.Error)
            this.selectedCoach = "";
            this.selectedCoachName = "";
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       }) 

  }


  //get activity category according to activity list
  //calling from getActivityList method
  //Done
  getActivityCategoryList() {

    // this.activityCategoryList = [];
    // if (this.activityObj.ActivityCategory != undefined) {
    //   this.activityCategoryList = this.commonService.convertFbObjectToArray(this.activityObj.ActivityCategory).filter(cat => cat.IsActive);
    //   this.selectActivityCategory = this.activityCategoryList[0].Key;
    //   this.activityCategoryObj = this.activityCategoryList[0];
    //   this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
    //   if (this.activityCategoryObj.IsExistActivitySubCategory) {
    //     this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory).filter(cat => cat.IsActive);
    //     this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
    //   }

    // }
    // else {
    //   this.selectedCoach = "";
    //   this.selectedCoachName = "";
    //   this.coachs = [];
    // }

    const activity_categories_input:ActivityInfoInput = {
      firebase_fields:{
        parentclub_id:this.parentClubKey,
        club_id:this.selectedClub,
        activity_id:this.selectedActivityType,

      },
      AppType:0, //0-Admin
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
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
      this.graphqlService.query(activity_categories_query,{input_obj:activity_categories_input},0)
        .subscribe((res: any) => {
          this.activityCategoryList = res.data.getAllActivityCategories as ActivityCategory[];
          if(this.activityCategoryList.length > 0){
            this.isActivityCategoryExist = true;
            this.selectActivityCategory = this.activityCategoryList[0].ActivityCategoryId;
            this.getActivitySubCategoryList();
          }else{
            this.isActivityCategoryExist = false;
            //this.selectedCoach = "";
            this.selectActivityCategory = "";
            this.activityCategoryList = [];
            this.commonService.toastMessage("no categories found",2500,ToastMessageType.Error)                  
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       }) 
  }

  getActivitySubCategoryList(){
    const activity_subcategories_input:ActivityInfoInput = {
      firebase_fields:{
        parentclub_id:this.parentClubKey,
        club_id:this.selectedClub,
        activity_id:this.selectedActivityType,
        category_id:this.selectActivityCategory
      },
      AppType:0, //0-Admin
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
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
      this.graphqlService.query(activity_sub_categories_query,{input_obj:activity_subcategories_input},0)
        .subscribe((res: any) => {
          this.activitySubCategoryList = res.data.getAllActivityCategorySubCategories as ActivitySubCategory[];
          if(this.activitySubCategoryList.length > 0){
            this.selectActivitySubCategory = this.activitySubCategoryList[0].ActivitySubCategoryId;
            this.isExistActivitySubCategory = true;
          }else{
            this.selectActivitySubCategory = '';
            this.activitySubCategoryList = []
            this.isExistActivitySubCategory = false;
            this.commonService.toastMessage("no subcategories found",2500,ToastMessageType.Error)
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       }) 
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

  }
  days = [];
  selectedDayDetails(day) {

    if (this.monthlySessionObj.days == "") {
      this.monthlySessionObj.days += day;
    }
    else {
      this.monthlySessionObj.days += "," + day;
    }
  }

  onChangeActivityCategory() {
    // this.activityCategoryList.forEach(element => {
    //   if (element.Key == this.selectActivityCategory) {
    //     this.activityCategoryObj = element;
    //     this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
    //     if (this.activityCategoryObj.IsExistActivitySubCategory) {
    //       this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
    //       this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
    //       this.getActivityCategoryList()
    //     }
    //   }
    // });
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


  continue() {
    // let confirm = this.alertCtrl.create({
    //   message: paymentOptions == '104' ? 'Continue for (Installment)?' : 'Continue for (Monthly)?',
    //   buttons: [
    //     {
    //       text: 'No',
    //       handler: () => {}
    //     },
    //     {
    //       text: 'Yes',
    //       handler: () => {
      this.monthlySessionObj.activity_category_key = this.selectActivityCategory;
      this.monthlySessionObj.activity_subCategory_key = this.selectActivitySubCategory
      this.monthlySessionObj.activity_id = this.selectedActivityType;
      this.monthlySessionObj.club_id = this.clubs.find(club => club.FirebaseId === this.selectedClub).Id;
      this.monthlySessionObj.coach_id = this.selectedCoach;
      this.monthlySessionObj.activity_category_name = (this.activityCategoryList.find(actvity_category => actvity_category.ActivityCategoryId === this.selectActivityCategory)).ActivityCategoryName;
      this.monthlySessionObj.activity_subCategory_name = (this.activitySubCategoryList.find(actvity_sub_category => actvity_sub_category.ActivitySubCategoryId === this.selectActivitySubCategory)).ActivitySubCategoryName;
    if (this.validateMonthlySession()) {
      this.initializeMonthlySession(); 
      this.navCtrl.push("SessionMonthlyCreationList", { SessionDetailsObject: this.monthlySessionObj});
    }



    //       }
    //     }
    //   ]
    // });
    // confirm.present();





  }
  

  validateMonthlySession() {

    if (this.monthlySessionObj.session_name == "" || this.monthlySessionObj.session_name == undefined) {
      let message = "Please enter session name.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedClub == "" || this.selectedClub == undefined) {
      let message = "Please select a venue.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.monthlySessionObj.activity_category_key == "" || this.monthlySessionObj.activity_category_key == undefined) {
      let message = "Please select an activity for the session creation.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
      let message = "Please select a coach for the session creation.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }

    else if (this.monthlySessionObj.groupsize == 0 || this.monthlySessionObj.groupsize == undefined) {
      let message = "Enter group size for the session.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }

    else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.monthlySessionObj.start_time == "" || this.monthlySessionObj.start_time == undefined) {
      let message = "Please choose session start time.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.monthlySessionObj.duration == 0 || this.monthlySessionObj.duration == undefined) {
      let message = "Enter Session Duration in minutes.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }

    else if (this.monthlySessionObj.start_date == "" || this.monthlySessionObj.start_date == undefined) {
      let message = "Please choose session start date.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.monthlySessionObj.end_date == "" || this.monthlySessionObj.end_date == undefined) {
      let message = "Please choose session end date.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    // else if (this.monthlySessionObj.PayByDate == "" || this.monthlySessionObj.PayByDate == undefined) {
    //   let message = "Please choose session pay by date.";
    //   this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
    //   return false;
    // }
    else if (this.monthlySessionObj.no_of_weeks == 0 || this.monthlySessionObj.no_of_weeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }
  }


  selectFreeSessions() {
    this.selector.show({
      title: "Free Session(s)",
      theme: this.platform == 'android'?'dark':"light",
      items: [
        this.jsonData.month
      ],
    }).then(
      result => {
        this.freeSessionInTermsOfMonth = result[0].description;
        if (this.freeSessionInTermsOfMonth != "None") {
          this.monthlySessionObj.free_sesion_interms_of_month = result[0].description[0] + result[0].description[1];
        } else {
          this.monthlySessionObj.free_sesion_interms_of_month = "0";
        }
      },
      err => console.log('Error: ', err)
    );
  }


  numberOfMonthMustPay() {
    this.selector.show({
      title: "Pay in advance",
      theme: this.platform == 'android'?'dark':"light",
      items: [
        this.jsonDataInMonth.payInAdvanceInMonth
      ],
    }).then(
      result => {
        this.payInAdvance = result[0].description;
        if (this.payInAdvance != "None") {
          this.monthlySessionObj.no_of_month_mustpay = result[0].description[0] + result[0].description[1];
        } else {
          this.monthlySessionObj.no_of_month_mustpay = "0";
        }



        // this.monthlySessionObj.NoOfMonthMustPay = result[0].description;
      },
      err => console.log('Error: ', err)
    );
  }


  payByDate() {
    this.selector.show({
      title: "Pay by date",
      theme: this.platform == 'android'?'dark':"light",
      items: [
        this.jsonPayByDateData.month
      ],
    }).then(
      result => {
        this.monthlySessionObj.PayByDate = result[0].description;

        // this.monthlySessionObj.NoOfMonthMustPay = result[0].description;
      },
      err => console.log('Error: ', err)
    );
    //console.log(this.monthlySessionObj.PayByDate);
  }


  

  initializeMonthlySession() {
    // let obj = { ActivityCode: '', ActivityName: '', AliasName: '', IsExistActivityCategory: false, IsActive: true };
    // let coachObj = { CoachName: '', CoachKey: '', IsActive: true }
    // let activityCategoryDetails = { ActivityCategoryCode: '', ActivityCategoryName: '', IsExistActivitySubCategory: false, IsActive: true };
    
    // this.monthlySessionObj.club_id = this.selectedClub;
    // this.monthlySessionObj.coach_id = this.selectedCoach;
    // this.monthlySessionObj.coach_name = this.selectedCoachName;
    
    // this.monthlySessionObj.activity_id = this.activityObj.$key;
    // this.monthlySessionObj.activity_category_id = this.selectActivityCategory;
    // this.monthlySessionObj.is_allow_auto_subcriptions = false;
    // // this.sessionDetails.FinancialYearKey = this.currentFinancialYear;

    // //coach details
    // coachObj.CoachName = this.selectedCoachName;
    // coachObj.CoachKey = this.selectedCoach;
    // coachObj.IsActive = true;



    // //Activity details
    // obj.ActivityCode = this.activityObj.ActivityCode;
    // obj.ActivityName = this.activityObj.ActivityName;
    // obj.AliasName = this.activityObj.AliasName;
    // obj.IsExistActivityCategory = this.activityObj.IsExistActivityCategory;
    // //this.monthlySessionObj.is_exist_activity_category = obj.IsExistActivityCategory;

    // //Activity initialization in session 
    // this.monthlySessionObj["Activity"] = {};
    // this.monthlySessionObj["Activity"][this.activityObj.$key] = obj;


    // //Activity category details
    // if (this.activityObj.IsExistActivityCategory) {

    //   activityCategoryDetails.ActivityCategoryCode = this.activityCategoryObj.ActivityCategoryCode;
    //   activityCategoryDetails.ActivityCategoryName = this.activityCategoryObj.ActivityCategoryName;
    //   activityCategoryDetails.IsExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
    //   //this.monthlySessionObj.is_exist_activity_subcategory = activityCategoryDetails.IsExistActivitySubCategory;
    //   //Activitycategory initialization in session
    //   this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"] = {};
    //   //[this.activityCategoryObj.Key]={};
    //   this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key] = activityCategoryDetails;


    // }
    this.monthlySessionObj.days = "";
    this.days.sort();
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      switch (this.days[daysIndex]) {
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



    // let actSubCategoryObj = { ActivitySubCategoryCode: '', ActivitySubCategoryName: '', IsActive: true, IsEnable: '', Key: '' };
    // if (this.isExistActivitySubCategory) {
    //   for (let acsIndex = 0; acsIndex < this.activitySubCategoryList.length; acsIndex++) {
    //     if (this.activitySubCategoryList[acsIndex].Key == this.selectActivitySubCategory) {
    //       actSubCategoryObj = this.activitySubCategoryList[acsIndex];
    //       this.monthlySessionObj.activity_category_id = actSubCategoryObj.Key;
    //     }
    //   }
    // }
    // if (this.isExistActivitySubCategory) {
    //   // this.fb.update(actSubCategoryObj.Key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/" + this.activityObj.$key + "/ActivityCategory/" + this.activityCategoryObj.Key + "/ActivitySubCategory/", actSubCategoryObj);
    //   this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key]["ActivitySubCategory"] = {};
    //   //  [actSubCategoryObj.Key]={};
    //   this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key]["ActivitySubCategory"][actSubCategoryObj.Key] = actSubCategoryObj;

    // }

    

  }




  validateSessionDate() {
    if (new Date(this.monthlySessionObj.start_date).getTime() > new Date(this.monthlySessionObj.end_date).getTime()) {
      this.commonService.toastMessage("Session start date should be greater than end date", 2500,ToastMessageType.Error);
      return false;
    }
    return true;
  }

  dateChanged() {
    if (this.validateSessionDate()) {
      this.monthlySessionObj.no_of_weeks = this.commonService.calculateWeksBetweenDates(this.monthlySessionObj.start_date, this.monthlySessionObj.end_date);
    } else {
      this.monthlySessionObj.start_date = this.monthlySessionObj.end_date;
      this.monthlySessionObj.end_date = this.monthlySessionObj.end_date;
      this.monthlySessionObj.no_of_weeks = this.commonService.calculateWeksBetweenDates(this.monthlySessionObj.start_date, this.monthlySessionObj.end_date);
    }


  }

}
