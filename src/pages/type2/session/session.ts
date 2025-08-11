import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Navbar, AlertController, LoadingController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { WheelSelector } from '@ionic-native/wheel-selector';
import gql from "graphql-tag";
import { CreateTermSessionModel } from './model/session.model';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../shared/model/club.model';
import { GraphqlService } from '../../../services/graphql.service';
import { FinancialYearTerms } from '../../../shared/model/financial_terms.model';

@IonicPage()
@Component({
  selector: 'session-page',
  templateUrl: 'session.html'
})

export class Type2Session {
  @ViewChild(Navbar) navBar: Navbar;
  Status:Array<any>=[
    {StatusCode:1,StatusText:"Public"},
    {StatusCode:0,StatusText:"Hide"}
  ];
  LangObj: any = {};//by vinod
  ParentClubName:string = "";
  attendanceObj = {
    StartDate: '',
    EndDate: '',
    AttendanceStatus: '',
    CanceledReason: '',
    AttendanceOn: new Date().getTime(),
    Comments: ""
  }
  isTermsEmpty: boolean = false;
  parentClubKey: any;
  themeType: number;
  venue: string = "s";
  term: string = "t1";
  activitytype: string = "a1";
  coach: string = "a";
  ageGroup = {
    initialSlide: 0,
    loop: true
    //pager: true
  };
  category = {
    initialSlide: 0,
    loop: true
  };
  startTime: any = 10;
  duration: any = 2;
  musicAlertOpts: { title: string, subTitle: string };
  days = [];
  ////variables 
  selectedClub: string = "";
  types = [];
  selectedActivityType:string = "";
  clubs: IClubDetails[] = [];
  terms:FinancialYearTerms[] = [];
  activitySubCategoryList:ActivitySubCategory[] = [];
  activityCategoryList:ActivityCategory[] = [];
  club_activities:Activity[] = [];
  coachs:ActivityCoach[] = [];
  financialYears: string[] = [];
  currentFinancialYear: string = "";
  selectedTerm: string = "";
  selectedCoach: string = "";
  selectedCoachName: string = "";
  isHalfTermAvail: boolean = false;
  HalfTermStartDate: any;
  HalfTermEndDate: any;
  sessionDetails = {
    IsActive: true,
    SessionName: '',
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
    GroupCategory: "Term",
    ParentClubKey: '',
    //Total fees for member
    SessionFee: '',
    CoachName: '',
    SessionType: '',
    ActivityKey: '',
    GroupStatus:1,
    ActivityCategoryKey: '',
    TermKey: '',
    FinancialYearKey: '',
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: '',
    IsExistActivityCategory: false,
    PayByDate: '',
    //Additional properties
    //Total fees for non-member
    HalfTerm: false,
    IsAllowPayLater:false,
    SessionFeeForNonMember: '',
    NoOfWeeks: 0,
    FeesPerDayForMember: '8.00',
    FeesPerDayForNonMember: '8.00',
    PaymentOption: 100,
    // IsAllMembertoEditFees: true,
    IsAllMembertoEditAmendsFees: true,
    IsAllowGroupChat:false,
    ShowInAPKids:true,
    MemberVisibility:true,
    IsLoyaltyAllowed:false,
    IsFixedLoyaltyAllowed:false,
    FixedLoyaltyPoints:"0.00",
    AllowChildCare:false,
    AllowWaitingList:false,
    CreatedDate:new Date().getTime(),
    UpdatedDate:new Date().getTime()
  };
  postgre_session_input:CreateTermSessionModel;
  updated_by:string = "";
  installmentSessionObj = {
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
    //Total fees for member
    SessionFee: '',
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
    PaymentOption: 104,
    //IsAllMembertoEditFees: true,
    IsAllMembertoEditAmendsFees: true,
    FullInstallmentAmountForMember: "0.00",
    FullInstallmentAmountForNonMember: "0.00",
    NoOfInstallment: 4,
    InstallmentAmountForMember: '100.00',
    InstallmentAmountForNonMember: '100.00',
  }

  isActivityCategoryExist:boolean;
  isExistActivitySubCategory: boolean;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  acType: any;
  activityCategoryObj: any;
  selectActivityCategory: string;
  selectActivitySubCategory:string;
  selectedCoachObj = {};
  returnKey: any;
  sessionName: any;
  
  activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
  
  termForSession = { TermComments: '', TermEndDate: '', TermName: '', HalfTermStartDate: '', HalfTermEndDate: '', TermNoOfWeeks: '', TermPayByDate: '', IsActive: true, TermStartDate: '', isForAllActivity: false };
  financialYearKey: "";
  loading: any;
  maxDate = "";
  minDate = "";
  PriceSetup: any;
  
  // { Key: 101, Value: "Monthly" },
  //Additional Fields
  paymentOptions = [
    { Key: 100, Value: "Term" },
    { Key: 102, Value: "Weekly" },
    { Key: 103, Value: "Per Session" },
    { Key: 104, Value: "Installment" },
  ];

  currencyDetails: any;

  minuteValues = "00";
  jsonDataForWheelSelector = {
    freeSessions: [
      { description: "None" },
      { description: "01 week" },
      { description: "02 weeks" },
      { description: "03 weeks" },
      { description: "01 month" },
      { description: "02 months" },
      { description: "03 months" }

    ]
  };
  ActivityCategoryName:string;
  ActivitySubCategoryName:string;

  constructor(public events: Events, private selector: WheelSelector, 
      public commonService: CommonService, 
      public loadingCtrl: LoadingController, 
      public alertCtrl: AlertController, 
      public navParams: NavParams, public storage: Storage, 
      public fb: FirebaseService, public navCtrl: NavController, 
      public sharedservice: SharedServices, 
      public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService,
     ) {
    let temp = "";
    for (let i = 1; i < 60; i++) {
      if (i % 5 == 0) {
        this.minuteValues += "," + i;
      }
    }

    this.themeType = sharedservice.getThemeType();
    this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
    this.minDate = this.commonService.getTodaysDate();
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });

    this.sessionName = navParams.get('sessionName');
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.updated_by = val.$key;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getClubList();
      }
    })
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
    //when you clicked on device button
    this.navBar.backButtonClick = (e: UIEvent) => {
      console.log("todo something");
      this.checkIsFormFilled();
    }
  }

  checkIsFormFilled() {
    if ((this.sessionDetails.SessionName != "" && this.sessionDetails.SessionName != undefined) || this.days.length > 0) {
      this.promptAlert();
    } else {
      this.navCtrl.pop();
    }
  }

  CheckLoyaltyType(){
    setTimeout(()=>{
      //console.log(this.sessionDetails.IsFixedLoyaltyAllowed);
      if(this.sessionDetails.IsFixedLoyaltyAllowed){
        this.fb.getAllWithQuery(`StandardCode/Wallet/LoyaltyPoint/${this.parentClubKey}/${this.selectedClub}/Reward/${this.selectedActivityType}`,{ orderByKey: true, equalTo: "TermGroupSession" }).subscribe((data) => {
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

  //DONE
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
                  //this.getTermList();
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

  // onChangeOfClub method calls when we changing venue
  //Done
  onChangeOfClub() {
    // this.selectedTerm = "";
    // this.selectedActivityType = "";
    // this.selectedCoach = "";
    // this.selectActivityCategory = "";

    this.terms = [];
    this.types = [];
    this.coachs = [];
  
    // this.isOnchangeTerm = false;
    
    this.club_activities = [];
    this.activityCategoryList = [];
    this.activitySubCategoryList = [];
    // this.getFinancialYearList();
    this.getTermList();
  }

  
  getTermList() {
    this.terms = [];
    const termsInput = {
      firebase_fields:{
          parentclub_id:this.parentClubKey,
          club_id:this.selectedClub,
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
          console.log("terms lists:", JSON.stringify(this.terms));
          if(this.terms.length > 0){
              // this.selectedTerm = this.terms[0].term_id;
              // this.sessionDetails.TermKey = this.terms[0].term_id;
              // this.sessionDetails.IsTerm = true;
              // this.termForSession.isForAllActivity = this.terms[0].is_for_all_activity;
              // this.termForSession.TermComments = this.terms[0].term_comments;
              // this.termForSession.TermEndDate = this.terms[0].term_end_date;
              // this.termForSession.TermName = this.terms[0].term_name;
              // this.termForSession.TermNoOfWeeks = this.terms[0].term_weeks;
              // this.termForSession.TermPayByDate = this.terms[0].term_payby_date;
              // this.termForSession.TermStartDate = this.terms[0].term_start_date;
              // this.sessionDetails.StartDate = this.termForSession.TermStartDate;
              // this.sessionDetails.EndDate = this.termForSession.TermEndDate;
              // this.sessionDetails.PayByDate = this.termForSession.TermPayByDate;
              // this.sessionDetails.FinancialYearKey = this.terms[0].financial_year_id;
              // this.sessionDetails.Comments = this.terms[0].term_comments || "";
              // this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.sessionDetails.StartDate, this.sessionDetails.EndDate);
              // this.checkHalfTermAvailability();
              // this.getActivityList(0);
              this.getTermDetails(this.terms[0],0)
          }else{
              this.commonService.toastMessage("No active terms found",2500,ToastMessageType.Error);
          }    
          this.checkHalfTermAvailability();
          this.isTermsEmpty = this.terms.length > 0 ? false : true;
      },
     (error) => {
          // this.commonService.hideLoader();
          console.error("Error in fetching:", error);
         //Handle the error here, you can display an error message or take appropriate action.
     })        

  }

  checkHalfTermAvailability() {
    let termIndex = this.terms.findIndex(term => term.term_id === this.selectedTerm);
    if (termIndex != -1) {
      if ((this.terms[termIndex].halfterm_start_date != undefined && this.terms[termIndex].halfterm_start_date != "") && (this.terms[termIndex].halfterm_end_date != undefined && this.terms[termIndex].halfterm_end_date != "")) {
        this.sessionDetails.HalfTerm = true //making half to true if half start&end date availabe
        this.isHalfTermAvail = true;
        this.HalfTermStartDate = this.terms[termIndex].halfterm_start_date;
        this.HalfTermEndDate = this.terms[termIndex].halfterm_end_date;
        this.termForSession.HalfTermStartDate = this.terms[termIndex].halfterm_start_date;
        this.termForSession.HalfTermEndDate = this.terms[termIndex].halfterm_end_date;
        // let HalfTermWeeks = this.commonService.calculateWeksBetweenDates(this.HalfTermStartDate, this.HalfTermEndDate);
        // this.sessionDetails.NoOfWeeks = this.sessionDetails.NoOfWeeks - HalfTermWeeks;
      } else {
        this.sessionDetails.HalfTerm = false;
        this.isHalfTermAvail = false;
      }
    } else {
      this.sessionDetails.HalfTerm = false;
      this.isHalfTermAvail = false;
    }
  }

  //custom component for payment setup redirect
  GotoPaymentSetup() {
    this.isTermsEmpty = false;
    this.navCtrl.push("Type2Term");
  }

  skip() {
    this.isTermsEmpty = false;
  }

  getTermDetails(term:FinancialYearTerms,term_inex:number,status:boolean = false){
    this.selectedTerm = term.term_id;
    this.sessionDetails.TermKey = term.term_id;
    this.sessionDetails.IsTerm = true;
    this.termForSession.isForAllActivity = term.is_for_all_activity;
    this.termForSession.TermComments = term.term_comments;
    this.termForSession.TermEndDate = term.term_end_date;
    this.termForSession.TermName = term.term_name;
    this.termForSession.TermNoOfWeeks = term.term_weeks;
    this.termForSession.TermPayByDate = term.term_payby_date;
    this.termForSession.TermStartDate = term.term_start_date;
    this.sessionDetails.StartDate = term.term_start_date;
    this.sessionDetails.EndDate = term.term_end_date;
    this.sessionDetails.PayByDate = term.term_payby_date;
    this.sessionDetails.FinancialYearKey = term.financial_year_id;
    this.sessionDetails.Comments = term.term_comments || "";
    this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(term.term_start_date, term.term_end_date);
    this.checkHalfTermAvailability();
    if(status){
      this.getActivityList(term_inex); 
    }
                 
  }
  
  ///on change of term
  isOnchangeTerm:boolean = false;
  onChangeOfTerm() {
    this.isOnchangeTerm = false;
    let selectedIndex = 0;
    for (let i = 0; i < this.terms.length; i++) {
      if (this.terms[i].term_id == this.selectedTerm) {
        this.sessionDetails.Comments = this.terms[i].term_comments;
        selectedIndex = i;
        break;
      }
    }
    
    if (this.terms.length > 0 && this.terms[selectedIndex].activities.length > 0) {
      this.getTermDetails(this.terms[selectedIndex],selectedIndex,true)
      // let initialTermActivity = this.commonService.convertFbObjectToArray(this.terms[selectedIndex].Activity);
      // const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      //   activity$Obs.unsubscribe();
      //   this.acType = data;
      //   this.types = [];
      //   if (data.length > 0) {
      //     for (let index = 0; index < this.acType.length; index++) {
      //       for (let count = 0; count < initialTermActivity.length; count++) {
      //         if (initialTermActivity[count].Key == this.acType[index].$key) {
      //           this.types.push(this.acType[index]);
      //           break;
      //         }
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
      // if (this.selectedTerm == undefined || this.selectedTerm == "") {
      //   this.sessionDetails.IsTerm = false;
      // }
      // else {
      //   this.sessionDetails.IsTerm = true;
      //   this.terms.forEach(element => {
      //     if (element.Key == this.selectedTerm) {
      //       this.sessionDetails.TermKey = element.Key;
      //       this.termForSession.isForAllActivity = element.isForAllActivity;
      //       this.termForSession.TermComments = element.TermComments;
      //       this.termForSession.TermEndDate = element.TermEndDate;
      //       this.termForSession.TermName = element.TermName;
      //       this.termForSession.TermNoOfWeeks = element.TermNoOfWeeks;
      //       this.termForSession.TermPayByDate = element.TermPayByDate;
      //       this.termForSession.TermStartDate = element.TermStartDate;

      //       this.sessionDetails.StartDate = this.termForSession.TermStartDate;
      //       this.sessionDetails.EndDate = this.termForSession.TermEndDate;
      //       this.sessionDetails.PayByDate = this.termForSession.TermPayByDate;
      //       this.sessionDetails.FinancialYearKey = element.FinancialYearKey;
      //       this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.sessionDetails.StartDate, this.sessionDetails.EndDate);

            
      //     }
      //   });
        
      // }
        this.isOnchangeTerm = true;
        // this.checkHalfTermAvailability();
        // this.getActivityList(selectedIndex);
    }
  }


  //called from club memthod
  //Done
  getActivityList(term_index:number) {
    // let initialTermActivity = this.commonService.convertFbObjectToArray(this.terms[0].Activity);
    // const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
    //   activity$Obs.unsubscribe()
    //   this.acType = data;
    //   this.types = [];
    //   if (data.length > 0) {
    //     for (let index = 0; index < this.acType.length; index++) {
    //       for (let count = 0; count < initialTermActivity.length; count++) {
    //         if (initialTermActivity[count].Key == this.acType[index].$key) {
    //           this.types.push(this.acType[index]);
    //           break;
    //         }
    //       }
    //     }
    //   }
    //   if (this.types.length != 0) {
    //     this.selectedActivityType = this.types[0].$key;
    //     this.activityObj = this.types[0];
    //     if (this.sessionDetails.HalfTerm && !this.isOnchangeTerm) {
    //       let HalfTermWeeks = this.commonService.calculateWeksBetweenDates(this.HalfTermStartDate, this.HalfTermEndDate);
    //       this.sessionDetails.NoOfWeeks = this.sessionDetails.NoOfWeeks - HalfTermWeeks;
    //     }
    //     this.calculateTotFee();
    //     this.getCoachListForGroup();


    //     if (!this.activityObj.IsExistActivityCategory) {
    //       this.isActivityCategoryExist = false;
    //       this.isExistActivitySubCategory = false;
    //     }

    //     if (this.activityObj.IsExistActivityCategory) {
    //       this.isActivityCategoryExist = true;
    //       this.getActivityCategoryList();
    //     }
    //   }
    // });
    //this.club_activities = [];
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
              for (let count = 0; count < this.terms[term_index].activities.length; count++) {
                  if (this.terms[term_index].activities[count] == res.data.getAllActivityByVenue[index].ActivityKey) {
                      this.club_activities.push(res.data.getAllActivityByVenue[index]);
                      break;
                  }
              }
           }
           if(this.club_activities.length > 0){
              this.selectedActivityType = this.club_activities[0].ActivityKey;
              this.calculateTotFee();
              this.getCoachListForGroup();
              this.getActivityCategoryList(); 
              if (this.sessionDetails.HalfTerm && !this.isOnchangeTerm) {
                let HalfTermWeeks = this.commonService.calculateWeksBetweenDates(this.HalfTermStartDate, this.HalfTermEndDate);
                this.sessionDetails.NoOfWeeks = this.sessionDetails.NoOfWeeks - HalfTermWeeks;
              }                  
              
           }else{
            this.commonService.toastMessage("no activities found",2500,ToastMessageType.Error)
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



  //called from getActivityList 
  //comming data according to the activity selected of a venue
  //showing coach accroding to the activity table
  //Done
  getCoachListForGroup() {
    this.coachs = [];
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
            this.coachs = []
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
    this.activityCategoryList = [];
    // if (this.activityObj.ActivityCategory != undefined) {
    //   this.activityCategoryList = this.commonService.convertFbObjectToArray(this.activityObj.ActivityCategory).filter(cat => cat.IsActive);
    //   this.selectActivityCategory = this.activityCategoryList[0].Key;
    //   this.activityCategoryObj = this.activityCategoryList[0];
    //   this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
    //   if (this.activityCategoryObj.IsExistActivitySubCategory) {
    //     this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory).filter(sub => sub.IsActive);
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
    this.activitySubCategoryList = [];
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
            this.isExistActivitySubCategory = true;
            this.selectActivitySubCategory = this.activitySubCategoryList[0].ActivitySubCategoryId;
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

  //onchange of activity type this method will call
  //Done
  onChangeActivity() {
    // this.activitySubCategoryList = [];
    // this.activityCategoryList = [];
    // this.types.forEach(element => {
    //   if (element.$key == this.selectedActivityType) {
    //     this.activityObj = element;
    //     this.getCoachListForGroup();
    //     this.calculateTotFee();// as price based on activity ,So we have to check on change also
    //     if (!this.activityObj.IsExistActivityCategory) {
    //       this.isActivityCategoryExist = false;
    //       this.isExistActivitySubCategory = false;
    //     }

    //     if (this.activityObj.IsExistActivityCategory) {
    //       this.isActivityCategoryExist = true;
    //       this.getActivityCategoryList();
    //     }
    //   }
    // });

    this.getCoachListForGroup();
    this.getActivityCategoryList();
    this.calculateTotFee()
  }



  onChangeActivityCategory() {
    // let isSubCategoryFound:boolean = false;
    // this.activityCategoryList.forEach((element,index) => {
    //   if (element.Key == this.selectActivityCategory) {
    //     this.activityCategoryObj = element;
    //     this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
    //     if (this.activityCategoryObj.IsExistActivitySubCategory) {
    //       isSubCategoryFound = true;
    //       this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory).filter(sub => sub.IsActive);;
    //       this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
    //     }
    //     if(index === this.activityCategoryList.length-1){
    //       if(!isSubCategoryFound){
    //         this.selectActivitySubCategory = "";
    //         this.commonService.toastMessage("Subcategory not available for the selected category",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //       }
    //     }
    //   }
    // });
    this.getActivitySubCategoryList();
  }



  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
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
  selectedDayDetails(day) {

    if (this.sessionDetails.Days == "") {
      this.sessionDetails.Days += day;
    }
    else {
      this.sessionDetails.Days += "," + day;
    }
  }



  


  validationForGroupSessionCreation() {

    if (this.selectedClub == "" || this.selectedClub == undefined) {
      let message = "Please select a venue.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
      let message = "Please select term for the session.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.selectedActivityType == "" || this.selectedActivityType == undefined) {
      let message = "Please select an activity for the session creation.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
      let message = "Please select a coach for the session creation.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.SessionName == "" || this.sessionDetails.SessionName == undefined) {
      let message = "Please enter session name.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.selectActivitySubCategory == "") {
      let message = "Please choose subcategory.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.StartDate == "" || this.sessionDetails.StartDate == undefined) {
      let message = "Please choose session start date.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.EndDate == "" || this.sessionDetails.EndDate == undefined) {
      let message = "Please choose session end date.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    } else if (this.sessionDetails.PayByDate == "" || this.sessionDetails.PayByDate == undefined) {
      let message = "Please choose session pay by date.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.StartTime == "" || this.sessionDetails.StartTime == undefined) {
      let message = "Please choose session start time.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.Duration == "" || this.sessionDetails.Duration == undefined) {
      let message = "Enter Session Duration in minutes.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.GroupSize == "" || this.sessionDetails.GroupSize == undefined) {
      let message = "Enter group size for the session.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.SessionFee == "" || this.sessionDetails.SessionFee == undefined) {
      let message = "Enter member session fee.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.SessionFeeForNonMember == "" || this.sessionDetails.SessionFeeForNonMember == undefined) {
      let message = "Enter non member session fee.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.sessionDetails.NoOfWeeks == 0 || this.sessionDetails.NoOfWeeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }

  }


  cancelSessionCreation() {

    let confirm = this.alertCtrl.create({
      title: 'Cancel Session Creation ',
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


  onChangeFee() {
    this.sessionDetails.SessionFee = (parseFloat(this.sessionDetails.SessionFee)).toFixed(2);
  }




  createSession() {
    if (this.validationForGroupSessionCreation()) {
      let confirm = this.alertCtrl.create({
        title: 'Create Group',
        message: 'Are you sure you want to create the session?',
        buttons: [
          {
            text: 'No',
            handler: () => {

            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.cerateSessionMethod();
            }
          }
        ]
      });
      confirm.present();
    }
  }
  onChangeCoach() {
    this.coachs.forEach(element => {
      if (element.CoachId == this.selectedCoach) {
        this.selectedCoachName = element.FirstName + " " + element.LastName;
      }
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }



  cerateSessionMethod() {
    // this.sessionDetails.PaymentOption = parseInt(this.sessionDetails.PaymentOption);
    let obj = { ActivityCode: '', ActivityName: '', AliasName: '', IsExistActivityCategory: false, IsActive: true, };
    let coachObj = { CoachName: '', CoachKey: '', IsActive: true }
    let activityCategoryDetails = { ActivityCategoryCode: '', ActivityCategoryName: '', IsExistActivitySubCategory: false, IsActive: true };
    this.sessionDetails.ParentClubKey = this.parentClubKey;
    this.sessionDetails.ClubKey = this.selectedClub;
    this.sessionDetails.CoachKey = this.selectedCoach;
    this.sessionDetails.CoachName = this.selectedCoachName;
    this.sessionDetails.SessionType = "Group";
    this.sessionDetails.ActivityKey = this.activityObj.$key;
    this.sessionDetails.ActivityCategoryKey = this.selectActivityCategory;
    // this.sessionDetails.FinancialYearKey = this.currentFinancialYear;
    //coach details
    coachObj.CoachName = this.selectedCoachName;
    coachObj.CoachKey = this.selectedCoach;
    coachObj.IsActive = true;
    //Activity details
    obj.ActivityCode = this.activityObj.ActivityCode;
    obj.ActivityName = this.activityObj.ActivityName;
    obj.AliasName = this.activityObj.AliasName;
    if (this.PriceSetup != undefined) {
      obj["PriceSetup"] = this.PriceSetup;
    }
    obj.IsExistActivityCategory = this.activityObj.IsExistActivityCategory;
    this.sessionDetails.IsExistActivityCategory = obj.IsExistActivityCategory;

    //Activity category details
    if (this.activityObj.IsExistActivityCategory) {
      activityCategoryDetails.ActivityCategoryCode = this.activityCategoryObj.ActivityCategoryCode;
      activityCategoryDetails.ActivityCategoryName = this.activityCategoryObj.ActivityCategoryName;
      this.ActivityCategoryName = activityCategoryDetails.ActivityCategoryName;
      activityCategoryDetails.IsExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
      this.sessionDetails.IsExistActivitySubCategory = activityCategoryDetails.IsExistActivitySubCategory;
    }
    this.sessionDetails.Days = "";
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


      if (this.isExistActivitySubCategory) {
        for (let acsIndex = 0; acsIndex < this.activitySubCategoryList.length; acsIndex++) {
          if (this.activitySubCategoryList[acsIndex].ActivitySubCategoryId == this.selectActivitySubCategory) {
            //actSubCategoryObj = this.activitySubCategoryList[acsIndex];
            this.ActivitySubCategoryName = this.activitySubCategoryList[acsIndex].ActivitySubCategoryName;
            this.sessionDetails.ActivitySubCategoryKey = this.activitySubCategoryList[acsIndex].ActivitySubCategoryId;
          }
        }
      }


      this.sessionDetails.SessionFee = parseFloat(this.sessionDetails.SessionFee).toFixed(2);
      this.sessionDetails.SessionFeeForNonMember = parseFloat(this.sessionDetails.SessionFeeForNonMember).toFixed(2);

      if (this.sessionDetails.FeesPerDayForMember != "" && this.sessionDetails.FeesPerDayForMember != undefined) {
        this.sessionDetails.FeesPerDayForMember = parseFloat(this.sessionDetails.FeesPerDayForMember).toFixed(2);
      } else {
        this.sessionDetails.FeesPerDayForMember = "0.00"
      }
      if (this.sessionDetails.FeesPerDayForNonMember != "" && this.sessionDetails.FeesPerDayForNonMember != undefined) {
        this.sessionDetails.FeesPerDayForNonMember = parseFloat(this.sessionDetails.FeesPerDayForNonMember).toFixed(2);
      } else {
        this.sessionDetails.FeesPerDayForNonMember = "0.00";
      }



      if (this.sessionDetails.HalfTerm) {
        // cancellation of sessions when half term applied starts here
        let daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let startDate = new Date(this.HalfTermStartDate);
        let endDate = new Date(this.HalfTermEndDate);
        let currentDate = startDate;

        for (let j = 0; j < this.days.length; j++) {
          currentDate = startDate;
          for (let i = 1; currentDate.getTime() < endDate.getTime(); i++) {
            if (this.days[j] == currentDate.getDay()) {
              console.log(`${this.days[j]}::${currentDate.getDay()}`);
              let year = new Date(currentDate).getFullYear();
              let month = new Date(currentDate).getMonth() + 1;
              let date = new Date(currentDate).getDate();

              this.attendanceObj.StartDate = this.sessionDetails.StartDate;
              this.attendanceObj.EndDate = this.sessionDetails.EndDate;
              this.attendanceObj.AttendanceStatus = "Canceled";
              this.attendanceObj.CanceledReason = "HalfTerm";
              this.attendanceObj.AttendanceOn = new Date().getTime();

              //creating an attendance folder in session
              this.fb.update(year + "-" + month + "-" + date, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.returnKey + "/", this.attendanceObj);
            }
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

          }
        }
        // cancellation of sessions when half term applied ends here
      }
      this.postgre_sessionSave();
      //this.reinitializeSession();
      
    //});

  }

  async postgre_sessionSave(){
    this.postgre_session_input = new CreateTermSessionModel(this.sessionDetails);
    this.postgre_session_input.IsExistActivityCategory = this.isActivityCategoryExist;
    this.postgre_session_input.IsExistActivitySubCategory = this.isExistActivitySubCategory;
    this.postgre_session_input.ActivityCategoryName = this.activityCategoryList.filter(act_category => act_category.ActivityCategoryId === this.selectActivityCategory)[0].ActivityCategoryName;
    this.postgre_session_input.ActivitySubCategoryName = this.activitySubCategoryList.filter(act_sub_category => act_sub_category.ActivitySubCategoryId === this.selectActivitySubCategory)[0].ActivitySubCategoryName;
    this.postgre_session_input.Term_Name = this.terms.find(term => term.term_id === this.selectedTerm).term_name;
    this.postgre_session_input.Firebase_SessionKey = "";
    this.postgre_session_input.session_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.postgre_session_input.session_firebase_fields.activity_id = this.selectedActivityType;
    const coaches = [];coaches.push(this.selectedCoach)
    const activities = [];activities.push(this.selectedActivityType)
    this.postgre_session_input.session_postgre_fields.coach_ids = await this.getCoachIdsByFirebaseKeys(coaches);
    this.postgre_session_input.session_postgre_fields.activity_id = await this.getActivityIdsByFirebaseKeys(activities);
    this.postgre_session_input.session_postgre_fields.club_id = await this.getClubByFirebaseId(this.selectedClub);

    if(this.postgre_session_input.session_postgre_fields.club_id == "" || this.postgre_session_input.session_postgre_fields.club_id == undefined){
      this.commonService.toastMessage("Clubs fetch failed",2500,ToastMessageType.Error);
      return false;
    }
    if(this.postgre_session_input.session_postgre_fields.activity_id == "" || this.postgre_session_input.session_postgre_fields.activity_id == undefined){
      this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
      return false;
    }
    if(this.postgre_session_input.session_postgre_fields.coach_ids.length == 0){
      this.commonService.toastMessage("Coaches fetch failed",2500,ToastMessageType.Error);
      return false;
    }

    this.postgre_session_input.updated_by = this.sharedservice.getLoggedInId();        
    this.postgre_session_input.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "androd" ? 1 :2 //1 for android ,2 for ios
    this.postgre_session_input.user_postgre_metadata.UserMemberId = this.sharedservice.getLoggedInId();
    console.log(this.postgre_session_input);

    const term_ses_mutation = gql`
        mutation createSession($sessionInput: CreateSessionInput!) {
          createSession(sessionInput: $sessionInput){
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
          const message = "Session created successfully. Please add member(s) to the session.";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.pop();
          this.commonService.updateCategory("update_session_list");
          //this.reinitializeSession();
        },(err)=>{
          this.commonService.toastMessage("Session creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
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

  getActivityIdsByFirebaseKeys(activity_ids):Promise<any>{
    return new Promise((res,rej)=>{
      const activity_query =  gql`
      query getActivityByFirebaseIds($activityIds: [String!]) {
        getActivityByFirebaseIds(activityIds: $activityIds){
          Id
          FirebaseActivityKey
          ActivityCode
          ActivityName
        }  
      }`
      const activity_query_variables =  {activityIds: activity_ids};
      this.graphqlService.query(
        activity_query,
        activity_query_variables,
        0 
        ).subscribe((response)=>{
        res(response.data["getActivityByFirebaseIds"][0]["Id"]);
      },(err)=>{
         rej(err);
      }); 
    })           
  }

  getClubByFirebaseId(club_id):Promise<any>{
    return new Promise((res,rej)=>{
      const club_query =  gql`
      query getClubByFirebaseId($clubId: String!) {
        getClubByFirebaseId(firebaseId: $clubId){
          Id
          ClubName
        }  
      }`
      const club_query_variables =  {clubId: club_id};
      this.graphqlService.query(
        club_query,
        club_query_variables,
        0 
        ).subscribe((response)=>{
            res(response.data["getClubByFirebaseId"][0]["Id"]);
      },(err)=>{
            rej(err);
      });
    })           
  }


  reinitializeSession(){
    this.commonService.updateCategory("sessions");//to refresh the session listing
      this.sessionDetails = {
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
        ParentClubKey: '',
        GroupCategory: "Term",
        SessionFee: '7',
        CoachName: '',
        SessionType: '',
        GroupStatus:1,
        ActivityKey: '',
        ActivityCategoryKey: '',
        ActivitySubCategoryKey: '',
        FinancialYearKey: '',
        IsExistActivitySubCategory: false,
        IsExistActivityCategory: false,
        PayByDate: '',
        //Additional properties
        SessionFeeForNonMember: '7.00',
        IsAllowPayLater:false,
        HalfTerm: false,
        NoOfWeeks: 0,
        FeesPerDayForMember: '8.00',
        FeesPerDayForNonMember: '8.00',
        PaymentOption: 100,
        //IsAllMembertoEditFees: true,
        IsAllMembertoEditAmendsFees: true,
        IsAllowGroupChat:true,
        ShowInAPKids:true,
        MemberVisibility:true,
        IsLoyaltyAllowed:false,
        IsFixedLoyaltyAllowed:false,
        FixedLoyaltyPoints:"0.00",
        AllowChildCare:false,
        AllowWaitingList:false,
        CreatedDate:new Date().getTime(),
        UpdatedDate:new Date().getTime()
      };
      this.isExistActivitySubCategory = false;
      this.navCtrl.pop();
  }



  dateChanged() {
    if (this.validateSessionDate()) {
      this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.sessionDetails.StartDate, this.sessionDetails.EndDate);
    } else {
      this.sessionDetails.StartDate = this.sessionDetails.EndDate;
      this.sessionDetails.EndDate = this.sessionDetails.EndDate;
      this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.sessionDetails.StartDate, this.sessionDetails.EndDate);
    }

    if (this.sessionDetails.HalfTerm && this.isOnchangeTerm) {
      let HalfTermWeeks = this.commonService.calculateWeksBetweenDates(this.HalfTermStartDate, this.HalfTermEndDate);
      this.sessionDetails.NoOfWeeks = this.sessionDetails.NoOfWeeks - HalfTermWeeks;
    }
    //this.inputChanged();
  }

  validateSessionDate() {
    if (new Date(this.sessionDetails.StartDate).getTime() > new Date(this.sessionDetails.EndDate).getTime()) {
      this.commonService.toastMessage("Session start date should be greater than end date.", 2500,ToastMessageType.Error);
      return false;
    }
    return true;
  }

  inputChanged() {
    // this.sessionDetails.SessionFee = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForMember)).toFixed(2)).toFixed(2);
    // this.sessionDetails.SessionFeeForNonMember = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForNonMember)).toFixed(2)).toFixed(2);
    // this.sessionDetails.SessionFee = isNaN(parseFloat(this.sessionDetails.SessionFee)) ? "" : this.sessionDetails.SessionFee;
    // this.sessionDetails.SessionFeeForNonMember = isNaN(parseFloat(this.sessionDetails.SessionFeeForNonMember)) ? "" : this.sessionDetails.SessionFeeForNonMember;
    this.calculateTotFee();
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
        this.sessionDetails.NoOfWeeks = this.commonService.calculateWeksBetweenDates(this.sessionDetails.StartDate, this.sessionDetails.EndDate);
        this.calculateTotFee();
      }
    }, 200);
  }


  calculateTotFee() {

    let activityIndex = this.club_activities.findIndex(activity => activity.ActivityKey === this.selectedActivityType);
    if (activityIndex != -1) {
      if (this.club_activities[activityIndex].PriceSetup != undefined && this.club_activities[activityIndex].PriceSetup.MemberPricePerHour != '' && this.club_activities[activityIndex].PriceSetup.NonMemberPricePerHour != '') {
        //calculate member and non-memberprice bases on priceSetUp
        //Note:PriceSetup default fee is hour basis
        let defaultMins: any = 60;
        this.PriceSetup = this.club_activities[activityIndex].PriceSetup;
        let FeesPerDayForMember: any = (parseFloat(this.sessionDetails.Duration) * parseFloat(this.club_activities[activityIndex].PriceSetup.MemberPricePerHour) / parseFloat(defaultMins));
        let FeesPerDayForNonMember: any = (parseFloat(this.sessionDetails.Duration) * parseFloat(this.club_activities[activityIndex].PriceSetup.NonMemberPricePerHour) / parseFloat(defaultMins));
        this.sessionDetails.FeesPerDayForMember = FeesPerDayForMember;
        this.sessionDetails.FeesPerDayForNonMember = FeesPerDayForNonMember;
        this.sessionDetails.SessionFee = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForMember)).toFixed(2)).toFixed(2);
        this.sessionDetails.SessionFeeForNonMember = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForNonMember)).toFixed(2)).toFixed(2);
      } else {
        this.sessionDetails.FeesPerDayForMember = "0.00";
        this.sessionDetails.FeesPerDayForNonMember = "0.00";
        this.sessionDetails.SessionFee = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForMember)).toFixed(2)).toFixed(2);
        this.sessionDetails.SessionFeeForNonMember = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForNonMember)).toFixed(2)).toFixed(2);
        this.sessionDetails.SessionFee = isNaN(parseFloat(this.sessionDetails.SessionFee)) ? "" : this.sessionDetails.SessionFee;
        this.sessionDetails.SessionFeeForNonMember = isNaN(parseFloat(this.sessionDetails.SessionFeeForNonMember)) ? "" : this.sessionDetails.SessionFeeForNonMember;
      }
    }
  }


  //MemberPricePerHour,NonMemberPricePerHour

  //**************************************************** */
  ////************    installment payment type
  //************************************************** */

  paymentOptionChanged() {
    console.log(this.sessionDetails.PaymentOption);
  }

  continue(paymentOptions) {
    let confirm = this.alertCtrl.create({
      message: paymentOptions == '104' ? 'Continue for (Installment)?' : 'Continue for (Monthly)?',
      buttons: [
        {
          text: 'No',
          handler: () => { }
        },
        {
          text: 'Yes',
          handler: () => {
            if (paymentOptions == '104') {
              if (this.validateInstallmentSession()) {
                this.initializeSession();
                this.navCtrl.push("SessioninstallmentPage", { SessionDetailsObject: this.sessionDetails, InstallmentSesionObject: this.installmentSessionObj, Term: this.termForSession });
              }
            } else if (paymentOptions == '101') {
              if (this.validateMonthlySession()) {
                //  this.initializeMonthlySession();
                // this.navCtrl.push("SessionMonthly",{ SessionDetailsObject: this.sessionDetails, MonthlySessionObject: this.monthlySessionObj});
              }
            }
          }
        }
      ]
    });
    confirm.present();





  }
  initializeSession() {
    let obj = { ActivityCode: '', ActivityName: '', AliasName: '', IsExistActivityCategory: false, IsActive: true };
    let coachObj = { CoachName: '', CoachKey: '', IsActive: true }

    let activityCategoryDetails = { ActivityCategoryCode: '', ActivityCategoryName: '', IsExistActivitySubCategory: false, IsActive: true };
    this.sessionDetails.ParentClubKey = this.parentClubKey;
    this.sessionDetails.ClubKey = this.selectedClub;
    this.sessionDetails.CoachKey = this.selectedCoach;
    this.sessionDetails.CoachName = this.selectedCoachName;
    this.sessionDetails.SessionType = "Group";
    this.sessionDetails.ActivityKey = this.activityObj.$key;
    this.sessionDetails.ActivityCategoryKey = this.selectActivityCategory;
    // this.sessionDetails.FinancialYearKey = this.currentFinancialYear;

    //coach details
    coachObj.CoachName = this.selectedCoachName;
    coachObj.CoachKey = this.selectedCoach;
    coachObj.IsActive = true;



    //Activity details
    obj.ActivityCode = this.activityObj.ActivityCode;
    obj.ActivityName = this.activityObj.ActivityName;
    obj.AliasName = this.activityObj.AliasName;
    obj.IsExistActivityCategory = this.activityObj.IsExistActivityCategory;
    this.sessionDetails.IsExistActivityCategory = obj.IsExistActivityCategory;

    //Activity initialization in session 
    this.installmentSessionObj["Activity"] = {};
    this.installmentSessionObj["Activity"][this.activityObj.$key] = obj;


    //Activity category details
    if (this.activityObj.IsExistActivityCategory) {

      activityCategoryDetails.ActivityCategoryCode = this.activityCategoryObj.ActivityCategoryCode;
      activityCategoryDetails.ActivityCategoryName = this.activityCategoryObj.ActivityCategoryName;
      activityCategoryDetails.IsExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
      this.sessionDetails.IsExistActivitySubCategory = activityCategoryDetails.IsExistActivitySubCategory;
      //Activitycategory initialization in session
      this.installmentSessionObj["Activity"][this.activityObj.$key]["ActivityCategory"] = {};
      //[this.activityCategoryObj.Key]={};
      this.installmentSessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key] = activityCategoryDetails;


    }
    this.sessionDetails.Days = "";
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

    if (this.isExistActivitySubCategory) {
      for (let acsIndex = 0; acsIndex < this.activitySubCategoryList.length; acsIndex++) {
        if (this.activitySubCategoryList[acsIndex].ActivitySubCategoryId == this.selectActivitySubCategory) {
          this.sessionDetails.ActivitySubCategoryKey = this.activitySubCategoryList[acsIndex].ActivitySubCategoryId;
          //this.sessionDetails.ActivitySubCategoryName = this.activitySubCategoryList[acsIndex].ActivitySubCategoryName;
        }
      }
    }
    // if (this.isExistActivitySubCategory) {
    //   // this.fb.update(actSubCategoryObj.Key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/" + this.activityObj.$key + "/ActivityCategory/" + this.activityCategoryObj.Key + "/ActivitySubCategory/", actSubCategoryObj);
    //   this.installmentSessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key]["ActivitySubCategory"] = {};
    //   //  [actSubCategoryObj.Key]={};
    //   this.installmentSessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key]["ActivitySubCategory"][actSubCategoryObj.Key] = actSubCategoryObj;

    // }
    this.sessionDetails.SessionFee = parseFloat(this.sessionDetails.SessionFee).toFixed(2);
    this.sessionDetails.SessionFeeForNonMember = parseFloat(this.sessionDetails.SessionFeeForNonMember).toFixed(2);

    if (this.sessionDetails.FeesPerDayForMember != "" && this.sessionDetails.FeesPerDayForMember != undefined) {
      this.sessionDetails.FeesPerDayForMember = parseFloat(this.sessionDetails.FeesPerDayForMember).toFixed(2);
    } else {
      this.sessionDetails.FeesPerDayForMember = "0.00"
    }
    if (this.sessionDetails.FeesPerDayForNonMember != "" && this.sessionDetails.FeesPerDayForNonMember != undefined) {
      this.sessionDetails.FeesPerDayForNonMember = parseFloat(this.sessionDetails.FeesPerDayForNonMember).toFixed(2);
    } else {
      this.sessionDetails.FeesPerDayForNonMember = "0.00";
    }

  }



  validateInstallmentSession() {

    if (this.sessionDetails.SessionName == "" || this.sessionDetails.SessionName == undefined) {
      let message = "Please enter session name.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedClub == "" || this.selectedClub == undefined) {
      let message = "Please select a venue.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
      let message = "Please select term for the session.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.activityObj.$key == "" || this.activityObj.$key == undefined) {
      let message = "Please select an activity for the session creation.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
      let message = "Please select a coach for the session creation.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.sessionDetails.GroupSize == "" || this.sessionDetails.GroupSize == undefined) {
      let message = "Enter group size for the session.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.StartTime == "" || this.sessionDetails.StartTime == undefined) {
      let message = "Please choose session start time.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.Duration == "" || this.sessionDetails.Duration == undefined) {
      let message = "Enter Session Duration in minutes.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }




    else if (this.sessionDetails.StartDate == "" || this.sessionDetails.StartDate == undefined) {
      let message = "Please choose session start date.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.EndDate == "" || this.sessionDetails.EndDate == undefined) {
      let message = "Please choose session end date.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    //  else if (this.sessionDetails.PayByDate == "" || this.sessionDetails.PayByDate == undefined) {
    //   let message = "Please choose session pay by date.";
    //   this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }



    // else if (this.sessionDetails.SessionFee == "" || this.sessionDetails.SessionFee == undefined) {
    //   let message = "Enter member session fee.";
    //   this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }
    // else if (this.sessionDetails.SessionFeeForNonMember == "" || this.sessionDetails.SessionFeeForNonMember == undefined) {
    //   let message = "Enter non member session fee.";
    //   this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }
    else if (this.sessionDetails.NoOfWeeks == 0 || this.sessionDetails.NoOfWeeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.NoOfWeeks == 0 || this.sessionDetails.NoOfWeeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.installmentSessionObj.NoOfInstallment == 0 || (this.installmentSessionObj.NoOfInstallment.toString()) == "") {
      let message = "No of installment should be greater than 0";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.installmentSessionObj.InstallmentAmountForMember == "" || this.installmentSessionObj.InstallmentAmountForMember == undefined) {
      let message = "Enter installment amount for member";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.installmentSessionObj.InstallmentAmountForNonMember == "" || this.installmentSessionObj.InstallmentAmountForNonMember == undefined) {
      let message = "Enter installment amount for non member";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }




    else {
      return true;
    }

  }



  //************************************************************************************************** */
  //
  //                       Monthly payment operation done bellow
  //
  //
  //************************************************************************************************* */



  selectFreeSessions() {
    this.selector.show({
      title: "Free Sessions(in month)",
      items: [
        this.jsonDataForWheelSelector.freeSessions
      ],
      defaultItems: [
        { index: 3, value: this.jsonDataForWheelSelector.freeSessions[3].description }
      ]
    }).then(
      result => {
        alert(JSON.stringify(result));
      },
      err => console.log('Error: ', err)
    );
  }



  validateMonthlySession() {

    if (this.sessionDetails.SessionName == "" || this.sessionDetails.SessionName == undefined) {
      let message = "Please enter session name.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedClub == "" || this.selectedClub == undefined) {
      let message = "Please select a venue.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
      let message = "Please select term for the session.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.activityObj.$key == "" || this.activityObj.$key == undefined) {
      let message = "Please select an activity for the session creation.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
      let message = "Please select a coach for the session creation.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.sessionDetails.GroupSize == "" || this.sessionDetails.GroupSize == undefined) {
      let message = "Enter group size for the session.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }

    else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.StartTime == "" || this.sessionDetails.StartTime == undefined) {
      let message = "Please choose session start time.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.Duration == "" || this.sessionDetails.Duration == undefined) {
      let message = "Enter Session Duration in minutes.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }




    else if (this.sessionDetails.StartDate == "" || this.sessionDetails.StartDate == undefined) {
      let message = "Please choose session start date.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.EndDate == "" || this.sessionDetails.EndDate == undefined) {
      let message = "Please choose session end date.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    //  else if (this.sessionDetails.PayByDate == "" || this.sessionDetails.PayByDate == undefined) {
    //   let message = "Please choose session pay by date.";
    //this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }



    // else if (this.sessionDetails.SessionFee == "" || this.sessionDetails.SessionFee == undefined) {
    //   let message = "Enter member session fee.";
    //this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }
    // else if (this.sessionDetails.SessionFeeForNonMember == "" || this.sessionDetails.SessionFeeForNonMember == undefined) {
    //   let message = "Enter non member session fee.";
    //this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }
    else if (this.sessionDetails.NoOfWeeks == 0 || this.sessionDetails.NoOfWeeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.sessionDetails.NoOfWeeks == 0 || this.sessionDetails.NoOfWeeks == undefined) {
      let message = "Enter session duration in terms of weeks.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }

  }




  // initializeMonthlySession() {
  //   let obj = { ActivityCode: '', ActivityName: '', AliasName: '', IsExistActivityCategory: false, IsActive: true };
  //   let coachObj = { CoachName: '', CoachKey: '', IsActive: true }
  //   let activityCategoryDetails = { ActivityCategoryCode: '', ActivityCategoryName: '', IsExistActivitySubCategory: false, IsActive: true };
  //   this.sessionDetails.ParentClubKey = this.parentClubKey;
  //   this.sessionDetails.ClubKey = this.selectedClub;
  //   this.sessionDetails.CoachKey = this.selectedCoach;
  //   this.sessionDetails.CoachName = this.selectedCoachName;
  //   this.sessionDetails.SessionType = "Group";
  //   this.sessionDetails.ActivityKey = this.activityObj.$key;
  //   this.sessionDetails.ActivityCategoryKey = this.selectActivityCategory;
  //   // this.sessionDetails.FinancialYearKey = this.currentFinancialYear;

  //   //coach details
  //   coachObj.CoachName = this.selectedCoachName;
  //   coachObj.CoachKey = this.selectedCoach;
  //   coachObj.IsActive = true;



  //   //Activity details
  //   obj.ActivityCode = this.activityObj.ActivityCode;
  //   obj.ActivityName = this.activityObj.ActivityName;
  //   obj.AliasName = this.activityObj.AliasName;
  //   obj.IsExistActivityCategory = this.activityObj.IsExistActivityCategory;
  //   this.sessionDetails.IsExistActivityCategory = obj.IsExistActivityCategory;

  //   //Activity initialization in session 
  //   this.monthlySessionObj["Activity"] = {};
  //   this.monthlySessionObj["Activity"][this.activityObj.$key] = obj;


  //   //Activity category details
  //   if (this.activityObj.IsExistActivityCategory) {

  //     activityCategoryDetails.ActivityCategoryCode = this.activityCategoryObj.ActivityCategoryCode;
  //     activityCategoryDetails.ActivityCategoryName = this.activityCategoryObj.ActivityCategoryName;
  //     activityCategoryDetails.IsExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
  //     this.sessionDetails.IsExistActivitySubCategory = activityCategoryDetails.IsExistActivitySubCategory;
  //     //Activitycategory initialization in session
  //     this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"] = {};
  //     //[this.activityCategoryObj.Key]={};
  //     this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key] = activityCategoryDetails;


  //   }
  //   this.sessionDetails.Days = "";
  //   this.days.sort();
  //   for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

  //     switch (this.days[daysIndex]) {
  //       case 1:
  //         this.selectedDayDetails("Mon");
  //         break;
  //       case 2:
  //         this.selectedDayDetails("Tue");
  //         break;
  //       case 3:
  //         this.selectedDayDetails("Wed");
  //         break;
  //       case 4:
  //         this.selectedDayDetails("Thu");
  //         break;
  //       case 5:
  //         this.selectedDayDetails("Fri");
  //         break;
  //       case 6:
  //         this.selectedDayDetails("Sat");
  //         break;
  //       case 7:
  //         this.selectedDayDetails("Sun");
  //         break;
  //     }
  //   }



  //   let actSubCategoryObj = { ActivitySubCategoryCode: '', ActivitySubCategoryName: '', IsActive: true, IsEnable: '', Key: '' };
  //   if (this.isExistActivitySubCategory) {
  //     for (let acsIndex = 0; acsIndex < this.activitySubCategoryList.length; acsIndex++) {
  //       if (this.activitySubCategoryList[acsIndex].Key == this.selectActivitySubCategory) {
  //         actSubCategoryObj = this.activitySubCategoryList[acsIndex];
  //         this.sessionDetails.ActivitySubCategoryKey = actSubCategoryObj.Key;
  //       }
  //     }
  //   }
  //   if (this.isExistActivitySubCategory) {
  //     // this.fb.update(actSubCategoryObj.Key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/" + this.activityObj.$key + "/ActivityCategory/" + this.activityCategoryObj.Key + "/ActivitySubCategory/", actSubCategoryObj);
  //     this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key]["ActivitySubCategory"] = {};
  //     //  [actSubCategoryObj.Key]={};
  //     this.monthlySessionObj["Activity"][this.activityObj.$key]["ActivityCategory"][this.activityCategoryObj.Key]["ActivitySubCategory"][actSubCategoryObj.Key] = actSubCategoryObj;

  //   }


  //  // this.sessionDetails.SessionFee = parseFloat(this.sessionDetails.SessionFee).toFixed(2);
  //   // this.sessionDetails.SessionFeeForNonMember = parseFloat(this.sessionDetails.SessionFeeForNonMember).toFixed(2);

  //   // if (this.sessionDetails.FeesPerDayForMember != "" && this.sessionDetails.FeesPerDayForMember != undefined) {
  //   //   this.sessionDetails.FeesPerDayForMember = parseFloat(this.sessionDetails.FeesPerDayForMember).toFixed(2);
  //   // } else {
  //   //   this.sessionDetails.FeesPerDayForMember = "0.00"
  //   // }
  //   // if (this.sessionDetails.FeesPerDayForNonMember != "" && this.sessionDetails.FeesPerDayForNonMember != undefined) {
  //   //   this.sessionDetails.FeesPerDayForNonMember = parseFloat(this.sessionDetails.FeesPerDayForNonMember).toFixed(2);
  //   // } else {
  //   //   this.sessionDetails.FeesPerDayForNonMember = "0.00";
  //   // }




  // }








}
