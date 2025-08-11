import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { SchoolDetails, SchoolVenue } from './schoolsession.model';
import { EditSchoolSession } from './dto/edit_school_session.dto';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { Activity, ActivityCategory, ActivityCoach, ActivityInfoInput, ActivitySubCategory, ClubActivityInput, IClubDetails } from '../../../shared/model/club.model';
import { FinancialYearTerms } from '../../../shared/model/financial_terms.model';

@IonicPage()
@Component({
    selector: 'editschoolsessiondetials-page',
    templateUrl: 'editschoolsessiondetials.html',
})

export class Type2EditSchoolSessionDetails {

    parentClubKey: any;
    themeType: number;
    selectedSchool: string = "";
    school_session:SchoolDetails;
    clubs:IClubDetails[] = [];
    coachs:ActivityCoach[] = [];
    selectedClub: string = "";
    financialYears:FinancialYearTerms[] = [] = [];
    club_activities:Activity[] = [];
    currentFinancialYear: string = "";
    terms:FinancialYearTerms[] = [];
    selectedTerm: string = "";
    acType = [];
    types:Activity[] = [];
    selectedActivityType = "";
    isExistActivitySubCategory = false;
    isActivityCategoryExist = false;
    activityCategoryList:ActivityCategory[] = [];
    selectActivityCategory = "";
    activityCategoryObj: any = "";
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
    edit_school_session:EditSchoolSession = {
        user_device_metadata:{
            UserAppType:0,
            UserDeviceType:0
        },
        user_postgre_metadata:{
            UserMemberId:""
        },
        no_of_weeks:0,
        school_session_id: '',
        member_fee: '',
        non_member_fee: '',
        coach_id: '', //can be postgre or firebase, Can decide by req_type
        days: '',
        school_session_name: '',
        start_date: '',
        end_date: '',
        pay_by_date: '',
        group_status: '1',
        start_time: '',
        duration: '60',
        group_size: 20,
        comments: '',
        auto_enrolment: true,
        allow_childcare: true,
        button_text_for_booking: '',
        button_text_for_reserve: '',
        updated_by: ''
    };
    schools: SchoolVenue[] = []
    schoolSession = {
        $key: '',
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
        AllowChildCare:null,
        IsAllMembertoEditAmendsFees:false
    }
    maxDate = "";
    oldCoachKey = "";

    constructor(public commonService: CommonService, 
         public loadingCtrl: LoadingController, 
         public alertCtrl: AlertController,
         public navParams: NavParams,  
         public fb: FirebaseService, public navCtrl: NavController,
         public popoverCtrl: PopoverController,
         private storage: Storage,
         private sharedservice: SharedServices, 
         private graphqlService: GraphqlService,
        ) {
        this.edit_school_session = EditSchoolSession.getSchoolSessionForEdit(<SchoolDetails>this.navParams.get("SchoolSession"));
        this.school_session = <SchoolDetails>this.navParams.get("SchoolSession");
        if (this.edit_school_session != undefined) {
            this.themeType = sharedservice.getThemeType();
            this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
            this.themeType = sharedservice.getThemeType();
            this.storage.get('userObj').then((val) => {
                val = JSON.parse(val);
                if (val.$key != "") {
                    this.parentClubKey = val.UserInfo[0].ParentClubKey;
                    this.getClubList();
                    this.getSchools();
                    //this.getFinancialYearList();
                    this.getTermList();
                    this.getCoachListForGroup();
                    this.getActivityCategoryList();
                    this.getActivitySubCategoryList();
                }
            })
            this.isActivityCategoryExist = this.school_session.firebase_activity_categorykey ? true:false
            this.isExistActivitySubCategory = this.school_session.firebase_activity_subcategorykey ? true:false;
            this.parentClubKey = this.school_session.ParentClubSchool.parentclub.FireBaseId;
            //initialization 
            this.selectedSchool = this.school_session.ParentClubSchool.school.id;
            this.selectedClub = this.school_session.ClubDetails.FirebaseId;
            this.currentFinancialYear = this.school_session.financial_yearkey;
            this.selectedTerm = this.school_session.term_key;
            this.selectedActivityType = this.school_session.ActivityDetails.FirebaseActivityKey;
            this.selectedCoach = this.school_session.CoachDetails[0].coach_firebase_id;
            //this.selectedCoachName = this.schoolSession.CoachName;
            this.selectActivityCategory = this.school_session.firebase_activity_categorykey;
            this.selectActivitySubCategory = this.school_session.firebase_activity_subcategorykey;
            //this.selectpaymenttype = this.schoolSession.PaymentType;
            //this.schoolSession.AllowChildCare = this.schoolSession.AllowChildCare!=undefined ? this.schoolSession.AllowChildCare:true;
            //this.schoolSession.IsAllMembertoEditAmendsFees = this.schoolSession.IsAllMembertoEditAmendsFees!=undefined ? this.schoolSession.IsAllMembertoEditAmendsFees:false;
            //const x = this.schoolSession.Days.split(",");
            const x = this.edit_school_session.days.split(",");
            for (let i = 0; i < this.edit_school_session.days.length; i++) {
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
                this.selectedSchool = this.school_session.ParentClubSchool.school.id;
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
                if(this.terms.length > 0){
                    this.getActivityList();
                } else{
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

    cancelSessionCreation() {
        this.navCtrl.pop();
    }
    onChangeCoach() {

        this.coachs.forEach(element => {
            if (element.CoachId == this.selectedCoach) {
                this.selectedCoachName = element.FirstName + " " + element.LastName;
            }
        });
    }
    onChangePaymentType() {
        this.schoolSession.PaymentType = this.selectpaymenttype;
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
              value:this.edit_school_session.group_size.toString(),
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
        mutation updateSchoolSessionCapacity($groupSizeInput: SchoolCapacityUpdateInput!) {
            updateSchoolSessionCapacity(capacity_update: $groupSizeInput){
            updated_capacity
            updated_capacity_left
          }
        }` 
        
        const groupSizeInput = {
          session_id:this.edit_school_session.school_session_id,
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
          this.edit_school_session.group_size = res.data.updateSchoolSessionCapacity.updated_capacity;
        },(err)=>{
          this.commonService.toastMessage("Group size updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        });    
    }


    updateSession() {
        let alert = this.alertCtrl.create({
            subTitle: 'Update session',
            message: 'Are you sure you want to update?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {

                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.updateSchoolSession();
                    }
                }
            ]
        });
        alert.present();
    }


    selectedDayDetails(day) {
        if (this.schoolSession.Days == "") {
            this.schoolSession.Days += day;
        }
        else {
            this.schoolSession.Days += "," + day;
        }
    }
    async updateSchoolSession() {
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
        let sessionKey = this.schoolSession.$key;
       
        this.edit_school_session.days = this.schoolSession.Days;
        this.edit_school_session.non_member_fee = this.edit_school_session.member_fee;
        this.edit_school_session.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform()=="android" ? 1:2;
        this.edit_school_session.user_device_metadata.UserAppType = 0;
        this.edit_school_session.user_postgre_metadata.UserMemberId = this.sharedservice.getLoggedInId();
        this.edit_school_session.group_size = Number(this.edit_school_session.group_size);
        this.edit_school_session.no_of_weeks = Number(this.edit_school_session.no_of_weeks);
        //this.edit_school_session.group_size = Number(this.edit_school_session.group_size);
        this.edit_school_session.coach_id = await this.getCoachIdsByFirebaseKeys(this.selectedCoach);
        this.updateSchoolSessionInPostgre();
    }


    updateSchoolSessionInPostgre(){
        console.table(this.edit_school_session);

        this.commonService.showLoader("Please wait");
        const school_ses_mutation = gql`
        mutation updateSchoolSession($sessionInput: UpdateSchoolSessionDTO!) {
            updateSchoolSession(sessionInputDetails: $sessionInput){
                id
            }
        }` 
        
        const school_mutation_variable = { sessionInput: this.edit_school_session };
          this.graphqlService.mutate(
            school_ses_mutation, 
            school_mutation_variable,
            0
          ).subscribe((response)=>{
            this.commonService.hideLoader();
            this.commonService.updateCategory("update_scl_session_list");
            this.commonService.toastMessage("School session updated succesfully.",2500);
            this.navCtrl.pop();
          },(err)=>{
            this.commonService.hideLoader();
            this.commonService.toastMessage("Session creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }); 
    }


    async getCoachIdsByFirebaseKeys(coach_ids):Promise<any>{
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



}
