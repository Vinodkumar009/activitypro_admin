import { FirebaseService } from '../../../../services/firebase.service';
// import { Member } from './../../Model/MemberModel';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, ActionSheetController, LoadingController, FabContainer } from 'ionic-angular';
import { CommonService, ToastMessageType,ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { CallNumber } from '@ionic-native/call-number';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../services/sharedservice';
import { ISessionMember, ISession_MemberEnrols, SchoolDetails } from '../schoolsession.model';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from 'graphql-tag';
import { SchoolSesEnrolDets } from '../addmembertoschoolsession';
import { ModuleTypes } from '../../../../shared/constants/module.constants';
/**
 * Generated class for the GroupsessiondetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-eachsessiondetails',
    templateUrl: 'eachsessiondetails.html',
})
export class EachSessionDetailsPage {
    @ViewChild("fab") fab: FabContainer;
    schoolDetails:SchoolDetails;
    sessionDetails: any;
    sessionBookedStartTime: string;
    sessionBookedEndTime: any;
    endDate: string;
    startDate: string;
    sessionMemberAndPrice = {
        NumberOfMemberPaid: 0,
        NumberOfMemberEnrolled: 0,
        TotalAmount: 0,
        AmountPaid: 0
    }
    enrolledMemberInsession: any[];
    userData: SharedServices;
    currencyDetails: any;
    isShowDelete = true;
    MemberListsForDeviceToken = [];
    clubs: any[];
    selectedClub: any;
    school_session_id:string;
    memberEnrolDetails: ISession_MemberEnrols[];
    schoolSesEnrolDets: SchoolSesEnrolDets = {
        ParentClubKey: '',
        ClubKey: '',
        MemberKey: '',
        AppType: 0,
        ActionType: 0,
        DeviceType: 0,
        get_payments: false,
        school_session_id: '',
        parent_fireabse_id: '',
        updated_by: '',
        enrol_users: []
    }
    loggedin_key:string;
    loggedin_type:number = 2;
    can_coach_see_revenue:boolean = true;
    constructor(
        public loadingCtrl: LoadingController,
        public callNumber: CallNumber,
        public platform: Platform,
        public actionSheetCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public fb: FirebaseService,
        public storage: Storage,
        public http: HttpClient,
        public navCtrl: NavController,
        public navParams: NavParams,
        public commonService: CommonService,
        public sharedServices: SharedServices,
        private graphqlService: GraphqlService
    ) {
       
    }

    ionViewWillEnter(){
        this.school_session_id = this.navParams.get("sessionObj").id;
        this.loggedin_type = this.sharedServices.getLoggedInType();
        if(this.loggedin_type === 4){
              this.can_coach_see_revenue = this.sharedServices.getCanCoachSeeRevenue();
        }
        this.getSchoolSessionDetails();
        // this.storage.get("userObj").then((val) => {
        //     val = JSON.parse(val);
        //     if (val.$key != "") {
        //      this.schoolSesEnrolDets.updated_by = val.$key;
        //      this.loggedin_key = val.$key;
        //     }
        // });
        this.schoolSesEnrolDets.updated_by = this.sharedServices.getLoggedInId();
        this.loggedin_key = this.sharedServices.getLoggedInId();
        this.storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        }).catch(error => {});
    
    }


    //getting school session details
    getSchoolSessionDetails() {
        //  this.commonService.showLoader(".....Please wait");
        //  is_exist_activity_category
        //  is_exist_activity_subcategory
          const schoolSessionDetails = gql`
          query  getSchoolSession($school_session_id: String!,$AppType:Float){
            getSchoolSession(school_session_id:$school_session_id,AppType:$AppType){
                id
                tot_enrol_count
                tot_amount
                paid_count
                pending_count
                tot_paid_amount
                tot_unpaid_amount
                school_session_name
                pay_by_date
                start_date
                end_date
                start_time
                end_time
                duration
                days
                group_size
                group_status
                member_fee
                non_member_fee
                financial_yearkey
                term_key
                term_name
                number_of_week
                capacity_left
                comments
                auto_enrolment
                is_allow_paylater
                is_allow_groupchat
                show_in_apkids
                member_visibility
                allow_childcare
                is_loyalty_allowed
                is_fixedloyalty_allowed
                fixed_loyalty_points
                allow_waitinglist
                is_allmember_to_edit_amendfees
                waitinglist_capacity
                is_exist_activitycategory
                is_exist_activity_subcategory
                firebase_activity_categorykey
                firebase_activity_subcategorykey
                activity_category_name
                activity_subcategory_name
                button_text_for_booking
                button_text_for_reserve
                coach_names
                ClubDetails{
                    Id
                    ClubName
                    FirebaseId
                }
                ActivityDetails{
                    Id
                    ActivityName
                    ActivityCode
                    FirebaseActivityKey
                }
                CoachDetails{
                    Id
                    first_name
                    last_name
                    profile_image
                    coach_firebase_id
                }
                Images{
                    id
                    image_url
                }
                ParentClubSchool{
                    parentclub{
                      Id
                      FireBaseId
                    }
                    school{
                      id
                      school_name
                    }
                }
                session_member{
                    id
                    passcode
                    member{
                      Id
                      FirstName
                      LastName
                      DOB
                      Gender
                      MedicalCondition
                      FirebaseKey
                      ParentEmailID
                      ParentPhoneNumber
                      EmailID
                      PhoneNumber
                      ParentId 
                      IsChild
                    }
                    amount_due
                    amount_pay_status
                    amount_pay_status_text
                    payment{
                        order_id
                        paidby
                        paidby_text
                        amount_pay_status
                        amount_paid
                        extra_charges
                        transaction_no
                        transaction_date
                        admin_comments
                        user_comments
                    }
                } 
              
              }
          }
          `;
          this.graphqlService.query(schoolSessionDetails,{school_session_id: this.school_session_id,AppType:0},0)
            .subscribe((res: any) => {
               //   this.commonService.hideLoader();
                  this.schoolDetails = res.data.getSchoolSession as SchoolDetails;
                  this.memberEnrolDetails = res.data.getSchoolSession.session_member;
                  //console.log("School Details Data Is:", JSON.stringify(this.schoolDetails));
                  //console.log("Member Data  Is:", JSON.stringify(this.memberEnrolDetails));
              },
              (error) => {
                   //   this.commonService.hideLoader();
                   console.error("Error in fetching:", error);
                   if (error.graphQLErrors) {
                       console.error("GraphQL Errors:", error.graphQLErrors);
                       for (const gqlError of error.graphQLErrors) {
                           console.error("Error Message:", gqlError.message);
                           console.error("Error Extensions:", gqlError.extensions);

                       }
                   }
                   if (error.networkError) {
                       console.error("Network Error:", error.networkError);
                   }
             })
  
      }
   

    getRound(number){
        return parseFloat(number).toFixed(2)
    }

    getCoachProfile() {
        // const coach$Obs = this.fb.getAllWithQuery("Coach/Type2/" + this.sessionDetails.ParentClubKey + "/", { orderByKey: true, equalTo: this.sessionDetails.CoachKey }).subscribe((data) => {
        //     coach$Obs.unsubscribe();
        //     if (data[0].ProfileImageUrl == "" || data[0].ProfileImageUrl == undefined) {
        //         this.sessionDetails.CoachProfileUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/Coach.png?alt=media&token=fb8a8046-35fd-4340-8015-02981deacba6";
        //     } else {
        //         this.sessionDetails.CoachProfileUrl = data[0].ProfileImageUrl;
        //     }
        // });
    }
   
    getAge(info) {
        if (info != undefined && info != '') {
            // let year = info.split("-")[0];
            // let currentYear = new Date().getFullYear();
            // return (Number(currentYear) - Number(year));
            return this.commonService.getAgeFromYYYY_MM(info);
        } else {
            return 'N.A'
        }
    }
    gotoPrintMember() {
        // this.navCtrl.push('SchoolmembersheetPage', {
        //     sessionOInfo: this.sessionDetails
        // });
        if (this.memberEnrolDetails.length > 0) {
            const members = this.memberEnrolDetails.map((enrol_user)=>{
                return {
                    StartDate: this.schoolDetails.start_date,
                    EndDate: this.schoolDetails.end_date,
                    FirstName: enrol_user.member.FirstName,
                    LastName: enrol_user.member.LastName,
                    Age: enrol_user.member.DOB,
                    MedicalCondition: enrol_user.member.MedicalCondition,
                    Gender: enrol_user.member.Gender,
                    PaymentStatus: enrol_user.amount_pay_status_text,
                    PhoneNumber: enrol_user.member.IsChild ? enrol_user.member.ParentPhoneNumber:enrol_user.member.PhoneNumber,
                    EmailID: enrol_user.member.IsChild ? enrol_user.member.ParentEmailID:enrol_user.member.EmailID,
                    // ExtraLine: true,
                    // ExtraLineNumber: 5,
                    MemberType:"1"
                }
            })
            const session_info = {
                session_name:this.schoolDetails.school_session_name,
                club_name:this.schoolDetails.ClubDetails.ClubName,
                coach_name:this.schoolDetails.coach_names
            }
            this.navCtrl.push("SessionmembersheetPage", {session_info:session_info,repor_members:members,type:103});
        } else {
            this.commonService.toastMessage("No member(s) found in the current session",2500,ToastMessageType.Error);
        } 
    }
    copyConfirmAlert(session) {
        let alert = this.alertCtrl.create({
            title: 'Copy School Session',
            message: 'Do you want to copy?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Copy',
                    handler: () => {
                        this.navCtrl.push('CopyschoolsessionPage', {
                            SchoolSession: this.schoolDetails
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    //enrolling a member to a school session
    addMemberToSession() {
        if(Number(this.schoolDetails.capacity_left)){
            this.navCtrl.push('Type2AddMemberSchoolSession', { SchoolSession: this.schoolDetails});
        }else{
            this.commonService.toastMessage("Session is full",2500,ToastMessageType.Error);
        }
    }

    presentActionSheet(memberDetials) {

    }

    showPopOverActionSheet(enrol_member:ISession_MemberEnrols) {
        let actionSheet = this.actionSheetCtrl.create({
            //title: 'Modify your album',
            buttons: [
                {
                    text: 'Update Payment',
                    handler: () => {
                        this.navCtrl.push('UpdatePaymentDetails', { SelectedMember: enrol_member, SessionDetails: this.schoolDetails });
                    }
                }, 
                {
                    text: 'Call',
                    handler: () => {
                        this.call(enrol_member.member);
                    }
                },
                {
                    text: 'Profile',
                    handler: () => {
                        this.getProfile(enrol_member.member);
                    }
                },
                {
                    text: 'Remove',
                    handler: () => {
                        this.showRemoveAlert(enrol_member);
                    }
                }
            ]
        });

        actionSheet.present();
    }

    async call(session_member:ISessionMember) {
        const phone_no = session_member.IsChild ? session_member.ParentPhoneNumber : session_member.PhoneNumber;  
        if(phone_no && phone_no!='n/a'&& phone_no!=''){
            if (this.callNumber.isCallSupported()) {
                this.callNumber.callNumber(phone_no, true)
                    .then(() => console.log())
                    .catch(() => console.log());
            }else {
                this.commonService.toastMessage("Your device is not supporting to launch call dialer.", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
        }else{
            this.commonService.toastMessage("Phoneno not available.", 3000,ToastMessageType.Error,ToastPlacement.Bottom);
        }                                
     }
    
    memberPaidInfo: any = [];
    async getProfile(session_member:ISessionMember) {
        try{
            //this.commonService.showLoader("Getting profile data...");
            let parent_id = "";
            if(session_member.IsChild){
                if(session_member.ParentId && session_member.ParentId!="" && session_member.ParentId!="-" && session_member.ParentId!="n/a"){
                    parent_id = session_member.ParentId;
                }else{
                    this.commonService.toastMessage("parentid not available",2500,ToastMessageType.Error);
                    return false;
                }
            }else{
                parent_id = session_member.Id
            }

            this.navCtrl.push("MemberprofilePage", {
                member_id:parent_id,
                type: 'Member'
            })
            this.commonService.updateCategory("user_profile");
        }catch(err){
            this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        } 
    }


    showRemoveAlert(member_enrol:ISession_MemberEnrols) {
        let title = Number(member_enrol.amount_pay_status) == 1 ? "Remove Paid Member?" : "Remove Member";
        let message = Number(member_enrol.amount_pay_status) == 1 ? "Member will be removed, But payment report will continue to show the transaction" : "Are you sure you want to remove the member?";
        let cancelText = Number(member_enrol.amount_pay_status) == 1 ? "No" : "No";
        let yesText = Number(member_enrol.amount_pay_status) == 1 ? "Yes, remove from the group" : "Yes";
        let confirm = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [
                {
                    text: cancelText,
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: yesText,
                    handler: () => {
                        this.schoolSesEnrolDets.school_session_id = this.schoolDetails.id;
                        this.schoolSesEnrolDets.enrol_users.push(member_enrol.id);
                        this.unEnrolMember();
                    }

                }
            ]
        });
        confirm.present();
    }

  //Add member in school-session
  unEnrolMember() {
    this.commonService.showLoader("Please wait");
    this.schoolSesEnrolDets.get_payments = false;
    this.schoolSesEnrolDets.ActionType = 0;
    this.schoolSesEnrolDets.AppType = 0;
    
    console.log(JSON.stringify(this.schoolSesEnrolDets));

    const add_member_to_school = gql`
    mutation updateSchoolSesUserEnrolStatus($session_enrol_members: SchoolSesEnrolDets!) {
      updateSchoolSesUserEnrolStatus(session_enrol_members: $session_enrol_members){
        status
        enrolled_ids
      }
    }` 
    
    const variables = {session_enrol_members:this.schoolSesEnrolDets}

    this.graphqlService.mutate(add_member_to_school,variables,0).subscribe(
      result => {
        this.commonService.hideLoader();
        // Handle the result
        this.schoolSesEnrolDets.enrol_users = [];
        let message = "Selected member removed successfully";
        this.getSchoolSessionDetails();
        this.commonService.updateCategory("update_scl_session_list");
        this.commonService.toastMessage(message, 2500,ToastMessageType.Success);
      },
      error => {
        // Handle errors
        this.commonService.hideLoader();
        console.error(error);
        this.commonService.toastMessage("Member removal failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    );
   
  }



    editSession(session) {
        // console.log(session);
        this.navCtrl.push('Type2EditSchoolSessionDetails', { SchoolSession: this.schoolDetails });
    }

    goToAttendance() {
        this.navCtrl.push('SchooSesAttendanceDaysPage', {
            session_info: this.schoolDetails
        });
    }

     notifyGroupUsers(){
        if (this.memberEnrolDetails.length > 0) {
            const member_ids = this.memberEnrolDetails.map(enrol_member => enrol_member.member.IsChild ? enrol_member.member.ParentId:enrol_member.member.Id);
            this.navCtrl.push("Type2NotificationSession",{
                users:member_ids,
                type:ModuleTypes.SCHOOLSESSION,
                heading:`Enrolement:${this.schoolDetails.school_session_name}`
            }); 
        } else {
            this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
        }  
    }
 
    sendEmail() {
        if (this.memberEnrolDetails.length > 0) {
            const member_list = this.memberEnrolDetails.map((enrol_member,index) => {
                return {
                    IsChild:enrol_member.member.IsChild ? true:false,
                    ParentId:enrol_member.member.IsChild ? enrol_member.member.ParentId:"",
                    MemberId:enrol_member.member.Id, 
                    MemberEmail:enrol_member.member.EmailID!="" && enrol_member.member.EmailID!="-" && enrol_member.member.EmailID!="n/a" ? enrol_member.member.EmailID:(enrol_member.member.IsChild ? enrol_member.member.ParentEmailID:""), 
                    MemberName: enrol_member.member.FirstName + " " + enrol_member.member.LastName
                }
            })
            const session = {
                module_booking_club_id:this.schoolDetails.ClubDetails.Id,
                module_booking_club_name:this.schoolDetails.ClubDetails.ClubName,
                module_booking_coach_id:this.schoolDetails.CoachDetails[0].Id,
                module_booking_coach_name:this.schoolDetails.CoachDetails[0].first_name + " " + this.schoolDetails.CoachDetails[0].last_name,
                module_id:this.schoolDetails.id,
                module_booking_name:this.schoolDetails.school_session_name,
                module_booking_start_date:this.schoolDetails.start_date,
                module_booking_end_date:this.schoolDetails.end_date,
                module_booking_start_time:this.schoolDetails.start_time,
                //module_booking_end_time:this.
                //module_booking_activity_id:this.schoolDetails.ActivityDetails.Id,
                //module_booking_activity_name:this.schoolDetails.ActivityDetails.ActivityName,
            }
            const email_modal = {
                module_info:session,
                email_users:member_list,
                type:103
            }
            this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
        } else {
            this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
        } 
    }



    removeConfirmation() {
        let confirm = this.alertCtrl.create({
            title: 'Delete school session',
            message: 'Are you sure you want to delete the session?',
            buttons: [
                {
                    text: 'No',
                    role:"cancel",
                    handler: () => {
                        //console.log('Disagree clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.removeSession(this.sessionDetails);
                    }
                }
            ]
        });
        confirm.present();
    }


    removeSession(sessionDetails) {
        // let sessionObj = {
        //     parentClubKey:sessionDetails.ParentClubKey,
        //     CoachKey:sessionDetails.CoachKey,
        //     sessionKey:sessionDetails.$key
        // }
        // //this.sharedServices.getnestURL()
        // this.http.put(`${this.sharedServices.getnestURL()}/schoolsession/removesession`, sessionObj).subscribe((res: any) => {
        //     this.commonService.updateCategory("school");
        //     this.commonService.toastMessage("Session removed successfully",2000,ToastMessageType.Success,ToastPlacement.Bottom);
        //     this.navCtrl.pop();
        // },(err) => {
        //     this.commonService.toastMessage("Session removal failed",2000,ToastMessageType.Error,ToastPlacement.Bottom);
        // })

        const delete_input = {
            school_session_id:this.schoolDetails.id,
            updated_by: this.loggedin_key,
            AppType: 0,////Which app {0:Admin,1:Member,2:Applus}
            DeviceType: this.sharedServices.getPlatform() ? 1 : 2//Which app {1:Android,2:IOS,3:Web,4:API}
        }

        this.commonService.showLoader("Please wait");
        const school_ses_mutation = gql`
        mutation removeSchoolSession($sessionInput: DeleteSchoolSessionDTO!) {
            removeSchoolSession(sessionInput: $sessionInput)
        }` 
        
        const school_mutation_variable = { sessionInput: delete_input };
          this.graphqlService.mutate(
            school_ses_mutation, 
            school_mutation_variable,
            0
          ).subscribe((response)=>{
            this.commonService.hideLoader();
            this.commonService.updateCategory("update_scl_session_list");
            this.commonService.toastMessage("School session deleted succesfully.",2500);
            this.navCtrl.pop();
          },(err)=>{
            this.commonService.hideLoader();
            this.commonService.toastMessage("School session deletion failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }); 

    }
    
    calculateAge(dob) {
        const birthDate = new Date(dob);
        const currentDate = new Date();
      
        let age = currentDate.getFullYear() - birthDate.getFullYear();
      
        // Adjust age if the birthday hasn't occurred yet this year
        if (currentDate.getMonth() < birthDate.getMonth() ||
            (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
    }

    ionViewWillLeave(){
        if (this.fab) {
            this.fab.close();
        }
    }
      
}
