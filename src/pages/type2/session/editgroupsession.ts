//not changed

import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { UpdateTermSessionModel } from './model/session.model';
import gql from "graphql-tag";
import { SessionDets } from './model/session_details.model';
import { GraphqlService } from '../../../services/graphql.service';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../shared/model/club.model';
import { FinancialYearTerms } from '../../../shared/model/financial_terms.model';
@IonicPage()
@Component({
  selector: 'editgroupsession-page',
  templateUrl: 'editgroupsession.html'
})

export class Type2EditGroupSession {
  LangObj: any = {};//by vinod
  postgre_session_input:UpdateTermSessionModel;
  updated_by:string = "";
  ParentClubName:string = "";
  Status:Array<any>=[
    {StatusCode:1,StatusText:"Public"},
    {StatusCode:0,StatusText:"Hide"}
  ];
  attendanceObj = {
    StartDate: '',
    EndDate: '',
    AttendanceStatus: '',
    CanceledReason: '',
    AttendanceOn: new Date().getTime(),
    Comments: ""
  }
  editsessionDetails: SessionDets;
  themeType: number;
  paymentOptions = [{ Key: 100, Value: "Term" }, { Key: 101, Value: "Monthly" }, { Key: 102, Value: "Weekly" }, { Key: 103, Value: "Per Session" }, { Key: 104, Value: "Installment" }];
  selectedClubKey = "";
  clubs:IClubDetails[] = [];
  terms:FinancialYearTerms[] = [];
  club_activities:Activity[] = [];
  activityCategoryList:ActivityCategory[] = [];
  activitySubCategoryList:ActivitySubCategory[] = [];
  types:any = [];
  parentClubKey = "";
  selectedTermKey = "";
  isExistActivityCategory:boolean = false;
  isExistActivitySubCategory:boolean = false
  selectActivityCategoryKey: string ;
  selectActivitySubCategoryKey:string;
  selectedActivityTypeKey:string = "";

  isHalfTermAvail: boolean = false;
  HalfTermStartDate: any;
  HalfTermEndDate: any;
  DisableHalfTerm: boolean = false;
  weeksfromcreate:number = 0;

  sessionDetails = {
    IsActive: true,
    TermKey: '',
    SessionName: 'Session',
    StartDate: '',
    EndDate: '',
    StartTime: '',
    Duration: '60',
    Days: '',
    GroupSize: '10',
    IsTerm: false,
    Comments: '',
    CoachKey: '',
    ClubKey: '',
    GroupStatus:1,
    ParentClubKey: '',
    SessionFee: '7',
    CoachName: '',
    SessionType: '',
    ActivityKey: '',
    ActivityCategoryKey: '',
    FinancialYearKey: '',
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: '',
    IsExistActivityCategory: false,
    PayByDate: '',
    HalfTerm: false,
    IsAllowPayLater:false,
    //Additional properties
    SessionFeeForNonMember: '7.00',
    NoOfWeeks: 0,
    FeesPerDayForMember: '8.00',
    FeesPerDayForNonMember: '8.00',
    PaymentOption: 100,
    IsAllMembertoEditAmendsFees: true,
    IsAllowGroupChat:false,
    ShowInAPKids:true,
    MemberVisibility:0,
    IsLoyaltyAllowed:false,
    IsFixedLoyaltyAllowed:false,
    FixedLoyaltyPoints:"0.00",
    AllowChildCare:false,
    AllowWaitingList:false
  }
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  days = [];
  selectedCoachKey = "";
  coachs = [];


  maxDate: any = "";
  minDate:any = "";
  constructor(public events: Events, 
      public commonService: CommonService,  
      public alertCtrl: AlertController,
      public navParams: NavParams, public storage: Storage, 
      public fb: FirebaseService, 
      public navCtrl: NavController, 
      public sharedservice: SharedServices,
      public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService,
      
      ) {
    //calculate after 10 years
    this.minDate = this.commonService.getTodaysDate();
    this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
    this.themeType = sharedservice.getThemeType();
    this.postgre_session_input = UpdateTermSessionModel.getTermSessionForEdit(<SessionDets>this.navParams.get("SessionDetails"))
    this.editsessionDetails = navParams.get('SessionDetails');
    this.selectedClubKey = this.postgre_session_input.session_firebase_fields.club_id;
    this.selectedTermKey = this.editsessionDetails.term_key;
    this.parentClubKey = this.postgre_session_input.session_firebase_fields.parentclub_id;
    this.selectActivityCategoryKey = this.editsessionDetails.firebase_activity_categorykey;
    
    this.selectedActivityTypeKey = this.postgre_session_input.session_firebase_fields.activity_id;
    this.sessionDetails.HalfTerm = this.editsessionDetails.halfterm ? this.editsessionDetails.halfterm : false;
    this.isExistActivityCategory = this.selectActivityCategoryKey && this.selectActivityCategoryKey!='' ? true:false;
    this.selectActivitySubCategoryKey = this.editsessionDetails.firebase_activity_subcategorykey;
    this.isExistActivitySubCategory = this.selectActivitySubCategoryKey && this.selectActivitySubCategoryKey!='' ? true : false;
    this.getClubList();
    this.getTerms();
    this.getCoachListAccordingToActivity();
    this.getActivityCategoryList(); 
    this.getActivitySubCategoryList();
    this.selectedCoachKey = this.editsessionDetails.CoachDetails[0].coach_firebase_id;
    //****************************************** */
    //   Keeping the session details, which object we have sent from session listing page
    //   



    //****************************************** */
    //   Separating the selected days and binding with the days circle
    //   

    let x = this.postgre_session_input.Days.split(",");
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

  //****************************************** */
  //   Popover showing logout 
  //
  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.updated_by = val.$key;
      }
    })
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

  //****************************************** */
  //   Go to dashboard menu page by clicking  
  //
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  //****************************************** */
  //   Get the Club details for showing in the dropdown menu 
  //   Not allowing to change the club from drop down menu, it's just a readonly field

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
            console.log("clubs lists:", JSON.stringify(this.clubs));
        },
       (error) => {
            // this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       })    
  }

  //****************************************** */
  //   Get the activitylist and term list from the created data 
  //   These data are readonly fields user only can view


  getTerms() {
    // if (this.editsessionDetails["Term"] != undefined) {
    //   this.terms = this.commonService.convertFbObjectToArray(this.editsessionDetails["Term"]);
    //   this.checkHalfTermAvailability();
    // }
    // if (this.editsessionDetails["Activity"] != undefined) {
    //   this.types = this.commonService.convertFbObjectToArray(this.editsessionDetails["Activity"]);
    //   if (this.types[0].IsExistActivityCategory) {
    //     this.isExistActivityCategory = true;
    //     this.activityCategoryList = this.commonService.convertFbObjectToArray(this.types[0].ActivityCategory).filter(cat => cat.IsActive);
    //     this.selectActivityCategoryKey = this.activityCategoryList[0].Key;
    //     if (this.activityCategoryList[0].IsExistActivitySubCategory) {
    //       this.isExistActivitySubCategory = true;
    //       this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryList[0].ActivitySubCategory).filter(cat => cat.IsActive);
    //       this.selectActivitySubCategoryKey = this.activitySubCategoryList[0].Key ||"";
    //     }
    //   }
    // }
    this.terms = [];
    const termsInput = {
      firebase_fields:{
          parentclub_id:this.parentClubKey,
          club_id:this.selectedClubKey,
      },
      AppType:0, //0-Admin
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }
  const financial_terms_query = gql`
  query getParentClubFianancialTerms($termsInput: FinancialTermsInput!){
      getParentClubFianancialTerms(financialTermsInput:$termsInput){
          term_id
          financial_year_id
          is_for_all_activity
          term_name
          term_start_date
          term_end_date
          term_payby_date
          halfterm_start_date
          halfterm_end_date
          activities
      }
  }
  `;
    this.graphqlService.query(financial_terms_query,{termsInput: termsInput},0)
      .subscribe((res: any) => {
          //this.getFinancialYearList();
          this.terms = res.data.getParentClubFianancialTerms as FinancialYearTerms[];
          const term_ind = this.terms.findIndex(term => term.term_id === this.selectedTermKey);
          console.log("terms lists:", JSON.stringify(this.terms));
          if(this.terms.length > 0){
            this.getActivityList(term_ind);
          }else{
              this.commonService.toastMessage("No active terms found",2500,ToastMessageType.Error);
          }    
          this.checkHalfTermAvailability();
          //this.isTermsEmpty = this.terms.length > 0 ? false : true;
      },
     (error) => {
          // this.commonService.hideLoader();
          console.error("Error in fetching:", error);
         //Handle the error here, you can display an error message or take appropriate action.
     })    
  }

getActivityList(term_ind:number){
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
        PriceSetup{
          IsActive
          MemberPricePerHour
          NonMemberPricePerHour
        }
      }
    }
    `;
    this.graphqlService.query(clubs_activity_query,{input_obj:club_activity_input},0)
      .subscribe((res: any) => {
        if(res.data.getAllActivityByVenue.length > 0){
          
          for (let index = 0; index < res.data.getAllActivityByVenue.length; index++) {
            for (let count = 0; count < this.terms[term_ind].activities.length; count++) {
                if (this.terms[term_ind].activities[count] == res.data.getAllActivityByVenue[index].ActivityKey) {
                    this.club_activities.push(res.data.getAllActivityByVenue[index]);
                    break;
                }
            }
         }
         
         if(this.club_activities.length > 0){
            if (this.sessionDetails.HalfTerm) {
              let HalfTermWeeks = this.commonService.calculateWeksBetweenDates(this.HalfTermStartDate, this.HalfTermEndDate);
              this.sessionDetails.NoOfWeeks = this.sessionDetails.NoOfWeeks - HalfTermWeeks;
            }                  
            //this.calculateTotFee();
         }
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

  checkHalfTermAvailability() {
    let termIndex = this.terms.findIndex(term => term.term_id === this.selectedTermKey);
    if (termIndex != -1) {
      if ((this.terms[termIndex].halfterm_start_date != undefined && this.terms[termIndex].halfterm_start_date != "") && (this.terms[termIndex].halfterm_end_date != undefined && this.terms[termIndex].halfterm_end_date != "")) {
        this.isHalfTermAvail = true;
        this.DisableHalfTerm = this.sessionDetails.HalfTerm ? this.sessionDetails.HalfTerm : false;// if it's already there disable halfterm toggle
        this.HalfTermStartDate = this.terms[termIndex].halfterm_start_date;
        this.HalfTermEndDate = this.terms[termIndex].halfterm_end_date;
      }
    }
  }

  dateChanged() {
    if (this.validateSessionDate()) {
      this.postgre_session_input.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.postgre_session_input.StartDate, this.postgre_session_input.EndDate);

      this.inputChanged();
    } else {
      this.postgre_session_input.StartDate = this.postgre_session_input.EndDate;
      this.postgre_session_input.EndDate = this.postgre_session_input.EndDate;
      this.postgre_session_input.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.postgre_session_input.StartDate, this.postgre_session_input.EndDate);
      this.inputChanged();
    }
  }

  validateSessionDate() {
    if (new Date(this.postgre_session_input.StartDate).getTime() > new Date(this.postgre_session_input.EndDate).getTime()) {
      this.commonService.toastMessage("Session start date should be greater than end date.", 2500,ToastMessageType.Error);
      return false;
    }
    return true;
  }

  inputChanged() {
    this.calculateTotFee();
  }

  calculateTotFee() { 
    //as per shubhankar suggested we have removed auto calculating the session prcies when there's a change in start&end dates
    const activityIndex = this.club_activities.findIndex(activity => activity.ActivityKey === this.selectedActivityTypeKey);
    if (activityIndex != -1) {
      if (this.club_activities[activityIndex].PriceSetup != undefined && this.club_activities[activityIndex].PriceSetup.MemberPricePerHour != '' && this.club_activities[activityIndex].PriceSetup.NonMemberPricePerHour != '') {
        //calculate member and non-memberprice bases on priceSetUp
        //Note:PriceSetup default fee is hour basis
        const defaultMins: number = 60;
        let FeesPerDayForMember: any = (parseFloat(this.postgre_session_input.Duration) * parseFloat(this.types[activityIndex].PriceSetup.MemberPricePerHour) / defaultMins);
        let FeesPerDayForNonMember: any = (parseFloat(this.postgre_session_input.Duration) * parseFloat(this.types[activityIndex].PriceSetup.NonMemberPricePerHour) / defaultMins);
        this.postgre_session_input.SessionFee = FeesPerDayForMember;
        this.postgre_session_input.SessionFeeForNonMember = FeesPerDayForNonMember;
        this.postgre_session_input.SessionFee = parseFloat((this.postgre_session_input.NoOfWeeks * this.postgre_session_input.SessionFee).toFixed(2));
        this.postgre_session_input.SessionFeeForNonMember = parseFloat((this.sessionDetails.NoOfWeeks * this.postgre_session_input.SessionFeeForNonMember).toFixed(2));
      } 
      else {
        // this.postgre_session_input.SessionFee = parseFloat("0.00");
        // this.postgre_session_input.SessionFeeForNonMember = parseFloat("0.00");
        // this.postgre_session_input.SessionFee = parseFloat((this.postgre_session_input.NoOfWeeks * this.postgre_session_input.SessionFee).toFixed(2));
        // this.postgre_session_input.SessionFeeForNonMember = parseFloat((this.postgre_session_input.NoOfWeeks * this.postgre_session_input.SessionFeeForNonMember).toFixed(2));
      }
    }
  }

  //****************************************** */
  //  Showing the Coach list activity wise i.e if there is tennis activity selected
  //  we need to show the coaches who are giving coaching for tennis 
  //  we need to show the unique coach across the venues
  //  Brought the data from activity table

  getCoachListAccordingToActivity() {
    console.clear();
    // const coach_activity$Obs = this.fb.getAllWithQuery("/Activity/" + this.editsessionDetails.ParentClubKey, { orderByKey: true }).subscribe((data) => {
    //   coach_activity$Obs.unsubscribe();
    //   let activityArray = [];
    //   this.coachs = [];
    //   for (let i = 0; i < data.length; i++) {
    //     activityArray = this.commonService.convertFbObjectToArray(data[i]);
    //     console.log(activityArray);
    //     for (let j = 0; j < activityArray.length; j++) {
    //       if (activityArray[j].Key == this.selectedActivityTypeKey) {
    //         let coachList = this.commonService.convertFbObjectToArray(activityArray[j].Coach);
    //         for (let k = 0; k < coachList.length; k++) {
    //           let isPresent = false;
    //           for (let l = 0; l < this.coachs.length; l++) {
    //             if (this.coachs[l].Key == coachList[k].Key) {
    //               isPresent = true;
    //               break
    //             }
    //           }
    //           if (!isPresent && coachList[k].IsActive) {
    //             this.coachs.push(coachList[k]);
    //           }
    //         }
    //         break;
    //       }

    //     }
    //   }
    // });

    this.coachs = [];
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
          }else{
            this.commonService.toastMessage("no coachs found",2500,ToastMessageType.Error)
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
      })
  }

  getActivityCategoryList() {
    this.activityCategoryList = [];
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
            this.isExistActivityCategory = true;
            //this.selectActivityCategoryKey = this.editsessionDetails.firebase_activity_categorykey;
            //this.getActivitySubCategoryList();
          }else{
            this.commonService.toastMessage("no categories found",2500,ToastMessageType.Error)
          }
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       })

  }

  onChangeActivityCategory(){
    this.getActivitySubCategoryList();
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
            // this.isExistActivitySubCategory = true;
            // if(!this.selectActivitySubCategoryKey){ //first time
            //   this.selectActivitySubCategoryKey = this.editsessionDetails.firebase_activity_subcategorykey;
            // }else{
            //   this.selectActivitySubCategoryKey = this.activitySubCategoryList[0].ActivitySubCategoryId;
            // }
            // this.isExistActivitySubCategory = this.selectActivitySubCategoryKey && this.selectActivitySubCategoryKey!='' ? true : false;
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


  CheckLoyaltyType(){
    setTimeout(()=>{
      console.log(this.sessionDetails.IsFixedLoyaltyAllowed);
      if(this.sessionDetails.IsFixedLoyaltyAllowed){
        const wallet$Obs = this.fb.getAllWithQuery(`StandardCode/Wallet/LoyaltyPoint/${this.sessionDetails.ParentClubKey}/${this.sessionDetails.ClubKey}/Reward/${this.sessionDetails.ActivityKey}`,{ orderByKey: true, equalTo: "TermGroupSession" }).subscribe((data) => {
          wallet$Obs.unsubscribe();
          if(data.length > 0 && data[0].IsActive){
            this.sessionDetails.FixedLoyaltyPoints = "0.00";
            this.sessionDetails.FixedLoyaltyPoints = (parseFloat(data[0].StandardPoint) * parseFloat(this.sessionDetails.SessionFee)).toFixed(2);
          }
        });
      }else{
        this.sessionDetails.FixedLoyaltyPoints = "0.00";
      }
    },200);
  }

  showChatTermsAlert(){
    setTimeout(()=>{
      console.log(this.sessionDetails.IsAllowGroupChat);
      if(this.sessionDetails.IsAllowGroupChat){
        let alert = this.alertCtrl.create({
          title: 'Enable Chat',
          message: `${this.ParentClubName} is fully responsible for the content of the chat among the chat users. ActivityPro is not liable for any misuse of the chat facility as a platform provider`,
          buttons: [
            {
              text: "Agree: Enable Chat",
              handler: () => {}
            },
            {
              text: 'No: Disable Chat',
              role: 'cancel',
              handler: data => {
                this.sessionDetails.IsAllowGroupChat = !this.sessionDetails.IsAllowGroupChat;
              }
            }
          ]
        });
        alert.present();
      }
    },100)
  }


  //checking ispaid when sessin is trial
  CheckIsHalfTerm() {
    setTimeout(() => {
      if (this.sessionDetails.HalfTerm) {
        let HalfTermWeeks = this.commonService.calculateWeksBetweenDates(this.HalfTermStartDate, this.HalfTermEndDate);
        this.sessionDetails.NoOfWeeks = this.sessionDetails.NoOfWeeks - HalfTermWeeks;
        //console.log(`${this.sessionDetails.HalfTerm}::${HalfTermWeeks}::${this.sessionDetails.NoOfWeeks}`);
        this.calculateTotFee();
      } else {
        //this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.sessionDetails.StartDate, this.sessionDetails.EndDate);
        this.sessionDetails.NoOfWeeks = this.weeksfromcreate;
        this.calculateTotFee();
      }
    }, 200);
  }

  //****************************************** */
  //   this is used as toggole, if user will click on circle button will select or deselect the 
  //   days


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


  //****************************************** */
  //  When user will click on cancel buttton will show a prompt, whether user really wants to 
  //  exit i.e cancel or not
  //  If YES go back to listing window Else stay on the page rather popping up from current page

  cancelSessionCreation() {
    let confirm = this.alertCtrl.create({
      title: "Session Creation",
      message: 'Are you sure you want to exit? ',
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

  



  //****************************************** */
  //  Before saving in to the database we need to validate our field
  //  Because there must not be any field undefined otherwise will give an error
  //

  validationForGroupSessionCreation() {
    if (this.selectedClubKey == "" || this.selectedClubKey == undefined) {
      let message = "Please select a venue.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
      // alert(message);
    }
    else if (this.selectedTermKey == "" || this.selectedTermKey == undefined) {
      let message = "Please select term for the session.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedActivityTypeKey == "" || this.selectedActivityTypeKey == undefined) {
      let message = "Please select an activity for the session creation.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedCoachKey == "" || this.selectedCoachKey == undefined) {
      let message = "Please select a coach for the session creation.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.postgre_session_input.SessionName == "" || this.postgre_session_input.SessionName == undefined) {
      let message = "Please enter session name.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.isExistActivitySubCategory && !this.selectActivitySubCategoryKey) {
      let message = "Please choose subcategory.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.postgre_session_input.StartDate == "" || this.postgre_session_input.StartDate == undefined) {
      let message = "Please choose session start date.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.postgre_session_input.EndDate == "" || this.postgre_session_input.EndDate == undefined) {
      let message = "Please choose session end date.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.postgre_session_input.StartTime == "" || this.postgre_session_input.StartTime == undefined) {
      let message = "Please choose session start time.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.postgre_session_input.Duration == "" || this.postgre_session_input.Duration == undefined) {
      let message = "Enter Session Duration in minutes.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.postgre_session_input.GroupSize == 0 || this.postgre_session_input.GroupSize == undefined) {
      let message = "Enter group size for the session.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    // else if (this.postgre_session_input.SessionFee <= 0 || this.postgre_session_input.SessionFee == undefined) {
    //   let message = "Enter member session fee.";
    //   this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
    //   return false;
    // }
    // else if (this.postgre_session_input.SessionFeeForNonMember <= 0 || this.postgre_session_input.SessionFeeForNonMember == undefined) {
    //   let message = "Enter member session fee.";
    //   this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
    //   return false;
    // }

    else if (this.postgre_session_input.NoOfWeeks == 0 || this.postgre_session_input.NoOfWeeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }

  }


  

  //****************************************** */
  // days separation and reinitializing with the selected days


  selectedDayDetails(day) {
    if (this.postgre_session_input.Days == "") {
      this.postgre_session_input.Days += day;
    }
    else {
      this.postgre_session_input.Days += "," + day;
    }
  }


  //****************************************** */
  // Session updations 

  initializingSession() {
    
    this.postgre_session_input.Days = "";
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      this.days.sort();
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


    

  }



  editGroupSizeConfirmation(){
    const prompt = this.alertCtrl.create({
      title: 'Group Size',
      message: "Enter revised capacity",
      inputs: [
        {
          type: 'number',
          name: 'session_capacity',
          placeholder: 'group size',
          value:this.postgre_session_input.GroupSize.toString(),
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {}
        },
        {
          text: 'Update',
          handler: data => {
              if(data.session_capacity > 0 && data.session_capacity!=''){
                  this.updateSessionGroupSize(data.session_capacity);
              }else{
                  this.commonService.toastMessage("Please enter valid group size", 2500, ToastMessageType.Error);
              }
          }
        }
      ]
    });
    prompt.present();
  }


  updateSessionGroupSize(new_capacity:number){
    const group_size_mutation = gql`
    mutation updateSessionCapacity($groupSizeInput: CapacityUpdateInput!) {
      updateSessionCapacity(capacity_update: $groupSizeInput){
        updated_capacity
        updated_capacity_left
      }
    }` 
    
    const groupSizeInput = {
      session_id:this.editsessionDetails.id,
      group_size:Number(new_capacity),
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
    }
    const group_size_mutation_variable = { groupSizeInput: groupSizeInput };
    this.graphqlService.mutate(
      group_size_mutation, 
      group_size_mutation_variable,
      0
    ).subscribe((res)=>{
      const message = "Group size updated successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
      this.postgre_session_input.GroupSize = res.data.updateSessionCapacity.updated_capacity;
      this.commonService.updateCategory("update_session_list");
      //this.reinitializeSession();
    },(err)=>{
      this.commonService.toastMessage("Group size updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    });    
  }

  updateSession() {
    this.initializingSession();
      let confirm = this.alertCtrl.create({
        title: "Session Edit",
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
              if(this.validationForGroupSessionCreation()) {
                this.postgre_session_update();
              }
            }
          }
        ]
      });
      confirm.present();
  }


  //updating the session in postgre
  async postgre_session_update(){
    //this.postgre_session_input.Firebase_SessionKey = this.editsessionDetails.$key;
    this.postgre_session_input.ActivityCategory = this.selectActivityCategoryKey;
    this.postgre_session_input.ActivitySubCategory = this.selectActivitySubCategoryKey;
    this.postgre_session_input.ActivityCategoryName = this.activityCategoryList.filter(category => category.ActivityCategoryId === this.selectActivityCategoryKey)[0].ActivityCategoryName;
    this.postgre_session_input.ActivitySubCategoryName = this.activitySubCategoryList.filter(category => category.ActivitySubCategoryId === this.selectActivitySubCategoryKey)[0].ActivitySubCategoryName;
    this.postgre_session_input.updated_by = this.sharedservice.getLoggedInId();
    this.postgre_session_input.user_postgre_metadata.UserMemberId = this.sharedservice.getLoggedInId();
    this.postgre_session_input.user_device_metadata.UserAppType = 0;
    this.postgre_session_input.GroupStatus = Number(this.postgre_session_input.GroupStatus);
    this.postgre_session_input.FixedLoyaltyPoints = this.postgre_session_input.FixedLoyaltyPoints.toString();
    this.postgre_session_input.SessionFee = Number(this.postgre_session_input.SessionFee);
    this.postgre_session_input.SessionFeeForNonMember = Number(this.postgre_session_input.SessionFeeForNonMember);
    this.postgre_session_input.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1:2;
    this.postgre_session_input.session_postgre_fields.module_id = this.editsessionDetails.id;
    this.postgre_session_input.session_firebase_fields.coach_ids = [this.selectedActivityTypeKey];
    this.postgre_session_input.session_postgre_fields.coach_ids = await this.getCoachIdsByFirebaseKeys([this.selectedCoachKey]);
    this.postgre_session_input.GroupSize  = Number(this.postgre_session_input.GroupSize);
    this.postgre_session_input.NoOfWeeks  = Number(this.postgre_session_input.NoOfWeeks);
    console.log(this.postgre_session_input);
    //return false;
    const term_ses_mutation = gql`
        mutation updateSession($sessionInput: UpdateSessionInput!) {
          updateSession(sessionInput: $sessionInput){
                id
                firebase_activitykey
                firebase_activity_subcategorykey
                session_name
                start_date
            }
        }` 
        
        const term_ses_mutation_variable = { sessionInput: this.postgre_session_input };
        this.graphqlService.mutate(
          term_ses_mutation, 
          term_ses_mutation_variable,
          0
        ).subscribe((response)=>{
          const message = "Session updated successfully";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.pop();
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


  alertInfo(){
    let confirm = this.alertCtrl.create({
    title:  "Validate Updated Information",
    message: 'Please revalidate all the information of the session including session price for all enrolled member/non-member',
    buttons: [
      {
        text: 'Ok',
        role: 'cancel',
        handler: () => {
          // this.commonService.updateCategory("sessions");
          //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
          this.navCtrl.pop();
        }
      }]
  });
    confirm.present();
  }



}
