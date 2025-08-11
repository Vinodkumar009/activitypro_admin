import { FirebaseService } from './../../../services/firebase.service';
// import { Member } from './../../Model/MemberModel';
import { Component, ViewChild, } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Platform, ActionSheetController, FabContainer,Slides } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { CallNumber } from '@ionic-native/call-number';
import * as $ from 'jquery';
import { SharedServices } from '../../services/sharedservice';
import gql from "graphql-tag";
import {  user_status_update_v1 } from './model/session.model';
import { GraphqlService } from '../../../services/graphql.service';
import { TermSessionDets, TermSessionMembers } from './model/session_details.model';
import { ModuleTypes } from '../../../shared/constants/module.constants';

/** 
 * Generated class for the GroupsessiondetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-groupsessiondetails',
    templateUrl: 'groupsessiondetails.html',
})
export class GroupsessiondetailsPage {
    parentkeys_map = new Map();
    @ViewChild(Slides) slides: Slides;
    
    canAddMonMember: boolean = true;
    parentClubDetails: any;
    emailObj = {
        Message: "",
        Subject: ""
    }
    fulldays: "";
    sessionList = []; // added by vinod for weeklysessions
    futureWeeklySessions = [];// added by vinod for weeklysessions
    totalDuration: any; // added by vinod for weeklysessions
    memberList = []; // added by vinod for weeklysessions
    bookedSessionLength: any; // added by vinod for weeklysessions
    amountDetails = { // added by vinod for weeklysessions
        TotalAmount: 0,
        TotalDue: 0,
        TotalPaid: 0,
        TotalPaidPercentage: 0
    }
    sessionDetails: any = undefined;
    installments = [];
    currencyDetails: any;
    isShowNewPost = false;
    enrolledMemberInsession = [];
    cancelReason: string = "";
    isShowFutureSnsOnly:boolean = false;
    installmentArrayWithMember: any;
    loading: any = '';
    newSession = {
        IsActive: false,
        TermKey: "",
        SessionName: "",
        StartDate: "",
        EndDate: "",
        StartTime: "",
        Duration: "",
        Days: "",
        GroupSize: "",
        IsTerm: false,
        Comments: "",
        CoachKey: "",
        ClubKey: "",
        ParentClubKey: "",
        SessionFee: "",
        SessionFeeForNonMember: "",
        CoachName: "",
        SessionType: "",
        ActivityKey: "",
        ActivityCategoryKey: "",
        FinancialYearKey: "",
        IsExistActivitySubCategory: false,
        ActivitySubCategoryKey: "",
        IsExistActivityCategory: false,
        IsAllowFeeAmendment: false,
        IsVerfied: false,
        PaidBy: '',
        PayByDate: ''
    }

    MemberListsForDeviceToken = [];
    sessionMemberAndPrice = {
        NumberOfMemberPaid: "0",
        NumberOfMemberEnrolled: "0",
        TotalAmount: "0",
        AmountPaid: "0"
    }
    sessionBookedStartTime: any;
    sessionBookedEndTime: any;
    startDate = "";
    endDate = "";
    clubName = "";
    //isShowInstallmentBlockMember = false;
    selectedblock = -1;
    isShowDelete:boolean = false;
    sessionMonths: any;
    allSession_months:any
    coachInfo = {};
    paymentMap: Map<any, any> = new Map();
    directdebitInfo: any = "";
    directDebitMap: Map<string, Set<string>> = new Map();
    selectedMonthKey: any;
    nestUrl: any;

    // new id filelds
    user_status_update:user_status_update_v1 = {
        user_device_metadata:{
            UserAppType:0,
            UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
        },
        user_postgre_metadata:{
            UserMemberId:""
        },
        session_id: "", 
        enrol_users:[],
        action_type: 0, // 1 for enrol, 0 for unenrol
        updated_by: "",
        parent_fireabse_id:"",
        get_payments: false
    };
    inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
        "n", "n/a", "N/a", "na", "Na", "NA", "Nil","nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None ", "Non", "None\n", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
        "Best", "best", "Good", 'good','good '
    ];
    
    inclusionSet: Set<String> = new Set<String>(this.inclusionList);
    term_session_id:string;
    term_ses_dets:TermSessionDets;
    loggedin_type:number = 2;
    can_coach_see_revenue:boolean = true;
    constructor(
        public callNumber: CallNumber,
        public platform: Platform,
        public actionSheetCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public fb: FirebaseService,
        public storage: Storage,
        public navCtrl: NavController,
        public navParams: NavParams,
        public commonService: CommonService,
        public sharedservice: SharedServices,
        public fab: FabContainer,
        private graphqlService: GraphqlService
       
    ) {
        

        // this.getParentclubDetails();
        // this.getCoachProfile();
    }

async ionViewWillEnter(){
    this.loggedin_type = this.sharedservice.getLoggedInType();
    if(this.loggedin_type == 4){
        this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
    }
    this.term_session_id = this.navParams.get("session_id");
    this.user_status_update.session_id = this.term_session_id;
    this.getSession();
    const [userobj,currency] = await Promise.all([
    this.storage.get("userObj"),
    this.storage.get('Currency')
    ])
    this.currencyDetails = JSON.parse(currency);
    this.user_status_update.updated_by = JSON.parse(userobj).$key;       
}    


getSession(){
    //this.commonService.showLoader("Please wait");
    console.log("input giving for term session dets api:");
    const session_query = gql`
    query getSessionDetailsAdmin($input: SessionDetailsInput!) {
        getSessionDetailsAdmin(sessionDetailsInput: $input) {
            session{
                id
                session_name
                start_date
                end_date
                start_time
                end_time
                duration
                days
                group_size
                halfterm
                activity_category_name
                activity_subcategory_name
                ParentClubDetails {
                  Id
                  FireBaseId
                  ParentClubName
                }
                ActivityDetails {
                  Id
                  FirebaseActivityKey
                  ActivityName
                }
                ClubDetails {
                  Id
                  FirebaseId
                  ClubName
                }
                CoachDetails {
                  Id
                  coach_firebase_id
                  first_name
                  last_name
                  profile_image
                }
                comments
                group_status
                group_category
                term_key
                is_allow_paylater
                session_fee
                session_fee_for_nonmember
                no_of_weeks
                is_allmember_to_edit_amendfees
                allow_amend_fee
                capacity_left
                is_loyalty_allowed
                is_fixedloyalty_allowed
                fixed_loyalty_points
                is_allow_groupchat
                allow_childcare
                show_in_apkids
                firebase_activity_categorykey
                firebase_activity_subcategorykey
                is_exist_activitycategory
                is_exist_activity_subcategory
                coach_names
                paybydate
                tot_enrol_count
                paid_count
                tot_amount
                tot_paid_amount
                tot_unpaid_amount
                financial_year_key
            }
            
            session_members{
                session_member_id
                user_id
                session_id
                firebaseid
                first_name
                last_name
                is_enable
              	is_child	
                medical_condition
                gender
                dob
                media_consent
                email
                phone_number
                parent_id
                parent_email
                parent_phone_number
                member_payment_status
                amount_pay_status
                amount_pay_status_text
                amount_due
                amount_paid
                paidby
                paidby_text
                transaction_no
                transaction_date
                admin_comments
                user_comments
            }
      }
    }
  `;
    const session_dets_input = {
        session_id:this.term_session_id,
        DeviceType:this.sharedservice.getPlatform() == "android" ? 1:2,
        AppType:0
    }
    this.graphqlService
      .query(
        session_query, { input: session_dets_input}, 0
      )
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        this.term_ses_dets = res.data.getSessionDetailsAdmin;
        this.isShowDelete = this.term_ses_dets.session_members.filter(session_user => session_user.amount_pay_status &&  Number(session_user.amount_pay_status) > 0).length > 0 ? false:true;
      },
        (error) => {
          //this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
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
        }
      )
}

    
    sendFirebaseResp(firebasereq:any){
        return this.fb.getPropValue(firebasereq);
    }

    getMemberStatus(memberkey:string){
        return this.sessionDetails.Member.filter(member => member.Key === memberkey)[0].IsEnable;
    }

   
    ionViewDidEnter() {
        // this.fb.getAllWithQuery("Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/Group", { orderByKey: true, equalTo: this.sessionDetails.$key }).subscribe((data) => {
        //     this.sessionDetails = data[0];
        //     this.getDirectDebitInfo();
        // })
    }
    ionViewDidLoad() {
        this.commonService.screening("GroupsessiondetailsPage");
    }

    ionViewDidLeave() {}

    showNewPost(fab2) {
        this.isShowNewPost = !this.isShowNewPost;
    }

    //goto enrol page
    addMemberToSession(){
        //if(Number(this.term_ses_dets.session.capacity_left) > 0){
            this.navCtrl.push("Type2EditMembershipSession",{
                session_id:this.term_session_id,
                type:100,
                session_members:this.term_ses_dets.session_members.map(member => member.user_id),
                session_days:this.term_ses_dets.session.days,
                capacity_left:this.term_ses_dets.session.capacity_left
            });
        //}
        // else{
        //     this.commonService.toastMessage("Group size is full",2500,ToastMessageType.Error);
        // }
    }

    async notifyGroupUsers(){
        if (this.term_ses_dets.session_members.length > 0) {
            const member_ids = this.term_ses_dets.session_members.map(member => member.is_child ? member.parent_id:member.user_id);
            this.navCtrl.push("Type2NotificationSession",{
                users:member_ids,
                type:ModuleTypes.TERMSESSION,
                heading:`Enrolment:${this.term_ses_dets.session.session_name}`
            }); 
        } else {
            this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
        }  
    }

    //sending an email to 
    async sendEmail() {
        //console.log(this.sessionDetails);         
        if (this.term_ses_dets.session_members.length > 0) {
            const member_list = this.term_ses_dets.session_members.map((member,index) => {
                return {
                    IsChild:member.is_child ? true:false,
                    ParentId:member.is_child ? member.parent_id:"",
                    MemberId:member.user_id, 
                    MemberEmail:member.email!="" && member.email!="-" && member.email!="n/a" ? member.email:(member.is_child ? member.parent_email:""), 
                    MemberName: member.first_name + " " + member.last_name
                }
            })
            const session = {
                module_booking_club_id:this.term_ses_dets.session.ClubDetails.Id,
                module_booking_club_name:this.term_ses_dets.session.ClubDetails.ClubName,
                module_booking_coach_id:this.term_ses_dets.session.CoachDetails[0].Id,
                module_booking_coach_name:this.term_ses_dets.session.CoachDetails[0].first_name + " " + this.term_ses_dets.session.CoachDetails[0].last_name,
                module_id:this.term_ses_dets.session.id,
                module_booking_name:this.term_ses_dets.session.session_name,
                module_booking_start_date:this.term_ses_dets.session.start_date,
                module_booking_end_date:this.term_ses_dets.session.end_date,
                module_booking_start_time:this.term_ses_dets.session.start_time,
                //module_booking_end_time:this.
                //module_booking_activity_id:this.term_ses_dets.session.ActivityDetails.Id,
                //module_booking_activity_name:this.term_ses_dets.session.ActivityDetails.ActivityName,
            }
            const email_modal = {
                module_info:session,
                email_users:member_list,
                type:100
            }
            this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
        } else {
            this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
        }        
    }


    goToAttendance() {
        $("#fav-ico").trigger("click")
        this.navCtrl.push("Type2SessionDetails",{ session:this.term_ses_dets.session,type:100 });
    }

    //navigate to edit session
    editSession() {
        $("#fav-ico").trigger("click");
        this.navCtrl.push("Type2EditGroupSession", { SessionDetails: this.term_ses_dets.session });
    }

    //print member report
    gotoPrintMember() {
        if (this.term_ses_dets.session_members.length > 0) {
            const members = this.term_ses_dets.session_members.map((enrol_user)=>{
                return {
                    StartDate: this.term_ses_dets.session.start_date,
                    EndDate: this.term_ses_dets.session.end_date,
                    FirstName: enrol_user.first_name,
                    LastName: enrol_user.last_name,
                    PaymentStatus: enrol_user.amount_pay_status_text,
                    EmailID: enrol_user.is_child ? enrol_user.parent_email:enrol_user.email,
                    PhoneNumber: enrol_user.is_child ? enrol_user.parent_phone_number:enrol_user.phone_number,
                    Gender: enrol_user.gender,
                    Age: enrol_user.dob,
                    MedicalCondition: enrol_user.medical_condition,
                    // ExtraLine: true,
                    // ExtraLineNumber: 10,
                    MemberType:"1"
                }
            })
            const session_info = {
                session_name:this.term_ses_dets.session.session_name,
                club_name:this.term_ses_dets.session.ClubDetails.ClubName,
                coach_name:this.term_ses_dets.session.coach_names
            }
            this.navCtrl.push("SessionmembersheetPage", {session_info:session_info,repor_members:members,type:100});
        } else {
            this.commonService.toastMessage("No member(s) found in the current session",2500,ToastMessageType.Error);
        }        
    }


    removeAlertConfirmation() {
        const title = 'Delete Session';
        const message = 'Are you sure you want to delete the session? '
        this.commonService.commonAlert_V3(title,message,"Yes","No",()=>{
            this.removeSession();
        })
        
    }

    //removing a session
    removeSession() {
        const remove_input = {
            session_id: this.term_session_id,
            updated_by: this.user_status_update.updated_by,
        }
        const remove_ses_mutation = gql`
        mutation removeSession($removeInput: removeInput!) {
            removeSession(sessionInput: $removeInput)
        }` 
    
        const remove_mutation_variable = { removeInput: remove_input };
        this.graphqlService.mutate(
            remove_ses_mutation, 
            remove_mutation_variable,
            0
        ).subscribe((response)=>{
            const message = "Session removed successfully.";
            this.commonService.toastMessage(message, 2500,ToastMessageType.Success,ToastPlacement.Bottom);
            this.commonService.updateCategory("update_session_list");
            this.navCtrl.pop();
        },(err)=>{
            this.commonService.toastMessage("User status updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }); 
            
    }

 

// bewlow sections for action sheet actions
presentActionSheet(session_member:TermSessionMembers,ev:any) {
    console.log(ev);    
    let alert_options:{title:string,message:string,buttons:any[]} = {
        title: '',
        message:'',
        buttons: []
    };                
    if(ev.target.className == "medical_img"){
        alert_options.title = 'Medical Condition',
        alert_options.message = `${session_member.medical_condition}`
        alert_options.buttons.push({
            text: "Ok",
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked')
            }
        })
        const alertController = this.alertCtrl.create(alert_options);
        alertController.present();
    }else{
        alert_options.title = "Member";
        if(session_member.amount_pay_status == 0 || session_member.amount_pay_status == 3){
            alert_options.buttons.push( 
                {
                    text: 'Update Payment',
                    icon: this.platform.is('ios') ? "" : 'create',
                    handler: () => {
                        this.navCtrl.push("Type2PaymentDetailsForGroup", { SelectedMember: session_member, SessionDetails: this.term_ses_dets });
                    }
                }
            )                                
        }
        alert_options.buttons.push(
            {
                text: 'Call',
                icon: this.platform.is('ios') ? "" : 'call',
                handler: () => {
                    this.call(session_member);
                }
            },
            {
                text: 'Add Notes',
                icon: this.platform.is('ios') ? "" : 'md-clipboard',
                handler: () => {
                    // this.navCtrl.push('CreatenotePage', {
                    //     memberInfo: mlist,
                    //     sessionDetails: this.sessionDetails
                    // });
                }
            },
            {
                text: 'Profile',
                icon: this.platform.is('ios') ? "" : 'ios-contact',
                handler: () => {
                    this.getProfile(session_member);
                }
            },
            {
                text: 'Remove',
                icon: this.platform.is('ios') ? "" : 'trash',
                handler: () => {
                    this.unEnrolAlertConfirmation(session_member);
                }
            },
            {
                text: 'Close',
                icon: this.platform.is('ios') ? "" : 'close',
                role: 'cancel',
                handler: () => {

                }
            }                                        
        )    
        
        const actionSheet = this.actionSheetCtrl.create(alert_options);
        actionSheet.present();
    }
    

}

unEnrolAlertConfirmation(session_member:TermSessionMembers){
    let title = "Remove Member";
    let message = "Are you sure you want to remove the member?";
    let agreeBtn = "Yes";
    let disAgreeBtn = "No"
    if (session_member.amount_pay_status == 1 || session_member.amount_pay_status == 2) {
        title = "Attention",
        message = "Please note payment report will still show this payment. Refund will NOT be processed automatically."
        agreeBtn = "Yes: Remove";
        disAgreeBtn = " Don't Remove"
    }
    this.commonService.commonAlert_V3(title, message, agreeBtn,disAgreeBtn, (res)=>{
        this.unEnrolUser(session_member);
    })
}

//unenroling a user from session
unEnrolUser(session_member:TermSessionMembers){
    this.user_status_update.enrol_users.push({
        member_id: session_member.user_id,
        is_amended:false, //this required for member app only
        amount_due: '0.00'
    })
    const enrol_ses_mutation = gql`
    mutation updateMembersEnrolStaus($enrolInput: TermSesEnrolDets!) {
        updateMembersEnrolStaus(session_enrol_members: $enrolInput){
            status
            enrolled_ids
      }
    }` 
    
    const enrol_mutation_variable = { enrolInput: this.user_status_update };
      this.graphqlService.mutate(
        enrol_ses_mutation, 
        enrol_mutation_variable,
        0
      ).subscribe((response)=>{
        const message = "User removed from the session";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        this.user_status_update.enrol_users = [];
        this.getSession();
      },(err)=>{
        this.commonService.toastMessage("User status updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }); 
  }

  //calling a user
  async call(session_member:TermSessionMembers) {
    const phone_no = session_member.is_child ? session_member.parent_phone_number : session_member.phone_number;  
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
async getProfile(session_member:TermSessionMembers) {
    try{
        let parent_id = "";
        if(session_member.is_child){
            if(session_member.parent_id && session_member.parent_id!="" && session_member.parent_id!="-" && session_member.parent_id!="n/a"){
                parent_id = session_member.parent_id;
            }else{
                this.commonService.toastMessage("parentid not available",2500,ToastMessageType.Error);
                return false;
            }
        }else{
            parent_id = session_member.user_id
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



    async updateMonthlyPrice(user:any){
        try{
            this.commonService.showLoader("Please wait");
            let new_price:any;
            let new_planid:any;
            console.log(user.MonthlySession[Object.keys(user.MonthlySession)[0]]);
            const user_ses_days = user.MonthlySession[Object.keys(user.MonthlySession)[0]].Days;
            const user_status = await this.fb.getPropValue(`Member/${this.sessionDetails.ParentClubKey}/${user.ClubKey}/${user.Key}/IsEnable`);
            const days_len = user_ses_days.split(",").length;
            console.log(`days_length:${days_len}`);
            switch(parseInt(days_len)){
                case 1:{
                    new_price = user_status ? this.sessionDetails.AmountForOneDayPerWeekForMember : this.sessionDetails.AmountForOneDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_OneDayMemberPlanId : this.sessionDetails.Stripe_OneDayNonMemberPlanId;
                    break;
                }
                case 2:{
                    new_price = user_status ? this.sessionDetails.AmountForTwoDayPerWeekForMember : this.sessionDetails.AmountForTwoDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_TwoDayMemberPlanId : this.sessionDetails.Stripe_TwoDayNonMemberPlanId;
                    break;
                }
                case 3:{
                    new_price = user_status ? this.sessionDetails.AmountForThreeDayPerWeekForMember : this.sessionDetails.AmountForThreeDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_ThreeDayMemberPlanId : this.sessionDetails.Stripe_ThreeDayNonMemberPlanId;
                    break;
                }case 4:{
                    new_price = user_status ? this.sessionDetails.AmountForFourDayPerWeekForMember : this.sessionDetails.AmountForFourDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_FourthDayMemberPlanId : this.sessionDetails.Stripe_FourthDayNonMemberPlanId;
                    break;
                }
                case 5:{
                    new_price = user_status ? this.sessionDetails.AmountForFiveDayPerWeekForMember : this.sessionDetails.AmountForFiveDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_FifthDayMemberPlanId : this.sessionDetails.Stripe_FifthDayNonMemberPlanId;
                    break;
                }
                case 6:{
                    new_price = user_status ? this.sessionDetails.AmountForSixDayPerWeekForMember : this.sessionDetails.AmountForSixDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_SixthDayMemberPlanId : this.sessionDetails.Stripe_SixthDayNonMemberPlanId;
                    break;
                }
                case 7:{
                    new_price = user_status ? this.sessionDetails.AmountForSevenDayPerWeekForMember : this.sessionDetails.AmountForSevenDayPerWeekForNonMember;
                    new_planid = user_status ? this.sessionDetails.Stripe_SeventhDayMemberPlanId : this.sessionDetails.Stripe_SeventhDayNonMemberPlanId;
                    break;
                }
            }
            const user_monthkey = user.MonthlySession[Object.keys(user.MonthlySession)[0]].Key;
            const session_info = {
                parentclub:this.sessionDetails.ParentClubKey,
                session_id:this.sessionDetails.$key,
                club_id:this.sessionDetails.ClubKey,
                coach_id:this.sessionDetails.CoachKey,
                member_clubid:user.ClubKey,
                member_id:user.Key,
                member_name:user.FirstName+" "+user.LastName,
                club_name:this.clubName,
                coach_name:this.sessionDetails.CoachName,
                session_name:this.sessionDetails.SessionName || "",
                start_date:this.sessionDetails.StartDate,
                end_date:this.sessionDetails.EndDate,
                expiry_date:moment(this.sessionDetails.EndDate,"YYYY-MM-DD").format("MMM-YYYY"),
                old_price:await this.fb.getPropValue(`Member/${this.sessionDetails.ParentClubKey}/${user.ClubKey}/${user.Key}/Session/${this.sessionDetails.$key}/MonthlySession/${user_monthkey}/TotalFeesAmount`),
                old_plan: await this.fb.getPropValue(`Member/${this.sessionDetails.ParentClubKey}/${user.ClubKey}/${user.Key}/Session/${this.sessionDetails.$key}/Stripe_PlanId`),
                new_price:new_price,
                new_plan:new_planid,
                activity:Object.keys(this.sessionDetails.Activity)[0],
                subscription_id:await this.fb.getPropValue(`MonthlySesSubscription/${this.sessionDetails.ParentClubKey}/${this.sessionDetails.$key}/Member/${user.Key}/SubscriptionId`),
                currency:this.currencyDetails.CurrencySymbol
            }
            this.commonService.hideLoader();
            this.navCtrl.push("MonthlysesupdatepricePage",{session_info});
    }catch(err){
        this.commonService.hideLoader();
    }
        
    }

    

    getCancelledFormatDate(cancelled_month){
        return moment(new Date(cancelled_month)).format("MMM-YYYY");
    }
    
    

    
    getDate_DD_MMM_YYYY_Format1(date) {
        let split = date.split("-");
        let yy = split[0];
        let mm = split[1];
        let dd = split[2];
        mm = (split[1].length == 1) ? "0" + mm : mm;
        dd = (split[2].length == 1) ? "0" + dd : dd;

        let month = "";

        switch (parseInt(mm) - 1) {
            case 0:
                month = "Jan";
                break;
            case 1:
                month = "Feb";
                break;
            case 2:
                month = "Mar";
                break;
            case 3:
                month = "Apr";
                break;
            case 4:
                month = "May";
                break;
            case 5:
                month = "Jun";
                break;
            case 6:
                month = "Jul";
                break;
            case 7:
                month = "Aug";
                break;
            case 8:
                month = "Sep";
                break;
            case 9:
                month = "Oct";
                break;
            case 10:
                month = "Nov";
                break;
            case 11:
                month = "Dec";
                break;
        }


        return dd + "-" + month;
    }

    gotochallenges() {
        this.navCtrl.push('SessionPlayerstoChallenge', { sessionDetails: this.sessionDetails, clubName: this.clubName })
    }

    getDate(date: any) {
        return moment(date, "YYYY-MM-DD").format("DD-MMM-YY");
    }

    loyaltypoints() {
        if (this.sessionDetails.PaymentOption == '100')
            this.navCtrl.push('SessionLoyalty', { sessionDetails: this.sessionDetails, clubName: this.clubName })
        if (this.sessionDetails.PaymentOption == '101')
            this.navCtrl.push('SessionLoyalty', { sessionDetails: this.sessionDetails, clubName: this.clubName, monthStatus: this.selectedMonthKey, monthlyMember: ""})
    }

    ionViewWillLeave(){
        if (this.fab) {
            this.fab.close();
          }
    }

    

}

//Monthly Session:
//1 -> subscribed
//2 -> cancelled (Session->Member(IsCancelled,IsSubScribed,CancelledAt))
//3 ->subscription failed due to card expiry or insufficient blance