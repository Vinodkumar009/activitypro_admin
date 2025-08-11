import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, PopoverController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from 'graphql-tag';
import { CopySchoolSession,SchoolSessionDTO } from '../dto/create_school_session.dto';
import { SchoolDetails, SchoolVenue } from '../schoolsession.model';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../../shared/model/club.model';
import { FinancialYearTerms } from '../../../../shared/model/financial_terms.model';
/**
 * Generated class for the CopyschoolsessionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-copyschoolsession',
  templateUrl: 'copyschoolsession.html',
  providers:[GraphqlService]
})
export class CopyschoolsessionPage {
  parentClubKey: any;
    themeType: number;
    schools = [];
    selectedSchool: string = "";
    clubs:IClubDetails[] = [];
    club_activities:Activity[] = [];
    selectedClub: string = "";
    financialYears = [];
    currentFinancialYear: string = "";
    terms:FinancialYearTerms[] = [];
    coachs:ActivityCoach[] = [];
    selectedTerm: string = "";
    acType = [];
    types = [];
    selectedActivityType = "";
    isExistActivitySubCategory:boolean = false;
    isActivityCategoryExist:boolean = false;
    activityCategoryList:ActivityCategory[] = [];
    selectActivityCategory = "";
    activityCategoryObj: any;
    selectActivitySubCategory = "";
    activitySubCategoryList = [];
    selectedCoach = "";
    selectedCoachName = "";
    

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
    selectpaymenttype: string = '';
    schoolSession = {
        CreatedDate: 0,
        UpdatedDate: 0,
        CreatedBy: '',
        UpdatedBy: '',
        SessionName: 'Session',
        StartTime: '',
        IsActive: true,
        SchoolKey: "",
        SchoolName: '',
        ParentClubKey: '',
        ClubKey: '',
        FinancialYearKey: '',
        TermKey: '',
        Term: {},
        StartDate: '',
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
        GroupSize: '10',
        Comments: '',
        SessionFee: '7.00',
        BookingButtonText: 'Book Now',
        ReserveButtonText: 'Add to Waiting List',
        AutoEnrolment: true,
        NumberOfWeeks: 0,
        PaymentType: '',
        // NoOfWeeks: 0,
    }
    school_session:SchoolSessionDTO;
    member_ids:string[] = [];
    maxDate = "";
    minuteValues = "00";
    preSessionInfo:SchoolDetails;
    dayMap:Map<string,any> = new Map();
    preSessionMemberObj:Array<any> = [];
    constructor(public commonService: CommonService, 
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController, 
        public navParams: NavParams, 
        storage: Storage, 
        public fb: FirebaseService, 
        public navCtrl: NavController,
        public sharedservice: SharedServices,
        private graphqlService: GraphqlService, 
        public popoverCtrl: PopoverController) {
        
      this.preSessionInfo = <SchoolDetails>this.navParams.get('SchoolSession'); 
      this.school_session = CopySchoolSession.getSchoolSessionForCopy(this.navParams.get("SchoolSession"));
      console.log(this.preSessionInfo);
      this.isActivityCategoryExist = this.preSessionInfo.firebase_activity_categorykey ? true:false;
      this.isExistActivitySubCategory = this.preSessionInfo.firebase_activity_categorykey ? true:false;

      this.selectedSchool = this.preSessionInfo.ParentClubSchool.school.id;
      this.selectedClub = this.preSessionInfo.ClubDetails.FirebaseId;
      this.currentFinancialYear = this.preSessionInfo.financial_yearkey;
      this.selectedTerm = this.school_session.term_key;
      this.selectedActivityType = this.preSessionInfo.ActivityDetails.FirebaseActivityKey;
      this.selectedCoach = this.preSessionInfo.CoachDetails[0].coach_firebase_id;
      //this.selectedCoachName = this.schoolSession.CoachName;
      this.selectActivityCategory = this.school_session.firebase_activity_categorykey;
      this.selectActivitySubCategory = this.school_session.firebase_activity_subcategorykey;

    //   this.schoolSession.StartTime = this.preSessionInfo.StartTime;
    //   this.schoolSession.Duration = this.preSessionInfo.Duration;
    //   this.schoolSession.NumberOfWeeks = this.preSessionInfo.NumberOfWeeks;
    //   this.selectpaymenttype = this.preSessionInfo.PaymentType;
    //   this.schoolSession.PaymentType = this.selectpaymenttype;
    //   this.schoolSession.Comments = this.preSessionInfo.Comments;
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey =  val.UserInfo[0].ParentClubKey;
                this.school_session.updated_by = this.sharedservice.getLoggedInId();
                //Session Prop
                this.schoolSession.ParentClubKey = this.parentClubKey;
                this.schoolSession.CreatedBy = this.parentClubKey;
                
                this.getClubList();
                this.getSchools();

                this.getTermList();
                this.getCoachListForGroup();
                this.getActivityCategoryList();
                this.getActivitySubCategoryList();
            }
        })
        //let avlableDays:Array<any> = this.school_session.days.split(",");
        const x = this.school_session.days.split(",");
        for (let i = 0; i < this.school_session.days.length; i++) {
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
    
        let temp = "";
        for(let i = 1 ; i < 60 ; i++){
          if(i % 15 == 0){
            this.minuteValues += "," +i;
          }
        }
        this.themeType = sharedservice.getThemeType();
        this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
        this.themeType = sharedservice.getThemeType();
        
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
                    this.selectedSchool = this.preSessionInfo.ParentClubSchool.school.id;
                }
            },
           (error) => {
                // this.commonService.hideLoader();
                   console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
    }


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
          this.graphqlService.query(clubs_query,{firebase_parentclubId: this.parentClubKey},0)
            .subscribe((res: any) => {
                this.clubs = res.data.getParentClubVenues as IClubDetails[];
                console.log("clubs lists:", JSON.stringify(this.clubs));
                //if(this.clubs.length >0) this.selectedClub = this.preSessionInfo.ClubDetails.FirebaseId;
                //this.getTermList();
            },
           (error) => {
                // this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
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
                if(this.terms.length >0){
                    //this.selectedTerm = this.preSessionInfo.term_key;
                    //this.schoolSession.TermKey = this.terms[0].term_id;
                    this.schoolSession.NumberOfWeeks = this.commonService.calculateWeksBetweenDates(this.schoolSession.StartDate, this.schoolSession.EndDate);
                    //this.schoolSession.FinancialYearKey = this.terms[0].financial_year_id;                            
                    this.getActivityList();
                }else{
                    this.commonService.toastMessage("No active terms found",2500,ToastMessageType.Error);
                }    
            },
           (error) => {
                // this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               //Handle the error here, you can display an error message or take appropriate action.
           })
    }

   


    getActivityList() {
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
                    for (let count = 0; count < this.terms[0].activities.length; count++) {
                        if (this.terms[0].activities[count] == res.data.getAllActivityByVenue[index].ActivityKey) {
                            this.club_activities.push(res.data.getAllActivityByVenue[index]);
                            break;
                        }
                    }
                 }
                 if(this.club_activities.length > 0){
                    //this.selectedActivityType = this.preSessionInfo.ActivityDetails.FirebaseActivityKey;
                    // this.getCoachListForGroup();
                    //this.getActivityCategoryList(); 
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
                    //this.selectedCoach = this.coachs[0].CoachId;
                    //this.selectedCoachName = this.coachs[0].FirstName+" "+this.coachs[0].LastName;
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
                    //this.selectActivityCategory = this.activityCategoryList[0].ActivityCategoryId;
                    //this.getActivitySubCategoryList();
                  }else{
                    this.isActivityCategoryExist = false;
                    this.selectedCoach = "";
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
                this.isExistActivitySubCategory = true;
                //this.selectActivitySubCategory = this.activitySubCategoryList[0].ActivitySubCategoryId;
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
        this.schools.forEach(element => {
            if (element.$key == this.selectedSchool) {
                this.schoolSession.SchoolName = element.SchoolName;
            }
        });
    }


    onChangeOfClub() {

        //
        //  Session Property initialization
        //

        this.schoolSession.ClubKey = this.selectedClub;
        this.schoolSession.Term = {};
        this.schoolSession.Activity = {};
        this.schoolSession.TermKey = "";
        this.schoolSession.ActivityCategoryKey = "";
        this.schoolSession.ActivityKey = "";
        this.schoolSession.ActivitySubCategoryKey = "";
        this.schoolSession.CoachKey = "";
        this.schoolSession.CoachName = "";

        // #ends here

        this.selectedTerm = "";
        this.selectedActivityType = "";
        this.selectedCoach = "";
        this.selectActivityCategory = "";

        this.terms = [];
        this.types = [];
        this.coachs = [];
        this.activityCategoryList = [];
        this.activitySubCategoryList = [];
        this.selectActivitySubCategory = "";

        // this.getFinancialYearList();
        this.getTermList();
    }


    ///on change of term
    onChangeOfTerm() {
        this.selectedActivityType = "";
        this.selectedCoach = "";
        this.selectActivityCategory = "";

        this.types = [];
        this.club_activities = [];
        this.coachs = [];
        this.activityCategoryList = [];
        this.activitySubCategoryList = [];
        this.selectActivitySubCategory = "";
        //
        //  Session Property initialization
        //
        this.schoolSession.Term = {};
        this.schoolSession.Activity = {};
        this.schoolSession.TermKey = "";
        this.schoolSession.ActivityCategoryKey = "";
        this.schoolSession.ActivityKey = "";
        this.schoolSession.ActivitySubCategoryKey = "";
        this.schoolSession.CoachKey = "";
        this.schoolSession.CoachName = "";
        // #ends here
        let selectedIndex = 0;
        for (let i = 0; i < this.terms.length; i++) {
            if (this.terms[i].term_id == this.selectedTerm) {
                selectedIndex = i;
                break;
            }
        }
        if (this.terms.length > 0 && this.terms[selectedIndex].activities.length > 0) {

            this.getActivityList();
        }
    }

    onChangeActivity() {
        // this.activitySubCategoryList = [];
        // this.activityCategoryList = [];

        // this.selectedCoach = "";
        // this.selectActivityCategory = "";
        // this.coachs = [];
        // this.activityCategoryList = [];
        // this.activitySubCategoryList = [];
        // this.selectActivitySubCategory = ""
        //
        //  Session Property initialization
        //
        this.schoolSession.Activity = {};
        this.schoolSession.ActivityCategoryKey = "";
        this.schoolSession.ActivityKey = "";
        this.schoolSession.ActivitySubCategoryKey = "";
        this.schoolSession.CoachKey = "";
        this.schoolSession.CoachName = "";
        // #ends here
        this.getCoachListForGroup();
        this.getActivityCategoryList();
        //console.log(this.activityObj);
    }

    onChangePaymentType() {
        this.schoolSession.PaymentType = this.selectpaymenttype;
    }


    onChangeCoach() {
        //
        //  Session Property initialization
        //
        this.schoolSession.CoachKey = "";
        this.schoolSession.CoachName = "";
        // #end

        this.coachs.forEach(element => {
            if (element.CoachId == this.selectedCoach) {
                this.selectedCoachName = element.FirstName + "  " + element.LastName;
                this.schoolSession.CoachKey = this.selectedCoach;
                this.schoolSession.CoachName = this.selectedCoachName;
                // #end

            }
        });
    }
    onChangeActivityCategory() {
        //
        //  Session Property initialization
        this.getActivitySubCategoryList();
    }

    onChangeActivitySubCategory() {
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
        if (this.school_session.days == "") {
            this.school_session.days += day;
        }
        else {
            this.school_session.days += "," + day;
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
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
            let message = "Please select term for the session.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.selectedActivityType == "" || this.selectedActivityType == undefined) {
            let message = "Please select an activity for the session creation.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
            let message = "Please select a coach for the session creation.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.days.length == 0) {
            let message = "Please select a day for the session.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.school_session.school_session_name == "" || this.school_session.school_session_name == undefined) {
            let message = "Please enter session name.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.school_session.start_date == "" || this.school_session.start_date == undefined) {
            let message = "Please choose session start date.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.school_session.end_date == "" || this.school_session.end_date == undefined) {
            let message = "Please choose session end date.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        } else if (this.school_session.pay_by_date == "" || this.school_session.pay_by_date == undefined) {
            let message = "Please choose session pay by date.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }

        else if (this.school_session.start_time == "" || this.school_session.start_time == undefined) {
            let message = "Please choose session start time.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.school_session.duration == "" || this.school_session.duration == undefined) {
            let message = "Enter Session Duration in minutes.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.school_session.group_size == 0 || this.school_session.group_size == undefined) {
            let message = "Enter group size for the session.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        else if (this.school_session.session_fee == "" || this.school_session.session_fee == undefined) {
            let message = "Enter session fee for the session.";
            this.commonService.toastMessage(message,ToastMessageType.Error);
            return false;
        }
        // else if (this.selectpaymenttype == "") {
        //     let message = "Choose payment type";
        //     this.commonService.toastMessage(message,ToastMessageType.Error);
        //     return false;
        // }
        else {
            return true;
        }

    }

    cancelSessionCreation() {
        this.navCtrl.pop();
    }

    createSession() {
        this.school_session.days = "";
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

        //if (this.validationForGroupSessionCreation()) {
            let confirm = this.alertCtrl.create({
                title: 'Copy Member?',
                message: 'Are you sure you want to copy the members?',
                buttons: [
                    {
                        text: "Don't copy",
                        handler: () => {
                            if(this.validationForGroupSessionCreation()){
                                this.generateSession()
                            }
                        }
                    },
                    {
                        text: 'Copy',
                        handler: () => {
                            if(this.validationForGroupSessionCreation()){
                                this.getPreSessionMemberdetails();
                            }
                        
                        }
                    }
                ]
            });
            confirm.present();
        //}

    }


    generateSession(){
        // console.log(this.preSessionInfo);
        // this.fb.deleteFromFb("/Coach/Type2/" + this.parentClubKey + "/" + this.schoolSession.CoachKey + "/SchoolSession/"+this.preSessionInfo.$key);
        // for(let i = 0 ; i < this.preSessionInfo.Member.length ;i++){
        //     if(this.preSessionInfo.Member[i].IsSchoolMember){
        //         this.fb.deleteFromFb("SchoolMember/"+this.schoolSession.ParentClubKey+"/"+this.preSessionInfo.Member[i].Key+"/SchoolSession/"+this.preSessionInfo.$key);
        //     }else{
        //         this.fb.deleteFromFb("Member/"+this.schoolSession.ParentClubKey+"/"+this.schoolSession.ClubKey+"/"+this.preSessionInfo.Member[i].Key+"/SchoolSession/"+this.preSessionInfo.$key);
        //     }
        // }
    
        this.copySchoolSession();
    }


    async copySchoolSession(){
        try{
            this.commonService.showLoader("Please wait");
            this.school_session.fee_for_nonmember = this.school_session.session_fee;
            this.school_session.group_size = Number(this.school_session.group_size);
            this.school_session.number_of_weeks = Number(this.school_session.number_of_weeks);
            this.school_session.postgre_fields.school_id = this.selectedSchool;
            this.school_session.postgre_fields.club_id = this.clubs.find(x => x.FirebaseId == this.selectedClub).Id;
            this.school_session.postgre_fields.activity_id = await this.getActivityIdsByFirebaseKeys([this.selectedActivityType]);
            this.school_session.postgre_fields.coach_id = await this.getCoachIdsByFirebaseKeys([this.selectedCoach]);
            this.school_session.firebase_fields.activity_id = this.selectedActivityType;
            this.school_session.firebase_fields.coach_id = this.selectedCoach;
            this.school_session.firebase_fields.club_id = this.selectedClub;
            this.school_session.firebase_fields.school_id = this.schools.find(school => school.id === this.selectedSchool).firebasekey;
            
            this.school_session.term_key = this.selectedTerm;
            //this.school_session.term_name = this.terms.find(x => x.Key == this.selectedTerm).TermName;
            this.school_session.term_name = "";
            this.school_session.firebase_activity_categorykey = this.selectActivityCategory;
            this.school_session.firebase_activity_subcategorykey = this.selectActivitySubCategory;
            this.school_session.activity_category_name = this.activityCategoryList.find(act_category => act_category.ActivityCategoryId == this.selectActivityCategory).ActivityCategoryName;
            this.school_session.activity_subcategory_name  = this.activitySubCategoryList.find(act_sub_category => act_sub_category.ActivitySubCategoryId == this.selectActivitySubCategory).ActivitySubCategoryName;
            console.table(this.school_session);
            const copy_ses_mutation = gql`
            mutation copySchoolSession($sessionInput: CopySchoolSessionDTO!) {
                copySchoolSession(copyInput: $sessionInput){
                    id
                    firebase_sessionkey
                    firebase_clubkey
                    firebase_parentclubkey
                    firebasepath
                }
            }` 
            
            const copy_schoolsession_variable = { sessionInput: {session_info:this.school_session,enrol_member_ids:this.member_ids} };
              this.graphqlService.mutate(
                copy_ses_mutation, 
                copy_schoolsession_variable,
                0
              ).subscribe((response)=>{
               this.commonService.hideLoader();
                let message = "Session Copied successfully.";
                this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
                this.commonService.updateCategory("update_scl_session_list");
                this.commonService.toastMessage(message,3000,ToastMessageType.Success,ToastPlacement.Bottom);
                //this.reinitializeSession();
              },(err)=>{
                    console.log(err);
                this.commonService.hideLoader();
                this.commonService.toastMessage("Session copy failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              })
        }catch(e){
            console.log(e);
            this.commonService.hideLoader();
            this.commonService.toastMessage("Session copy failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        
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
            this.commonService.toastMessage("Session start date should be greater than end date.",2500);
            return false;
        }
        return true;
    }
   
    getPreSessionMemberdetails(){
    //    if(this.preSessionInfo.Member != undefined){
    //     this.preSessionMemberObj= JSON.parse(JSON.stringify(this.preSessionInfo.Member));
    //    }
    //     if(this.preSessionMemberObj != undefined && this.preSessionMemberObj.length == undefined){

    //         this.preSessionMemberObj = this.commonService.convertFbObjectToArray(this.preSessionMemberObj);
    //         this.preSessionInfo.Member = this.commonService.convertFbObjectToArray(this.preSessionInfo.Member);
    //     }
    //     let prepareMemberObj = {};
    //     this.preSessionMemberObj.forEach((member) =>{
    //         member['AmountDue'] = this.schoolSession['SessionFee'];
    //         member['AmountPaid'] = '0.00';
    //         member['AmountPayStatus'] = "Due";
    //         prepareMemberObj[member.Key] = member;
          
    //         if(member.TransactionDate != undefined){
    //             delete prepareMemberObj[member.Key]['TransactionDate'];
    //         }
    //         if(member.TransactionNo != undefined){
    //             delete prepareMemberObj[member.Key]['TransactionNo'];
    //         }
    //         delete prepareMemberObj[member.Key]['Key'];
    //     });
    //     this.schoolSession['Member'] = prepareMemberObj;
        this.member_ids = this.preSessionInfo.session_member.map(member_dets => member_dets.member.Id);
        this.generateSession();
    }
}
