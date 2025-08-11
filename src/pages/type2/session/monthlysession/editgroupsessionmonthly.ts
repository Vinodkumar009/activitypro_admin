//not changed

import { Component } from '@angular/core';
import { ToastController, NavController, NavParams, AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import * as moment from 'moment';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { WheelSelector } from '@ionic-native/wheel-selector';
import gql from "graphql-tag";
import { MonthlySessionCreate, MonthlySessionEdit } from './model/monthly_session_create.model';
import { MonthlySessionDets } from './model/monthly_session.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../../shared/model/club.model';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';

@IonicPage()
@Component({
  selector: 'editgroupsessionmonthly-page',
  templateUrl: 'editgroupsessionmonthly.html',
  providers: [HttpService]
})

export class Type2EditGroupSessionMonthly {
  
  postgre_session_input:MonthlySessionEdit;
  updated_by:string;
  canExtendSession:boolean = true;
  installmentObj = {};
  editsessionDetails: any;
  Status:Array<any>=[
    {StatusCode:1,StatusText:"Public"},
    {StatusCode:0,StatusText:"Hide"}
  ];
  themeType: number;
  // paymentOptions = [{ Key: 100, Value: "Term" }, { Key: 101, Value: "Monthly" }, { Key: 102, Value: "Weekly" }, { Key: 103, Value: "Per Session" }, { Key: 104, Value: "Installment" }];
  clubs:IClubDetails[] = [];
  selectedClubKey = "";
  // terms = [];
  parentClubKey = "";
  // selectedTermKey = "";
  types:Activity[] = [];
  // isExistActivityCategory = false;
  // isExistActivitySubCategory = false
  // activityCategoryList = [];
  selectActivityCategoryKey: string = "";
  activitySubCategoryList:ActivitySubCategory[] = [];
  selectActivitySubCategoryKey:string;
  selectedActivityTypeKey:string = "";


  sessionDetails = {
    IsActive: true,
    SessionName: 'Session',
    StartDate: '',
    EndDate: '',
    StartTime: '16:00',
    Duration: '60',
    Days: '',
    GroupSize: '10',
    IsTerm: false,
    Comments: '',
    CoachKey: '',
    ClubKey: '',
    ParentClubKey: '',
    GroupStatus:1,
    PayByDate: "01",
    //Total fees for member
    CoachName: '',
    SessionType: '',
    ActivityKey: '',
    ActivityCategoryKey: '',
    TermKey: '',
    FinancialYearKey: '',
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: '',
    IsExistActivityCategory: false,
    NoOfWeeks: 0,
    PaymentOption: 101,
    //IsAllMembertoEditFees: true,
    IsAllMembertoEditAmendsFees:true,
    FreeSesionIntermsOfMonth: "1",
    NoOfMonthMustPay: "3",
    ImageUrl: "",
    SessionFee: '',
    ShowInAPKids:false,
    IsAllowGroupChat:false,
  }

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

  feesObject = {
    AmountForOneDayPerWeekForMember: '',
    AmountForOneDayPerWeekForNonMember: '',
    AmountForTwoDayPerWeekForMember: '',
    AmountForTwoDayPerWeekForNonMember: '',
    AmountForThreeDayPerWeekForMember: '',
    AmountForThreeDayPerWeekForNonMember: '',
    AmountForFourDayPerWeekForMember: '',
    AmountForFourDayPerWeekForNonMember: '',
    AmountForFiveDayPerWeekForMember: '',
    AmountForFiveDayPerWeekForNonMember: '',
    AmountForSixDayPerWeekForMember: '',
    AmountForSixDayPerWeekForNonMember: '',
    AmountForSevenDayPerWeekForMember: '',
    AmountForSevenDayPerWeekForNonMember: ''
  };

  selectedCoachKey = "";
  coachs:ActivityCoach[] = [];
  days = [];
  DiscountArray = [];
    

  
  activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
  selectedCoach: any;
  selectedCoachName: any;
  activityCategoryList:ActivityCategory[] = [];
  activityCategoryObj: any;
  isExistActivityCategory:boolean;
  isExistActivitySubCategory: boolean;
  selectActivitySubCategory = [];
  selectActivityCategory: any;
  freeSessionInTermsOfMonth = "None";
  payInAdvance = "None";
  maxDate: any;
  platform = "";
  nestUrl:any
  currencyDetails: any;
  session_dets:MonthlySessionDets;
  payplans = new Map();
  postgre_parentclub_id:string = '';
  constructor(private selector: WheelSelector, 
    public commonService: CommonService, public alertCtrl: AlertController, 
    public navParams: NavParams, storage: Storage, 
    public fb: FirebaseService, 
    public navCtrl: NavController, public sharedservice: SharedServices,
     public popoverCtrl: PopoverController,
     private graphqlService: GraphqlService,
     private httpService: HttpService,
    ) {
    // //calculate after 10 years
    // this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
    this.nestUrl = sharedservice.getnestURL();
    let now = moment().add(10, 'year');
    //this.maxDate = moment(now).format("YYYY-MM-DD");
    this.platform = this.sharedservice.getPlatform(); 
    this.themeType = sharedservice.getThemeType();
    //this.editsessionDetails = navParams.get('SessionDetails');
    
    this.session_dets = <MonthlySessionDets>navParams.get('SessionDetails');
    this.postgre_session_input = new MonthlySessionEdit(this.session_dets);
    //this.canExtendSession = moment(this.postgre_session_input.EndDate).isAfter(moment().format('YYYY-MM-DD')) ? false:true; //basically expire means can't extend
    this.maxDate = moment((moment(this.postgre_session_input.EndDate).add(1, 'year'))).format("YYYY-MM-DD").toString();
    //this.postgre_session_input.session_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.session_dets.payplans.forEach((plan)=>{
      this.payplans.set(plan.plan_id_member,plan.plan_amount_member);
      this.payplans.set(plan.plan_id_non_member,plan.plan_amount_non_member);
    })

    Promise.all([
      storage.get('userObj'),
      storage.get('Currency'),
      storage.get('postgre_parentclub')
    ]).then(([userObj, currencyDetails, postgre_parentclub]) => {
      if (userObj) {
        const val = JSON.parse(userObj);
        if (val.$key != "") {
          this.updated_by = val.$key;
          this.postgre_session_input.user_postgre_metadata.UserMemberId = val.$key;
        }
      }
      if (currencyDetails) {
        this.currencyDetails = JSON.parse(currencyDetails);
      }
      if (postgre_parentclub) {
        this.postgre_parentclub_id = postgre_parentclub.Id;
      }
    }).catch(error => {
      console.error("Error fetching storage data:", error);
    });

    // storage.get('Currency').then((val) => {
    //   this.currencyDetails = JSON.parse(val);
    // }).catch(error => {
    // });
    // storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.updated_by = val.$key;
    //     this.postgre_session_input.user_postgre_metadata.UserMemberId = val.$key;
    //   }
    // })
    
    this.days = this.session_dets.days.split(/,/g);
    // if(this.DiscountArray){
    //   this.DiscountArray = Array.isArray(this.editsessionDetails.Discount) ? this.editsessionDetails.Discount : this.commonService.convertFbObjectToArray(this.editsessionDetails.Discount);
    // }
  
    this.selectedClubKey = this.session_dets.ClubDetails.FirebaseId;
    this.parentClubKey = this.session_dets.ParentClubDetails.FireBaseId;
    this.selectedActivityTypeKey = this.session_dets.ActivityDetails.FirebaseActivityKey;
    this.selectActivityCategoryKey = this.session_dets.firebase_activity_categorykey;
    //this.selectActivitySubCategoryKey = this.session_dets.firebase_activity_subcategorykey;
    this.selectedCoachKey = this.session_dets.coaches[0].coach_firebase_id;
    this.isExistActivitySubCategory = this.session_dets.is_exist_activity_subcategory;
    this.isExistActivityCategory = this.session_dets.is_exist_activitycategory;
    
    // this.getCoachListAccordingToActivity();

    this.getClubList();
    //this.getActivityList();
    //****************************************** */
    //   Keeping the session details, which object we have sent from session listing page
    //   
    

    //this.payInAdvance =(this.sessionDetails.FreeSesionIntermsOfMonth=="0"?"None":);

    switch (parseInt(this.session_dets.free_months)) {
      case 0:
        this.freeSessionInTermsOfMonth = "None";
        break;
      case 1:
        this.freeSessionInTermsOfMonth = "01 Month";
        break;
      default:
        this.freeSessionInTermsOfMonth = this.session_dets.free_months + " Months";
        break;
    }
    switch (parseInt(this.session_dets.must_pay_months)) {
      case 0:
        this.payInAdvance = "None";
        break;
      case 1:
        this.payInAdvance = "01 Month";
        break;
      default:
        this.payInAdvance = this.session_dets.free_months + " Months";
        break;
    }


    


  }

  //****************************************** */
  //   Popover showing logout 
  //

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  showChatTermsAlert(){
    setTimeout(()=>{
      console.log(this.postgre_session_input.IsAllowGroupChat);
      if(this.postgre_session_input.IsAllowGroupChat){
        let alert = this.alertCtrl.create({
          title: 'Enable Chat',
          //message: `${this.ParentClubName} is fully responsible for the content of the chat among the chat users. ActivityPro is not liable for any misuse of the chat facility as a platform provider`,
          message: `is fully responsible for the content of the chat among the chat users. ActivityPro is not liable for any misuse of the chat facility as a platform provider`,
          buttons: [
            {
              text: "Agree: Enable Chat",
              handler: () => {}
            },
            {
              text: 'No: Disable Chat',
              role: 'cancel',
              handler: data => {
                this.postgre_session_input.IsAllowGroupChat = !this.postgre_session_input.IsAllowGroupChat;
              }
            }
          ]
        });
        alert.present();
      }
    },100)
  }

  //****************************************** */
  //   Go to dashboard menu page by clicking  
  //
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  // //****************************************** */
  // //   Get the Club details for showing in the dropdown menu 
  // //   Not allowing to change the club from drop down menu, it's just a readonly field

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
          //this.selectedClub = this.clubs[0].FirebaseId;
          //console.log("clubs lists:", JSON.stringify(this.clubs));
          this.getActivityList();
        }else{
          this.commonService.toastMessage("no clubs found",2500,ToastMessageType.Error)
        }
        
      },
     (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
         // Handle the error here, you can display an error message or take appropriate action.
     })  
  }

  getActivityList() {
    // this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
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
    //     for (let i = 0; i < this.types.length; i++) {
    //       if (this.types[i].$key == this.selectedActivityTypeKey) {
    //         this.activityObj = this.types[i];
    //         break;
    //       }
    //     }
    //     this.getCoachListForGroup();
    //     if (this.activityObj.IsExistActivityCategory) {
    //       this.getActivityCategoryList();
    //     }
    //   }
    // });
    const club_activity_input:ClubActivityInput = {
      ParentClubKey:this.parentClubKey,
      ClubKey:this.selectedClubKey,
      VenueKey:this.selectedClubKey,
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
            this.types = res.data.getAllActivityByVenue as Activity[];
            //console.log("clubs lists:", JSON.stringify(this.clubs));
            this.getCoachListForGroup();
            this.getActivityCategoryList(); 
          }else{
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
    this.coachs = [];
    // if (this.activityObj.Coach != undefined) {
    //   //this.coachs = this.commonService.convertFbObjectToArray(this.activityObj.Coach);
    //   let coachListArr = this.commonService.convertFbObjectToArray(this.activityObj.Coach);
    //   for (let activeCoachIndex = 0; activeCoachIndex < coachListArr.length; activeCoachIndex++) {
    //     if (coachListArr[activeCoachIndex].IsActive) {
    //       //coachList.push(coachListArr[activeCoachIndex]);
    //       this.coachs.push(coachListArr[activeCoachIndex]);
    //     }
    //   }
    // }
    // else {
    //   this.selectedCoachKey = "";
    //   this.selectedCoachName = "";
    //   this.coachs = [];
    // }
    const club_coaches_input:ActivityInfoInput = {
      firebase_fields:{
        parentclub_id:this.parentClubKey,
        club_id:this.selectedClubKey,
        activity_id:this.selectedActivityTypeKey
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
            if(this.coachs.length > 0){
              this.selectedCoachKey = this.session_dets.coaches[0].coach_firebase_id;
              //this.selectedCoachName = this.coachs.find(coach => coach.CoachId === this.selectedCoach).FirstName+" "+this.coachs[0].LastName;
            }
          }else{
            this.commonService.toastMessage("no coachs found",2500,ToastMessageType.Error)
            this.selectedCoachKey = "";
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

    this.activityCategoryList = [];
    // if (this.activityObj.ActivityCategory != undefined) {
    //   this.activityCategoryList = this.commonService.convertFbObjectToArray(this.activityObj.ActivityCategory).filter(cat => cat.IsActive);
    //   for (let activityCategoryIndex = 0; activityCategoryIndex < this.activityCategoryList.length; activityCategoryIndex++) {
    //     if (this.selectActivityCategoryKey == this.activityCategoryList[activityCategoryIndex].Key) {
    //       this.activityCategoryObj = this.activityCategoryList[activityCategoryIndex];
    //       break;
    //     }
    //   }
    //   if (this.activityCategoryObj.IsExistActivitySubCategory) {
    //     this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory).filter(cat => cat.IsActive);
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
        club_id:this.selectedClubKey,
        activity_id:this.selectedActivityTypeKey,

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
            //this.selectActivityCategory = this.activityCategoryList[0].ActivityCategoryId;
            this.getActivitySubCategoryList();
          }else{
            this.commonService.toastMessage("no categories found",2500,ToastMessageType.Error)
            this.selectedCoach = "";
            this.selectedCoachName = "";
            this.coachs = [];
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
        club_id:this.selectedClubKey,
        activity_id:this.selectedActivityTypeKey,
        category_id:this.selectActivityCategoryKey
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
            if(!this.selectActivitySubCategoryKey){ //first time
              this.selectActivitySubCategoryKey = this.session_dets.firebase_activity_subcategorykey;
            }else{
              this.selectActivitySubCategoryKey = this.activitySubCategoryList[0].ActivitySubCategoryId;
            }
          }else{
            this.commonService.toastMessage("no subcategories found",2500,ToastMessageType.Error)
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       }) 
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

  showEndDatePopUp() {
      const min = this.postgre_session_input.EndDate;
      const max = moment(this.postgre_session_input.EndDate, "YYYY-MM-DD").add(5,'years').format("DD-MM-YYYY");
      this.commonService.presentMultiInputDynamicAlert(
        'Edit End Date',
        [
          {
            name: 'end_date',
            type: 'date',
            min: min,
            max: max,
            value: moment(this.postgre_session_input.EndDate, "YYYY-MM-DD").format("DD-MM-YYYY"),
            placeholder: 'End Date',
          },
        ],
        [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => console.log('Date edit canceled'),
          },
          {
            text: 'Save',
            handler: (data) => {
              if(data.end_date) {
                console.log('Dates updated:', data);
                if(this.commonService.validateStartAndEndDate(this.postgre_session_input.StartDate,data.end_date)){
                  this.postgre_session_input.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.postgre_session_input.StartDate, this.postgre_session_input.EndDate);
                  this.updateMonthlySessionEndDate(data.end_date);
                  console.log("dates updated");
                }else{
                  this.postgre_session_input.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.postgre_session_input.EndDate, this.postgre_session_input.EndDate);
                }
              } else {
                this.commonService.toastMessage("Please select the valid dates", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
              }
            },
          },
        ]
      );
  }

  updateMonthlySessionEndDate(end_date) {
      const stats_input = {
        session_id: this.session_dets.id,
        end_date: end_date,
        parentclubId: this.postgre_parentclub_id,
        device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
        updated_by: this.sharedservice.getLoggedInId(),
        device_id: this.sharedservice.getDeviceId() || "",
        app_type: AppType.ADMIN_NEW
      }
      //const bookingDetailsDTO = new BookingStatsInputDTO(stats_input);
      //console.log("input for bookinginfo", bookingDetailsDTO)
      this.httpService.post<{ message: string, data: Boolean }>(`${API.UPDATE_MONTHLY_SESSION_ENDDATE}`, stats_input)
        .subscribe({
          next: (res) => {
            this.postgre_session_input.EndDate = end_date;
            this.commonService.toastMessage("End date updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            console.log("resonse for stats", JSON.stringify(res.data));
          },
          error: (err) => {
            console.error("Error fetching events:", err);
            if(err.error && err.error.message){
              this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }else{
              this.commonService.toastMessage('Failed to update end date', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
          }
        });
  }

  //****************************************** */
  //  When user will click on cancel buttton will show a prompt, whether user really wants to 
  //  exit i.e cancel or not
  //  If YES go back to listing window Else stay on the page rather popping up from current page

  cancelSessionCreation() {
    let confirm = this.alertCtrl.create({
      title: 'Session Update',
      message: 'Are you sure you want to cancel the session updation? ',
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

  //****************************************** */
  //  Show toast method
  //  To show Success message or error message or warning message to user
  //  This toast will come from bottom of the screen beacuse here we have initilize position property 
  //  with bottom value

  

  selectedPayByDate(event) {
    //  this.sessionDetails.PayByDate = event.day;
    this.selector.show({
      title: "Pay in advance",
      theme: this.platform == 'android'?'dark':"light",
      items: [
        this.jsonPayByDateData.month
      ],
    }).then(
      result => {
        this.sessionDetails.PayByDate = result[0].description;
      },
      err => console.log('Error: ', err)
    );
  }




  updateSession() {
    let confirm = this.alertCtrl.create({
      title: 'Session Update',
      message: 'Are you sure you want to update the session?',
      buttons: [
        {
          text: 'No',
          role:"cancel",
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.updatePostgreSession();
          }
        }
      ]
    });
    confirm.present();
  }

  // this.session_dets.payplans.forEach((plan)=>{
  //   this.payplans.set(plan.plan_id_member,plan.plan_amount_member);
  //   this.payplans.set(plan.plan_id_non_member,plan.plan_amount_non_member);
  // })
  async updatePostgreSession(){
    this.postgre_session_input.GroupSize = Number(this.postgre_session_input.GroupSize);
    this.postgre_session_input.GroupStatus = Number(this.postgre_session_input.GroupStatus);
    this.postgre_session_input.Duration = this.postgre_session_input.Duration.toString()
    this.postgre_session_input.NoOfWeeks = Number(this.postgre_session_input.NoOfWeeks);
    this.postgre_session_input.category_id = this.selectActivityCategoryKey;
    this.postgre_session_input.category_name = this.activityCategoryList.filter(category => category.ActivityCategoryId === this.selectActivityCategoryKey)[0].ActivityCategoryName;
    this.postgre_session_input.sub_category_id = this.selectActivitySubCategoryKey;
    this.postgre_session_input.sub_category_name = this.activitySubCategoryList.filter(category => category.ActivitySubCategoryId === this.selectActivitySubCategoryKey)[0].ActivitySubCategoryName;
    //this.postgre_session_input.waitinglist_capacity = Number(this.postgre_session_input.waitinglist_capacity);
    this.postgre_session_input.PayPlans = [];
    for(const plan of this.session_dets.payplans){
      const member_plan_price = this.payplans.get(plan.plan_id_member)
      const non_member_plan_price = this.payplans.get(plan.plan_id_non_member)
      if((member_plan_price!=plan.plan_amount_member) || (non_member_plan_price!=plan.plan_amount_non_member)){
        this.postgre_session_input.PayPlans.push({
          noOfdays:plan.days_for,
          member_price:member_plan_price!=plan.plan_amount_member ? plan.plan_amount_member : undefined,
          non_member_price: non_member_plan_price != plan.plan_amount_non_member ? plan.plan_amount_non_member : undefined
        })
      }
    }

    console.table(this.postgre_session_input);
    this.postgre_session_input.session_postgre_fields.coach_ids = [];
    this.postgre_session_input.session_postgre_fields.coach_ids.push(await this.getCoachIdsByFirebaseKeys(this.selectedCoachKey));
    const monthly_ses_mutation = gql`
    mutation updateMonthlySession($sessionInput: EditMonthlySessionInput!) {
      updateMonthlySession(updateMonthlySessionInput: $sessionInput){
            id
        }
    }` 
    
    const monthly_mutation_variable = { sessionInput: this.postgre_session_input };
      this.graphqlService.mutate(
        monthly_ses_mutation, 
        monthly_mutation_variable,
        0
      ).subscribe((response)=>{
        const message = "Session updated successfully. Please add member(s) to the session.";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
        //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
        this.commonService.updateCategory("update_session_list");
        //this.reinitializeSession();
      },(err)=>{
        this.commonService.toastMessage("Session updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }); 
  }

  getCoachIdsByFirebaseKeys(coach_ids):Promise<any>{
    return new Promise((res,rej)=>{
      const coach_query = gql`
      query getCoachesByFirebaseIds($coachIds: [String!]) {
        getCoachesByFirebaseIds(coachIds: $coachIds){
          Id
          first_name
          last_name
          coach_firebase_id
         }
      }`
      const coach_query_variables = {coachIds: coach_ids};
      this.graphqlService.query(
          coach_query, 
          coach_query_variables,
          0
      ).subscribe((response)=>{
          res(response.data["getCoachesByFirebaseIds"][0]["Id"]);
      },(err)=>{
          rej(err);
      }); 
    })
    
  }

  onChangeOfMemberAmount() {

  }

  validateSessionDate() {
    if (new Date(this.postgre_session_input.StartDate).getTime() > new Date(this.postgre_session_input.EndDate).getTime()) {
      this.commonService.toastMessage("Session start date should be greater than end date.", 2500);
      return false;
    }
    return true;
  }

  dateChanged() {
    if (this.validateSessionDate()) {
      this.postgre_session_input.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.postgre_session_input.StartDate, this.postgre_session_input.EndDate);
    } else {
      // this.sessionDetails.StartDate = this.postgre_session_input.EndDate;
      // this.sessionDetails.EndDate = this.postgre_session_input.EndDate;
      this.postgre_session_input.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.postgre_session_input.EndDate, this.postgre_session_input.EndDate);
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
          this.sessionDetails.FreeSesionIntermsOfMonth = result[0].description[0] + result[0].description[1];
        } else {
          this.sessionDetails.FreeSesionIntermsOfMonth = "0";
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
          this.sessionDetails.NoOfMonthMustPay = result[0].description[0] + result[0].description[1];
        } else {
          this.sessionDetails.NoOfMonthMustPay = "0";
        }
        // this.monthlySessionObj.NoOfMonthMustPay = result[0].description;
      },
      err => console.log('Error: ', err)
    );
  }








}
