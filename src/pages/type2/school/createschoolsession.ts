import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { LanguageService } from '../../../services/language.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { CreateSchoolSession, IFirebaseSchoolSessionDTO } from './dto/create_school_session.dto';
import { SchoolDetails, SchoolVenue } from './schoolsession.model';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../shared/model/club.model';
import { FinancialYearTerms } from '../../../shared/model/financial_terms.model';
@IonicPage()
@Component({
    selector: 'createschoolsession-page',
    templateUrl: 'createschoolsession.html',
    providers:[GraphqlService]
})

export class Type2CreateSchoolSession {
    LangObj: any = {};//by vinod
    isTermsEmpty: boolean = false;
    parentClubKey: any;
    themeType: number;
    schools: SchoolVenue[] = []
    selectedSchool: string = "";
    clubs:IClubDetails[] = [];
    club_activities:Activity[] = [];
    selectedClub: string = "";
    financialYears = [];
    currentFinancialYear: string = "";
    terms:FinancialYearTerms[] = [];
    selectedTerm: string = "";
    acType = [];
    types = [];
    selectedActivityType:string = "";
    isExistActivitySubCategory = false;
    isActivityCategoryExist = false;
    activityCategoryList:ActivityCategory[] = [];
    selectActivityCategory = "";
    activityCategoryObj: any;
    selectActivitySubCategory = "";
    activitySubCategoryList = [];
    selectedCoach:string = "";
    selectedCoachName:string = "";
    coachs:ActivityCoach[] = [];

    isSelectMon = false;
    isSelectTue = false;
    isSelectWed = false;
    isSelectThu = false;
    isSelectFri = false;
    isSelectSat = false;
    isSelectSun = false;
    days = [];
    loading: any;

    activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
    paymentTypes = [
        { key: 1, value: "Term" },
        { key: 2, value: "Weekly" },
        { key: 3, value: "Instalment" }
    ]
    selectpaymenttype: string = 'Term';
    schoolSession:IFirebaseSchoolSessionDTO = {
        CreatedDate: 0,
        UpdatedDate: 0,
        CreatedBy: '',
        UpdatedBy: '',
        SessionName: '',
        StartTime: '',
        IsActive: true,
        SchoolKey: "",
        SchoolName: '',
        ParentClubKey: '',
        ClubKey: '',
        FinancialYearKey: '',
        TermKey: '',
        Term: {},
        StartDate: '03:30',
        EndDate: '',
        PayByDate: '',
        ActivityKey: '',
        ActivityCategoryKey: '',
        IsExistActivitySubCategory: false,
        ActivitySubCategoryKey: '',
        IsExistActivityCategory: false,
        SessionType: "School",
        Activity: {},
        CoachName: '',
        CoachKey: '',
        Days: '',
        Duration: '60',
        GroupSize: '20',
        Comments: '',
        SessionFee: '7.00',
        BookingButtonText: 'Book Now',
        ReserveButtonText: 'Add to Waiting List',
        AutoEnrolment: true,
        NumberOfWeeks: 0,
        PaymentType: '',
        AllowChildCare:true,
        IsAllMembertoEditAmendsFees:false,
        IsAllowGroupChat:false,
        ShowInAPKids:false,
        MemberVisibility:true,
        IsLoyaltyAllowed:false,
        IsFixedLoyaltyAllowed:false,
        FixedLoyaltyPoints:0,
        AllowWaitingList:true,     
        Waitinglist_Capacity:10
        // NoOfWeeks: 0,
    }

    maxDate = "";
    loggedin_user:string;
    minuteValues = "00";
    userData: any;
    constructor(public events: Events,  
        public loadingCtrl: LoadingController, 
        public alertCtrl: AlertController,
         public navParams: NavParams, 
         public storage: Storage, public fb: FirebaseService,
          public navCtrl: NavController, 
          public sharedservice: SharedServices, 
          private graphqlService: GraphqlService,
          public popoverCtrl: PopoverController, 
          private commonService: CommonService,
          private langService: LanguageService) {
        let temp = "";
        for (let i = 1; i < 60; i++) {
            if (i % 5 == 0) {
                this.minuteValues += "," + i;
            }
        }
        this.themeType = sharedservice.getThemeType();
        this.userData = sharedservice.getUserData();
        this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
        this.themeType = sharedservice.getThemeType();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.loggedin_user = val.$key;
                //Session Prop
                this.schoolSession.ParentClubKey = this.parentClubKey;
                this.schoolSession.CreatedBy = this.parentClubKey;
                this.getClubList();
                this.getSchools();
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
    //
    //###############     Page Functionality     #################
    //  
    getSchools() {
        // const school$Obs = this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
        //     school$Obs.unsubscribe();
        //     this.schools = [];
        //     data.forEach(element => {
        //         if (element.IsActive) {
        //             this.schools.push(element);
        //             this.selectedSchool = this.schools[0].$key;
        //             this.schoolSession.SchoolKey = this.selectedSchool;
        //             this.schoolSession.SchoolName = this.schools[0].SchoolName;
        //         }
        //     });
        // });
        const schools_query = gql`
        query getParentClubSchoolsById($parentclubId: String!){
            getParentClubSchoolsById(parentclubId:$parentclubId){
               id
               school_name
               firebasekey
               firstline_address
               secondline_address
               email_id
               contact_no
               postcode
            }
        }
        `;
          this.graphqlService.query(schools_query,{parentclubId: this.sharedservice.getPostgreParentClubId()},0)
            .subscribe((res: any) => {
                //this.commonService.hideLoader();
                this.schools = res.data.getParentClubSchoolsById as SchoolVenue[];
                if(this.schools.length > 0){
                    this.selectedSchool = this.schools[0].id;
                    this.schoolSession.SchoolKey = this.selectedSchool;
                    this.schoolSession.SchoolName = this.schools[0].school_name;
                }else{
                    this.commonService.toastMessage("No schools found",2500,ToastMessageType.Error);
                }
            },
           (error) => {
                // this.commonService.hideLoader();
                   console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
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
                //this.getFinancialYearList();
                this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
                console.log("clubs lists:", JSON.stringify(this.clubs));
                if(this.clubs.length >0){
                    this.selectedClub = this.clubs[0].FirebaseId;
                    this.schoolSession.ClubKey = this.selectedClub;
                    //this.getTermList();
                }else{
                    this.commonService.toastMessage("No venues found",2500,ToastMessageType.Error);
                }    
            },
           (error) => {
                // this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               //Handle the error here, you can display an error message or take appropriate action.
           })
    }

    getTermList() {
        // const terms$Obs = this.fb.getAll("/Term/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
        //     terms$Obs.unsubscribe();
        //     this.terms = [];
        //     let termSortedByDate = [];
        //     let allTermDetails = data;
        //     for (let i = 0; i < allTermDetails.length; i++) {
        //         let financialyearKey = allTermDetails[i].$key;
        //         allTermDetails[i] = Array.isArray(allTermDetails[i]) ? allTermDetails[i]: this.commonService.convertFbObjectToArray(allTermDetails[i]);

        //         for (let j = 0; j < allTermDetails[i].length; j++) {
        //             allTermDetails[i][j].FinancialYearKey = financialyearKey;
        //             allTermDetails[i][j]["StartTime"] = new Date(allTermDetails[i][j].TermStartDate).getTime();
        //             allTermDetails[i][j]["EndTime"] = new Date(allTermDetails[i][j].TermEndDate).getTime();

        //             if (((allTermDetails[i][j]["StartTime"] <= new Date().getTime()) && (allTermDetails[i][j]["EndTime"] >= new Date().getTime())) || (allTermDetails[i][j]["StartTime"] >= new Date().getTime())) {

        //                 this.terms.push(allTermDetails[i][j]);

        //                 if (this.terms.length > 0) {
        //                     this.selectedTerm = this.terms[0].Key;
        //                     this.schoolSession.TermKey = this.terms[0].Key;
        //                     this.schoolSession.Term[this.schoolSession.TermKey] = {
        //                         IsActive: true,
        //                         IsForAllActivity: this.terms[0].isForAllActivity,
        //                         TermEndDate: this.terms[0].TermEndDate,
        //                         TermName: this.terms[0].TermName,
        //                         TermPayByDate: this.terms[0].TermPayByDate,
        //                         TermStartDate: this.terms[0].TermStartDate
        //                     };
        //                     this.schoolSession.StartDate = this.terms[0].TermStartDate;
        //                     this.schoolSession.EndDate = this.terms[0].TermEndDate;
        //                     this.schoolSession.PayByDate = this.terms[0].TermPayByDate;

        //                     this.schoolSession.NumberOfWeeks = this.commonService.calculateWeksBetweenDates(this.schoolSession.StartDate, this.schoolSession.EndDate);
        //                     this.schoolSession.FinancialYearKey = this.terms[0].FinancialYearKey;
        //                     this.getActivityList();
        //                 }
        //             }
        //         }
        //     }
        //     this.isTermsEmpty = this.terms.length > 0 ? false : true;
        // });
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
                if(this.terms.length >0){
                    this.getTermDetails(this.terms[0],0,false);                  
                    //this.getActivityList(0);
                }else{
                    this.selectedTerm = "";
                    this.commonService.toastMessage("No active terms found",2500,ToastMessageType.Error);
                }    
            },
           (error) => {
                // this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               //Handle the error here, you can display an error message or take appropriate action.
           })

    }

    GotoPaymentSetup() {
        this.isTermsEmpty = false;
        this.navCtrl.push("Type2Term");
    }

    skip() {
        this.isTermsEmpty = false;
    }

    getActivityList(term_index:number) {
        // let initialTermActivity = Array.isArray(this.terms[0].Activity) ? this.terms[0].Activity: this.commonService.convertFbObjectToArray(this.terms[0].Activity);
        // const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
        //     activity$Obs.unsubscribe();
        //     this.acType = data;
        //     this.types = [];
        //     if (data.length > 0) {
        //         for (let index = 0; index < this.acType.length; index++) {
        //             for (let count = 0; count < initialTermActivity.length; count++) {
        //                 if (initialTermActivity[count].Key == this.acType[index].$key) {
        //                     this.types.push(this.acType[index]);
        //                     break;
        //                 }
        //             }
        //         }
        //     }
        //     if (this.types.length != 0) {
        //         this.selectedActivityType = this.types[0].$key;
        //         this.activityObj = this.types[0];

        //         //
        //         //  Session Property initialization
        //         //
        //         this.schoolSession.ActivityKey = this.types[0].$key;
        //         this.schoolSession.Activity[this.schoolSession.ActivityKey] = {
        //             ActivityCode: this.activityObj.ActivityCode,
        //             ActivityName: this.activityObj.ActivityName,
        //             AliasName: this.activityObj.AliasName,
        //             IsActive: true,
        //             IsExistActivityCategory: this.types[0].IsExistActivityCategory

        //         }
        //         // #end


        //         this.getCoachListForGroup();

        //         if (!this.activityObj.IsExistActivityCategory) {
        //             this.isActivityCategoryExist = false;
        //             this.isExistActivitySubCategory = false;
        //         }

        //         if (this.activityObj.IsExistActivityCategory) {
        //             this.isActivityCategoryExist = true;
        //             this.getActivityCategoryList();
        //         }
        //     }
        // });
        this.club_activities = [];
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
                  //this.club_activities = res.data.getAllActivityByVenue as Activity[];
                  //console.log("clubs lists:", JSON.stringify(this.clubs));

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
                    console.log(`this.selectedActivityType:${this.selectedActivityType}`);
                    this.getCoachListForGroup();
                    this.getActivityCategoryList(); 
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
                  this.coachs = [];
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


    getActivityCategoryList() {
        this.activityCategoryList = [];
        // if (this.activityObj.ActivityCategory != undefined) {
        //     this.activityCategoryList = Array.isArray(this.activityObj.ActivityCategory) ? this.activityObj.ActivityCategory:this.commonService.convertFbObjectToArray(this.activityObj.ActivityCategory);
        //     this.selectActivityCategory = this.activityCategoryList[0].Key;
        //     this.activityCategoryObj = this.activityCategoryList[0];

        //     this.schoolSession.ActivityCategoryKey = this.selectActivityCategory;
        //     this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory = {};
        //     this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory] = {
        //         ActivityCategoryCode: this.activityCategoryObj.ActivityCategoryCode,
        //         ActivityCategoryName: this.activityCategoryObj.ActivityCategoryName,
        //         IsActive: true,
        //         IsExistActivitySubCategory: this.activityCategoryObj.IsExistActivitySubCategory
        //     }
        //     // #end


        //     this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
        //     if (this.activityCategoryObj.IsExistActivitySubCategory) {
        //         this.activitySubCategoryList = Array.isArray(this.activityCategoryObj.ActivitySubCategory) ? this.activityCategoryObj.ActivitySubCategory: this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
        //         this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;

        //         //
        //         //  Session Property initialization
        //         //
        //         this.schoolSession.ActivitySubCategoryKey = this.selectActivitySubCategory;
        //         this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory].ActivitySubCategory = {};
        //         this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory].ActivitySubCategory[this.selectActivitySubCategory] = {
        //             ActivitySubCategoryCode: this.activitySubCategoryList[0].ActivitySubCategoryCode,
        //             ActivitySubCategoryName: this.activitySubCategoryList[0].ActivitySubCategoryName,
        //             IsActive: true,
        //             IsEnable: true
        //         }

        //     }
        // }
        // else {
        //     this.selectedCoach = "";
        //     this.selectedCoachName = "";
        //     this.coachs = [];
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

    



    //onchange events
    onChangeOfSchool() {
        this.schoolSession.SchoolKey = this.selectedSchool;
        const school = this.schools.find(school => school.id == this.selectedSchool);
        this.schoolSession.SchoolName = school.school_name;
    }


    onChangeOfClub() {
        //
        //  Session Property initialization
        //
        this.schoolSession.ClubKey = this.selectedClub;
        // this.schoolSession.Term = {};
        // this.schoolSession.Activity = {};
        // this.schoolSession.TermKey = "";
        // this.schoolSession.ActivityCategoryKey = "";
        // this.schoolSession.ActivityKey = "";
        // this.schoolSession.ActivitySubCategoryKey = "";
        // this.schoolSession.CoachKey = "";
        // this.schoolSession.CoachName = "";
        // // #ends here
        // this.selectedTerm = "";
        // this.selectedActivityType = "";
        // this.selectedCoach = "";
        // this.selectActivityCategory = "";
        // this.selectActivitySubCategory = "";

        this.terms = [];
        this.types = [];
        this.coachs = [];
        this.club_activities = [];
        this.activityCategoryList = [];
        this.activitySubCategoryList = [];
        

        // this.getFinancialYearList();
        this.getTermList();
    }

    getTermDetails(term:FinancialYearTerms,term_inex:number,status:boolean = false){
        this.selectedTerm = term.term_id;
        this.schoolSession.TermKey = term.term_id;
        this.schoolSession.Term[this.schoolSession.TermKey] = {
            IsActive: true,
            IsForAllActivity: term.is_for_all_activity,
            TermEndDate: term.term_end_date,
            TermName: term.term_name,
            TermPayByDate: term.term_payby_date,
            TermStartDate: term.term_start_date
        };
        this.schoolSession.StartDate = term.term_start_date;
        this.schoolSession.EndDate = term.term_end_date;
        this.schoolSession.PayByDate = term.term_payby_date;
        this.schoolSession.NumberOfWeeks = this.commonService.calculateWeksBetweenDates(this.schoolSession.StartDate, this.schoolSession.EndDate);
        this.schoolSession.FinancialYearKey = term.financial_year_id;                     
        if(status){
            this.getActivityList(term_inex);              
        }
      }

    ///on change of term
    onChangeOfTerm() {
       
        let selectedIndex = 0;
        for (let i = 0; i < this.terms.length; i++) {
            if (this.terms[i].term_id == this.selectedTerm) {
                selectedIndex = i;
                break;
            }
        }
        if (this.terms.length > 0 && this.terms[selectedIndex].activities.length > 0) {
            this.getTermDetails(this.terms[selectedIndex],selectedIndex,true)
           
            //this.getActivityList(selectedIndex);
        }
    }

    onChangeActivity() {
        // this.activitySubCategoryList = [];
        // this.activityCategoryList = [];

        // this.selectedCoach = "";
        // this.selectActivityCategory = "";
        // this.coachs = [];
        // this.selectActivitySubCategory = "";

        //
        //  Session Property initialization
        //

        // this.schoolSession.Activity = {};
        // this.schoolSession.ActivityCategoryKey = "";
        // this.schoolSession.ActivityKey = "";
        // this.schoolSession.ActivitySubCategoryKey = "";
        // this.schoolSession.CoachKey = "";
        // this.schoolSession.CoachName = "";
        // #ends here


        // this.types.forEach(element => {
        //     if (element.$key == this.selectedActivityType) {
        //         this.activityObj = element;


        //         //
        //         //  Session Property initialization
        //         //
        //         this.schoolSession.ActivityKey = this.selectedActivityType;
        //         this.schoolSession.Activity[this.schoolSession.ActivityKey] = {
        //             ActivityCode: this.activityObj.ActivityCode,
        //             ActivityName: this.activityObj.ActivityName,
        //             AliasName: this.activityObj.AliasName,
        //             IsActive: true,
        //             IsExistActivityCategory: this.activityObj.IsExistActivityCategory

        //         }
        //         // #end




        //         this.getCoachListForGroup();

        //         if (!this.activityObj.IsExistActivityCategory) {
        //             this.isActivityCategoryExist = false;
        //             this.isExistActivitySubCategory = false;
        //         }

        //         if (this.activityObj.IsExistActivityCategory) {
        //             this.isActivityCategoryExist = true;
        //             this.getActivityCategoryList();
        //         }
        //     }
        // });
        //console.log(this.activityObj);
        this.getCoachListForGroup();
        this.getActivityCategoryList();
    }

    onChangePaymentType() {
        this.schoolSession.PaymentType = this.selectpaymenttype;
    }


    onChangeCoach() {
        //  Session Property initialization
        this.schoolSession.CoachKey = "";
        this.schoolSession.CoachName = "";
        // #end
        this.coachs.forEach(element => {
            if (element.CoachId == this.selectedCoach) {
                this.selectedCoachName = element.FirstName + " " + element.LastName;
                this.schoolSession.CoachKey = this.selectedCoach;
                this.schoolSession.CoachName = this.selectedCoachName;
            }
        });
    }

    onChangeActivityCategory() {
        //
        //  Session Property initialization
        //
        // if (this.schoolSession.ActivityKey != "" && this.schoolSession.ActivityKey != undefined) {
        //     this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory = {};
        //     this.schoolSession.ActivitySubCategoryKey = "";
        //     // #end

        //     this.activityCategoryList.forEach(element => {
        //         if (element.Key == this.selectActivityCategory) {
        //             this.activityCategoryObj = element;

        //             //
        //             //  Session Property initialization
        //             //
        //             this.schoolSession.ActivityCategoryKey = this.selectActivityCategory;
        //             this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory] = {
        //                 ActivityCategoryCode: this.activityCategoryObj.ActivityCategoryCode,
        //                 ActivityCategoryName: this.activityCategoryObj.ActivityCategoryName,
        //                 IsActive: true,
        //                 IsExistActivitySubCategory: this.activityCategoryObj.IsExistActivitySubCategory
        //             }

        //             // #end


        //             this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
        //             if (this.activityCategoryObj.IsExistActivitySubCategory) {
        //                 this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
        //                 this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;

        //                 this.schoolSession.ActivitySubCategoryKey = this.selectActivitySubCategory;
        //                 this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory].ActivitySubCategory = {};
        //                 this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory].ActivitySubCategory[this.selectActivitySubCategory] = {
        //                     ActivitySubCategoryCode: this.activitySubCategoryList[0].ActivitySubCategoryCode,
        //                     ActivitySubCategoryName: this.activitySubCategoryList[0].ActivitySubCategoryName,
        //                     IsActive: true,
        //                     IsEnable: true
        //                 }
 
        //            }
        //         }
        //     });
        // }
        this.getActivitySubCategoryList();
    }

    onChangeActivitySubCategory() {
        // this.schoolSession.ActivitySubCategoryKey = this.selectActivitySubCategory;
        // let activitySubCategory = this.activitySubCategoryList.find(subCatg => subCatg.Key == this.selectActivitySubCategory);
        // this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory].ActivitySubCategory = {};
        // this.schoolSession.Activity[this.schoolSession.ActivityKey].ActivityCategory[this.selectActivityCategory].ActivitySubCategory[this.selectActivitySubCategory] = {
        //     ActivitySubCategoryCode: activitySubCategory.ActivitySubCategoryCode,
        //     ActivitySubCategoryName: activitySubCategory.ActivitySubCategoryName,
        //     IsActive: true,
        //     IsEnable: true
        // }
        // console.log(this.schoolSession.Activity);
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
        if (this.schoolSession.Days == "") {
            this.schoolSession.Days += day;
        }
        else {
            this.schoolSession.Days += "," + day;
        }
    }
    validationForGroupSessionCreation() {
        if (this.selectedSchool == "" || this.selectedSchool == undefined) {
            let message = "Please select a school.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        if (this.selectedClub == "" || this.selectedClub == undefined) {
            let message = "Please select a venue.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
            let message = "Please select term for the session.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.selectedActivityType == "" || this.selectedActivityType == undefined) {
            let message = "Please select an activity for the session creation.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
            let message = "Please select a coach for the session creation.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.days.length == 0) {
            let message = "Please select a day for the session.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.schoolSession.SessionName == "" || this.schoolSession.SessionName == undefined) {
            let message = "Please enter session name.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.schoolSession.StartDate == "" || this.schoolSession.StartDate == undefined) {
            let message = "Please choose session start date.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.schoolSession.EndDate == "" || this.schoolSession.EndDate == undefined) {
            let message = "Please choose session end date.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        } else if (this.schoolSession.PayByDate == "" || this.schoolSession.PayByDate == undefined) {
            let message = "Please choose session pay by date.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }

        else if (this.schoolSession.StartTime == "" || this.schoolSession.StartTime == undefined) {
            let message = "Please choose session start time.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.schoolSession.Duration == "" || this.schoolSession.Duration == undefined) {
            let message = "Enter Session Duration in minutes.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.schoolSession.GroupSize == "" || this.schoolSession.GroupSize == undefined) {
            let message = "Enter group size for the session.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.schoolSession.SessionFee == "" || this.schoolSession.SessionFee == undefined) {
            let message = "Enter session fee for the session.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else if (this.selectpaymenttype == "") {
            let message = "Choose payment type";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        else {
            return true;
        }

    }

    cancelSessionCreation() {
        this.navCtrl.pop();
    }
    createSession() {

        this.schoolSession.Days = "";
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

        if (this.validationForGroupSessionCreation()) {
            let confirm = this.alertCtrl.create({
                //  title: 'Use this lightsaber?',
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
                            // this.schoolSession.CreatedDate = new Date().getTime();
                            // this.schoolSession.UpdatedDate = new Date().getTime();

                            // let returnKey = this.fb.saveReturningKey("SchoolSession/" + this.schoolSession.ParentClubKey, this.schoolSession);
                            // this.fb.update(returnKey.toString(), "/Coach/Type2/" + this.parentClubKey + "/" + this.schoolSession.CoachKey + "/SchoolSession/", this.schoolSession);

                            // let message = "Session Created successfully.";
                            // this.commonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
                            // this.commonService.updateCategory("school");
                            //this.navCtrl.pop();
                            this.saveSessionInPostgre();
                            
                        }
                    }
                ]
            });
            confirm.present();
        }


    }


    async saveSessionInPostgre(firebase_schoolses_id?) {
        // Define the URL for the POST request
    
        const scchoo_session_input = new CreateSchoolSession(this.schoolSession).school_session;
        scchoo_session_input.firebase_activity_categorykey = this.selectActivityCategory; //firebase
        scchoo_session_input.firebase_activity_subcategorykey = this.selectActivitySubCategory; //firebase
        scchoo_session_input.activity_category_name = this.activityCategoryList.find(category => category.ActivityCategoryId === this.selectActivityCategory).ActivityCategoryName;
        scchoo_session_input.activity_subcategory_name = this.activitySubCategoryList.find(sub_category => sub_category.ActivitySubCategoryId === this.selectActivitySubCategory).ActivitySubCategoryName;
        scchoo_session_input.updated_by = this.loggedin_user;
        scchoo_session_input.postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
        //scchoo_session_input.school_session.postgre_fields.parentclub_id = "78c25502-a302-4276-9460-2114db73de03";
        const coaches = [];coaches.push(this.selectedCoach)
        const activities = [];activities.push(this.selectedActivityType)
        scchoo_session_input.postgre_fields.coach_id = await this.getCoachIdsByFirebaseKeys(coaches);
        scchoo_session_input.postgre_fields.activity_id = await this.getActivityIdsByFirebaseKeys(activities);
        scchoo_session_input.postgre_fields.club_id = await this.getClubByFirebaseId(this.selectedClub);
        scchoo_session_input.postgre_fields.school_id = this.selectedSchool;
        scchoo_session_input.term_key = this.selectedTerm;
        scchoo_session_input.term_name = this.terms.find(term => term.term_id === this.selectedTerm).term_name;
        scchoo_session_input.firebase_fields.parentclub_id = this.parentClubKey;
        scchoo_session_input.firebase_schoolsession_id = firebase_schoolses_id || "";
        scchoo_session_input.firebase_fields.activity_id = this.selectedActivityType;
        scchoo_session_input.firebase_fields.club_id = this.selectedClub;
        scchoo_session_input.firebase_fields.coach_id = this.selectedCoach;
        scchoo_session_input.firebase_fields.school_id = this.selectedSchool;
        scchoo_session_input.is_exist_activity_category = this.isActivityCategoryExist
        scchoo_session_input.is_exist_activity_subcategory = this.isExistActivitySubCategory

        if(scchoo_session_input.postgre_fields.club_id == "" || scchoo_session_input.postgre_fields.club_id == undefined){
            this.commonService.toastMessage("Clubs fetch failed",2500,ToastMessageType.Error);
            return false;
        }
        if(scchoo_session_input.postgre_fields.activity_id == "" || scchoo_session_input.postgre_fields.activity_id == undefined){
            this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
            return false;
        }
        if(scchoo_session_input.postgre_fields.coach_id == "" || scchoo_session_input.postgre_fields.coach_id == undefined){
            this.commonService.toastMessage("Coaches fetch failed",2500,ToastMessageType.Error);
            return false;
        }

        // Set the headers (optional)
        const school_ses_mutation = gql`
        mutation createschoolSession($sessionInput: SchoolSessionDTO!) {
            createschoolSession(sessionInput: $sessionInput){
                id
                firebase_activitykey
                firebase_activity_subcategorykey
                session_name
                start_date
            }
        }` 
        
        const school_mutation_variable = { sessionInput: scchoo_session_input };
          this.graphqlService.mutate(
            school_ses_mutation, 
            school_mutation_variable,
            0
          ).subscribe((response)=>{
            const message = "Session created successfully. Please add member(s) to the session.";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
            this.commonService.updateCategory("update_scl_session_list");
            this.navCtrl.pop()
            //this.reinitializeSession();
          },(err)=>{
            this.commonService.toastMessage("Session creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }); 

        //http restapi call
        // let headers = new HttpHeaders()
        // //.set("Access-Control-Request-Headers", "application/json")
        // .set("content-type", "application/json")
        // //.set("authorizationToken", 'Ezo6gRmslc3ONopqv7zfV3SjOSFH6Mio2WeKujCf')
        // .set("x-api-key", this.sharedservice.getGroupSessionAPiKey());
        // this.http.post(`${this.sharedservice.getGroupSessionsURL()}/session/createsessioninpostgres`,
        // this.postgre_session_input,{headers:headers}).subscribe((data) => {
        //   // this.commonService.hideLoader();
        //   // let message = "Session created successfully. Please add member(s) to the session.";
        //   // this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        //   // this.reinitializeSession();
        //   console.log(JSON.stringify(data));
        // }, err => {
        //   //this.commonService.hideLoader();
        //   console.log(JSON.stringify(err));
        //   //this.commonService.toastMessage("Session creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        // })
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
    
      
    dateChanged() {
        if (this.validateSessionDate()) {
            this.schoolSession.NumberOfWeeks = this.commonService.calculateWeksBetweenDates(this.schoolSession.StartDate, this.schoolSession.EndDate);

            // this.inputChanged();
        } else {
            this.schoolSession.StartDate = this.schoolSession.EndDate;
            this.schoolSession.EndDate = this.schoolSession.EndDate;
            this.schoolSession.NumberOfWeeks = this.commonService.calculateWeksBetweenDates(this.schoolSession.StartDate, this.schoolSession.EndDate);
            // this.inputChanged();
        }

    }
    validateSessionDate() {
        if (new Date(this.schoolSession.StartDate).getTime() > new Date(this.schoolSession.EndDate).getTime()) {
            this.commonService.toastMessage("Session start date should be greater than end date.",2500,ToastMessageType.Error);
            return false;
        }
        return true;
    }


    // inputChanged() {
    //     this.schoolSession.SessionFee = parseFloat((this.schoolSession.NumberOfWeeks * parseFloat(this.schoolSession.FeesPerDayForMember)).toFixed(2)).toFixed(2);
    //     // this.sessionDetails.SessionFeeForNonMember = parseFloat((this.sessionDetails.NoOfWeeks * parseFloat(this.sessionDetails.FeesPerDayForNonMember)).toFixed(2)).toFixed(2);
    //     // this.sessionDetails.SessionFee = isNaN(parseFloat(this.sessionDetails.SessionFee)) ? "" : this.sessionDetails.SessionFee;
    //     // this.sessionDetails.SessionFeeForNonMember = isNaN(parseFloat(this.sessionDetails.SessionFeeForNonMember)) ? "" : this.sessionDetails.SessionFeeForNonMember;
    // }




}
