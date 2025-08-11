import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, FabContainer, IonicPage, NavController, NavParams } from 'ionic-angular';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../../services/graphql.service';
import { SharedServices } from '../../../../services/sharedservice';
import { WeeklySessionDays, WeeklySessionDetails } from '../weekly.model';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { WeeklySessionDateDetailsInput, WeeklySessionMember } from '../weeklydatedetails.model';
import moment from 'moment';
import * as $ from 'jquery';
import { FirebaseService } from '../../../../../services/firebase.service';
import { ModuleTypes } from '../../../../../shared/constants/module.constants';

/**
 * Generated class for the WeeklySessionDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-weekly-session-details',
  templateUrl: 'weekly-session-details.html',
})
export class WeeklySessionDetailsPage {
  @ViewChild("fab") fab: FabContainer;
  sessionId: string;

  weeklyDets: WeeklySessionDetails;
  individualDetails: WeeklySessionDays[];
  isShowFutureSnsOnly:boolean = true;

  postgre_parentclub: string;
  cancelReason: string = "";
  membersData: WeeklySessionMember[] = []
  weeklySessionDetailsInput: WeeklySessionDetailsInput = {
    ParentClubKey: '',
    ParentClubId: '',
    ClubKey: '',
    ClubId: '',
    MemberKey: '',
    MemberId: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    DeviceId: 0,
    fetchActiveSession: true,
    SessionId: ''
  }

  weeklySessionInput: WeeklySessionInput = {
    sessionId: ''
  }

  cancelSessionDate: CancelSessionDate = {
    sessionDateId: '',
    cancelled_by:this.sharedService.getLoggedInId(),
    cancel_reason:''
  }

  toggleSessionDatePrivateInput: ToggleSessionDatePrivateInput = {
    sessionDateId: '',
    isPrivate: 0
  }
  emailObj = {
    Message: "",
    Subject: ""
  }
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
        
  constructor(public navCtrl: NavController, 
    public commonService: CommonService, 
    public fb: FirebaseService,
    public alertCtrl: AlertController, 
    public navParams: NavParams, 
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,
    private sharedService: SharedServices) {

  }

  ionViewDidLoad() {

  }

  async ionViewWillEnter() {
    console.log('ionViewDidLoad WeeklySessionDetailsPage');
    this.loggedin_type = this.sharedService.getLoggedInType();
    if(this.loggedin_type == 4){
        this.can_coach_see_revenue = this.sharedService.getCanCoachSeeRevenue();
    }
    this.postgre_parentclub = this.sharedService.getPostgreParentClubId();
    console.log("parentclub id is:", this.postgre_parentclub);
    // Retrieve data from navigation parameters
    this.sessionId = this.navParams.get('session_id');
    console.log('session Id:', this.sessionId);

    this.weeklySessionDetailsInput.SessionId = this.sessionId;
    this.weeklySessionDetails();

  }

  sendEmail() {

  }

  sendNotification() {

  }

  ShowWeeklyActionSheet(sesData: WeeklySessionDays) {
    let actionSheet;
    actionSheet = this.actionSheetCtrl.create({
      //title: 'Modify your album',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'View',
          icon: "ios-eye",
          handler: () => {
            this.GotoSesDets(sesData);
          }
        },
        {
          text: 'Loyalty Point',
          icon: "ios-cash",
          handler: () => {
            this.weeklyloyaltyPoint(sesData);
          }
        },
        {
          text: 'Add Member',
          icon: "ios-person-add",
          handler: () => {
            this.addMemberToWeeklySession(sesData);
          }
        },
        {
          text: 'Email',
          icon: "ios-mail",
          handler: () => {
            this.sendWeeklyMail(sesData);
          }
        }, {
          text: 'Notify',
          icon: "ios-chatbubbles",
          handler: () => {
            this.notifySessionUsers(sesData);
          }
        }, {
          text: 'Cancel Session',
          icon: "ios-undo",
          handler: () => {
            this.WeeklySesCancelConfirmation(sesData);

            //this.cancelWeeklySession(sesData);
          }
        },
        {
          text: sesData.private_status === 1 ? 'Make Private' : 'Make Public',
          icon: "ios-eye",
          handler: () => {
            this.WeeklyPrivacyConfirmation(sesData);

            //this.cancelWeeklySession(sesData);
          }
        },
        {
          text: 'Close',
          icon: 'ios-close',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    actionSheet.present();
  }

  async WeeklyPrivacyConfirmation(Session: WeeklySessionDays) {
    const sessionName = Session.session_name;
    const confirmationMessage = Session.private_status === 1 ? `Do you want to make "${sessionName}" private?` : `Do you want to make "${sessionName}" public?`;
    
    const prompt = await this.alertCtrl.create({
      title: 'Privacy Confirmation',
      message: confirmationMessage,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            // Handle if user selects No
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // Handle if user selects Yes
            this.togglePrivacy(Session);
          }
        }
      ]
    });

    prompt.present();
  }

  // Function to toggle privacy status
  togglePrivacy(Session: WeeklySessionDays) {
    // Determine the new privacy status
    let newPrivacyStatus:number;
    if(Session.private_status==1){
      newPrivacyStatus = 0
    }else{
       newPrivacyStatus=1
    }

    // Update the session's privacy status
    this.hideSession(Session, newPrivacyStatus);
  }

  hideSession(sesData: WeeklySessionDays, newPrivacyStatus: number) {
    try {
      this.toggleSessionDatePrivateInput.sessionDateId = sesData.id;
      this.toggleSessionDatePrivateInput.isPrivate = newPrivacyStatus;
      // Set the headers (optional)
      const cancel_weekly_sess = gql`
      mutation toggleWeeklySessionDatePrivate($input: ToggleSessionDatePrivateInput!) {
        toggleWeeklySessionDatePrivate(input: $input) {
          id
       
        }
      }`;

      const cancel_weekly_variable = { input: this.toggleSessionDatePrivateInput };

      this.graphqlService.mutate(
        cancel_weekly_sess,
        cancel_weekly_variable,
        0
      ).subscribe((response) => {
        const message = "Session Status Updated Successfully Successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);

        this.navCtrl.pop().then(() => this.navCtrl.pop());

      }, (err) => {

        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Status Updation Failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  WeeklySesCancelConfirmation(Session: WeeklySessionDays) {
    let prompt = this.alertCtrl.create({
      title: 'Cancel Session',
      message: "Are you sure you want to cancel the session?",

      buttons: [
        {
          text: 'No',
          handler: data => {
            this.cancelReason = "";
          }
        },
        {
          text: 'Yes:Cancel',
          // handler: data => {
          //     this.cancelWeeklySession(Session);
          // }
          handler: data => {
            this.cancelWeeklySession(Session)
            // .then(() => {
            //   this.sendEmailsAfterWeeklyCancellation(Session);
            // });
          }
        }
      ]
    });
    prompt.present();
  }
  weeklyloyaltyPoint(sesData) {
    // if (this.sessionDetails.clubName == undefined) {
    //     this.sessionDetails['clubName'] = this.clubName;
    // }
    // if (this.sessionDetails.ActivitieDetails == undefined) {
    //     this.sessionDetails['ActivitieDetails'] = this.sessionDetails.ActivitieDetails
    // }
    // sesData.StartTime = this.sessionBookedStartTime;
    // this.sessionDetails.Member = Array.isArray(this.sessionDetails.Member) ? this.sessionDetails.Member :this.commonService.convertFbObjectToArray(this.sessionDetails.Member);
    // this.navCtrl.push("SessionWeeklyLoyalty", { SesDetails: this.sessionDetails, SessionList: this.sessionList, MemberList: this.memberList, SessionDetails: sesData });
  }
  
  ToggleSessions() {
    this.isShowFutureSnsOnly = !this.isShowFutureSnsOnly;
    this.weeklySessionDetailsInput.fetchActiveSession = this.isShowFutureSnsOnly;
    this.weeklySessionDetails();
  }


  async notifySessionUsers(sesData:WeeklySessionDays){
    try{
      const member_data = await this.getSessionDets(sesData) as WeeklySessionMember[];
      if (member_data.length > 0) {
        const member_ids = member_data.map(enrol_member => enrol_member.member.IsChild ? enrol_member.member.ParentId:enrol_member.member.Id);
        this.navCtrl.push("Type2NotificationSession",{
            users:member_ids,
            type:ModuleTypes.WEEKLYSESSION,
            heading:`Enrolment:${this.weeklyDets.session_name}(${sesData.session_name},${sesData.session_date})`
        }); 
      } else {
          this.commonService.toastMessage("No member(s) found for the current session",2500,ToastMessageType.Error);
      }
    }catch(err){
      console.error("Error while processing data:", err);
    }
  }

  //sending emails to the individual session users
  async sendWeeklyMail(sesData:WeeklySessionDays) {
    try{
      this.membersData = await this.getSessionDets(sesData) as WeeklySessionMember[];
         if (this.membersData.length > 0) {
           const member_list = this.membersData.map((enrol_member:WeeklySessionMember,index) => {
               return {
                   IsChild:enrol_member.member.IsChild ? true:false,
                   ParentId:enrol_member.member.IsChild ? enrol_member.member.ParentId:"",
                   MemberId:enrol_member.member.Id, 
                   MemberEmail:enrol_member.member.EmailID!="" && enrol_member.member.EmailID!="-" && enrol_member.member.EmailID!="n/a" ? enrol_member.member.EmailID:(enrol_member.member.IsChild ? enrol_member.member.ParentEmailID:""), 
                   MemberName: enrol_member.member.FirstName + " " + enrol_member.member.LastName
               }
           })
           const session = {
               module_booking_club_id:this.weeklyDets.club.Id,
               module_booking_club_name:this.weeklyDets.club.ClubName,
               module_booking_coach_id:this.weeklyDets.primaryCoaches[0].id,
               module_booking_coach_name:this.weeklyDets.coach_names,
               module_id:this.weeklyDets.session_name,
               module_booking_name:`${this.weeklyDets.session_name}(${sesData.session_name},${sesData.session_date})`,
               module_booking_start_date:this.weeklyDets.start_date,
               module_booking_end_date:this.weeklyDets.end_date,
               module_booking_start_time:this.weeklyDets.start_time,
               //module_booking_end_time:this.
               //module_booking_activity_id:this.term_ses_dets.session.ActivityDetails.Id,
               //module_booking_activity_name:this.term_ses_dets.session.ActivityDetails.ActivityName,
           }
           const email_modal = {
               module_info:session,
               email_users:member_list,
               type:102
           }
           this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
         } else {
             this.commonService.hideLoader()
             this.commonService.toastMessage("No member(s) found for the current session",2500,ToastMessageType.Error);
         }
    }catch(err){
      console.error("Error while processing data:", err);
      this.commonService.hideLoader();
    }
  }

//get particular day session details
  getSessionDets(sesData:WeeklySessionDays):Promise<WeeklySessionMember[]>{
    return new Promise((resolve, reject) => {
      try{
        this.commonService.showLoader("Please wait");
        const weeklySessionDateDetails = gql`
        query getWeeklySessionDateDetails($weekly_dets_input: WeeklySessionDateDetailsInput!){
            getWeeklySessionDateDetails(input:$weekly_dets_input){
               weeklySessionMember{
                id
                amount_pay_status
                paid_amount
                amount_due
                total_amount
                 member{
                     Id
                     ParentId
                     FirstName
                     LastName
                     ParentEmailID
                     EmailID
                     PhoneNumber
                     ParentPhoneNumber
                 }
               }
            }
           }
        `;
     this.graphqlService.query(weeklySessionDateDetails, { weekly_dets_input: {SessionDateId:sesData.id} }, 0).subscribe((res: any) => {
         this.commonService.hideLoader();
         resolve(res.data.getWeeklySessionDateDetails.weeklySessionMember as WeeklySessionMember[]);
       },(error) => {
          this.commonService.hideLoader();
          reject(error);
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
      }catch(err){
        console.error("Error while processing data:", err);
        this.commonService.hideLoader();
        reject(err);
      }
    })
  }


  //navigation to individual session details page
  input: WeeklySessionDateDetailsInput = {
    SessionDateId: ''
  }
  //new Api for showing the weeklysession details
  weeklySessionDetails() {
    console.log("weekly details api called");
    
    const weeklySessionDetails = gql`
    query getWeeklySessionDetails($input: WeeklySessionDetailsInput!){
      getWeeklySessionDetails(input:$input){
        id
        private_status
        first_booking_message
        contact_phone
        contact_email
        category_name
        sub_category_name
        capacity
        is_paid
        discounts{
          id
          discount_name
          discount_types
          discount_percent
          discount_amount
          discount_session_count
          advance_no_of_days
          no_of_session
          include_advance_booking_discount 
        }
        age_group
        days
        session_name
        start_date
        start_time
        end_time
        end_date
        session_type
        fee_for_member
        fee_for_nonmember
        coach_names
        coach_images
        description
        duration
        firebase_categorykey
        firebase_subcategorykey
        no_of_weeks
        ParentClub {
          Id
          ParentClubName
          FireBaseId
          ParentClubAdminEmailID
          ParentClubAppIconURL
        }
        club {
          Id
          ClubName
          FirebaseId
        }
        ActivityDetails {
          Id
          ActivityName
          ActivityCode
          FirebaseActivityKey
        }
        primaryCoaches {
          id
          coach_type
          coach {
            Id
            coach_firebase_id
            first_name
            last_name
            profile_image
          }
        }
        secondaryCoaches {
          id
          coach_type
          coach {
            Id
            coach_firebase_id
            first_name
            last_name
          }
        }
    
        weeklySessionDays{
          id
          session_name
          session_date
          session_day
          start_time
          end_time
          cancelled_date
          cancelled_by
          cancelled_reason
          is_cancelled
          capacity
          capacity_left
          bookingCount
          private_status
        }
        allow_paylater
        allow_bacs_payment
        is_loyalty_allowed
        is_fixed_loyalty_allowed
        fixed_loyalty_points
        allow_cash_payment
        apply_capacity_restriction
        approve_first_booking
        minimum_booking_count
        advance_booking_weeks
        advance_visible_sessions
        }
    }
    `;
    this.graphqlService.
      query(
        weeklySessionDetails, { input: this.weeklySessionDetailsInput }, 0
      )
      .subscribe((data: any) => {
        //   this.commonService.hideLoader();
        this.weeklyDets = data.data.getWeeklySessionDetails;

       // this.individualDetails = data.data.getWeeklySessionDetails.weeklySessionDays;
        const allSessions = data.data.getWeeklySessionDetails.weeklySessionDays;
        if (this.isShowFutureSnsOnly) {
            // Filter future sessions
            this.individualDetails = allSessions.filter(session => moment(session.session_date).isSameOrAfter(moment(), 'day'));
        } else {
            // Filter past sessions
            this.individualDetails = allSessions.filter(session => moment(session.session_date).isBefore(moment(), 'day'));
        }
        // console.log("Weekly Details Data Is:", JSON.stringify(this.weeklyDets));
        console.log("Individual Weekly Data  Is:", JSON.stringify(this.individualDetails));

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

        }
      )
  }
  //add member to session
  addMemberToWeeklySession(sesData: WeeklySessionDays) {
    if(Number(sesData.capacity_left) > 0){
      this.navCtrl.push("AddmembertoweeklyPage", { weeklySessionId: this.weeklyDets.id, individualWeeklyId: sesData.id });
    }else{
      this.commonService.toastMessage("Session is full",2500,ToastMessageType.Error);
    }
  }

  removeWeeklySession() {
    const weekly_det_instance = this;
    this.commonService.commonAlert_V3("Delete Session",
    "Are you sure want to delete session?","Yes:Delete","No",()=>{
      try{
        weekly_det_instance.commonService.showLoader("Please wait")
        this.weeklySessionInput.sessionId = this.weeklyDets.id;
        // Set the headers (optional)
         const delete_weekly_sess = gql`
           mutation cancelWeeklySession($input: WeeklySessionInput!) {
             cancelWeeklySession(input: $input) {
               id
             }
           }`;

         const delete_weekly_variable = { input: this.weeklySessionInput };

         this.graphqlService.mutate(
           delete_weekly_sess,
           delete_weekly_variable,
           0
         ).subscribe((response) => {
          weekly_det_instance.commonService.hideLoader();
           const message = "Weekly session deleted successfully";
           this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
           this.commonService.updateCategory("update_session_list");
           this.navCtrl.pop();
           // this.reinitializeSession();
         }, (err) => {
          weekly_det_instance.commonService.hideLoader();
           // Handle GraphQL mutation error
           console.error("GraphQL mutation error:", err);
           this.commonService.toastMessage("Session deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
         });
      }
      catch (error) {
        // Handle any synchronous errors that may occur outside of the GraphQL mutation
        weekly_det_instance.commonService.hideLoader();
        console.error("An error occurred:", error);
        // Additional error handling or logging can be added here
      }
    })          
  }

  async cancelWeeklySession(data: WeeklySessionDays) {
   // await this.WeeklyEmailCancelConfirmation(data);
    try {
      this.cancelSessionDate.sessionDateId = data.id;
    //  await this.WeeklyEmailCancelConfirmation(data);
      // Set the headers (optional)
      const cancel_weekly_sess = gql`
        mutation cancelSessionForDate($input: CancelSessionDate!) {
          cancelSessionForDate(input: $input) {
            id
          }
        }`;

      const cancel_weekly_variable = { input: this.cancelSessionDate };

      this.graphqlService.mutate(
        cancel_weekly_sess,
        cancel_weekly_variable,
        0
      ).subscribe((response) => {
        const message = "Session cancelled successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.weeklySessionDetails();
      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Session deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  // async WeeklyEmailCancelConfirmation(Session: WeeklySessionDays) {
  //   let prompt = this.alertCtrl.create({
  //     title: 'Cancellation Email',
  //     message: "Do you want to send the cancellation email to the members?",

  //     buttons: [
  //       {
  //         text: 'No',
  //         role: 'cancel',
  //         handler: data => {
  //         }
  //       },
  //       {
  //         text: 'Yes:Email',
  //         handler: data => {
  //           this.sendEmailsAfterWeeklyCancellation(Session);
  //         }
  //       }
  //     ]
  //   });
  //   prompt.present();
  // }

  sendEmailsAfterWeeklyCancellation(session: WeeklySessionDays) {

    session.session_date = moment(session.session_date).format("DD-MMM-YYYY");
    this.emailObj.Subject = "Cancellation: Weekly Session";
    this.emailObj.Message = `Dear All,\n\n Your Session on ${session.session_day} ${session.session_date} at ${session.start_time} is cancelled. Please speak to your instructor for more details. \n\nSincerely Yours,\n${this.weeklyDets.ParentClub.ParentClubName}  \nPh: ${this.weeklyDets.contact_phone} \n${this.weeklyDets.ParentClub.ParentClubAdminEmailID}`
    //this.emailObj.Message = `Your Session at ${session.Day} ${session.SessionDate} ${this.sessionBookedStartTime} got cancelled.`
    try {
      let notificationDetailsObjForMember = {
        ParentClubKey: this.weeklyDets.ParentClub.FireBaseId,
        ClubKey: this.weeklyDets.club.FirebaseId,
        ClubName: (this.weeklyDets.club.ClubName),
        ClubShortName: (this.weeklyDets.club.ClubName == undefined ? "" : this.weeklyDets.club.ClubName),
        Message: this.emailObj.Message,
        Subject: this.emailObj.Subject,
        SendBy: "ClubAdmin",
        ComposeOn: new Date().getTime(),
        Purpose: "Session Cancellation Email",
        MemberKey: "",
        MemberName: "",
        MemberEmailId: "",
        Status: "Unread",
        Type: ""
      };
      let notificationDetailsObjForAdmin = {
        ParentClubKey: this.weeklyDets.ParentClub.FireBaseId,
        ClubKey: this.weeklyDets.club.FirebaseId,
        ClubName: (this.weeklyDets.club.ClubName),
        ClubShortName: (this.weeklyDets.club.ClubName == undefined ? "" : this.weeklyDets.club.ClubName),
        Message: this.emailObj.Message,
        Subject: this.emailObj.Subject,
        SendBy: "ClubAdmin",
        Type: "",
        ComposeOn: new Date().getTime(),
        Purpose: "Session Email",
        Member: []

      };
      let notificationDetailsObjForMemberInner = {
        MemberKey: "",
        MemberName: "",
        MemberEmailId: "",
        Status: "Unread"
      }
      let emailFormembers = {
        Members: [],
        ImagePath: this.weeklyDets.ParentClub.ParentClubAppIconURL,
        FromEmail: "activitypro17@gmail.com",
        FromName: this.weeklyDets.ParentClub.ParentClubName,
        ToEmail: this.weeklyDets.ParentClub.ParentClubAdminEmailID,
        ToName: this.weeklyDets.ParentClub.ParentClubName,
        CCName: this.weeklyDets.ParentClub.ParentClubName,
        CCEmail: this.weeklyDets.ParentClub.ParentClubAdminEmailID,
        Subject: this.emailObj.Subject,
        Message: this.emailObj.Message,
      }



      for (let memberIndex = 0; memberIndex < this.membersData.length; memberIndex++) {
        if (this.membersData[memberIndex].member.EmailID.trim() != "") {
          let mKey = this.membersData[memberIndex].member.FirebaseKey;
          // let mKey = session.Members[memberIndex].Key == undefined ? session.Members[memberIndex].$key : session.Members[memberIndex].Key;
          // if (this.membersData[memberIndex].member.EmailID != "" && this.membersData[memberIndex].member.EmailID != undefined) {
          //     emailFormembers.Members.push({ MemberEmail: this.membersData[memberIndex].member.EmailID, MemberName: this.membersData[memberIndex].member.FirstName + " " + this.membersData[memberIndex].member.LastName });
          //     notificationDetailsObjForAdmin.Member[mKey] = {
          //         MemberKey: mKey,
          //         MemberName: this.membersData[memberIndex].member.FirstName + " " + this.membersData[memberIndex].member.LastName,
          //         MemberEmail: this.membersData[memberIndex].member.EmailID
          //     }

          // }
          let memberEmail = this.membersData[memberIndex].member.EmailID;
          // Check if member's email is "n/a", if so, use parent's email
          if (memberEmail.toLowerCase() === "n/a" || memberEmail === undefined) {
            memberEmail = this.membersData[memberIndex].member.ParentEmailID;
          }
          if (memberEmail != "") {
            emailFormembers.Members.push({
              MemberEmail: memberEmail,
              MemberName: this.membersData[memberIndex].member.FirstName + " " + this.membersData[memberIndex].member.LastName
            });
            notificationDetailsObjForAdmin.Member[mKey] = {
              MemberKey: mKey,
              MemberName: this.membersData[memberIndex].member.FirstName + " " + this.membersData[memberIndex].member.LastName,
              MemberEmail: memberEmail
            };
          }
        }

      }


      let firebs = this.fb;
      let members = [];
      members = this.membersData;
      let pc = this.weeklyDets.ParentClub.FireBaseId;
      let url = this.sharedService.getEmailUrl();
      $.ajax({
        //url: url + "umbraco/surface/ActivityProSurface/SendEmailNotification/",
        url: `${this.sharedService.getnestURL()}/messeging/notificationemail`,
        data: emailFormembers,

        type: "POST",
        success: function (respnse) {

        },
        error: function (xhr, status) {
          try {
            let key = firebs.saveReturningKey("/EmailNotification/ParentClub/" + pc, notificationDetailsObjForAdmin);
            for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
              notificationDetailsObjForMember.MemberKey = members[memberIndex].Key;
              notificationDetailsObjForMember.MemberName = members[memberIndex].FirstName + " " + members[memberIndex].LastName;
              notificationDetailsObjForMember.MemberEmailId = members[memberIndex].EmailID;
              firebs.update(key.toString(), "/EmailNotification/Member/" + pc + "/" + members[memberIndex].Key + "/", notificationDetailsObjForMember);
            }
          } catch (ex) {

          }

        }
      });
      // this.showToast("Mail sent successfully", 5000);
      const message = "Mail sent successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.emailObj.Message = "";
      this.emailObj.Subject = "";
      this.navCtrl.pop();
    } catch (ex) {
    }

  }

  //Navigating weeklysession edit
  EditWeekly() {
    const booking_count = this.weeklyDets.weeklySessionDays.filter(x => Number(x.bookingCount) > 0).length;
    this.navCtrl.push("EditweeklysessionPage", { weeklysesdets: this.weeklyDets,is_enrolls_there:booking_count > 0?true:false });
  }


  //this is to weekly sessiondets
  GotoSesDets(sesData: WeeklySessionDays) {
    this.navCtrl.push("WeeklysessiondetsPage", { weekly_session:this.weeklyDets,individualWeekly: sesData.id })
  }

  extractDateAndMonth(sessionDate: string): { date: string, month: string } {
    const dateParts: string[] = sessionDate.split('-');
    const date: string = dateParts[0];
    const month: string = dateParts[1];
    return { date, month };
  }

 getShortDayName(fullDayName) {
    // Create an array of short day names
    const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get the index of the full day name in the array of full day names
    const fullDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(fullDayName);

    // If the full day name exists in the array, return its corresponding short day name
    if (fullDayIndex !== -1) {
        return shortDayNames[fullDayIndex];
    } else {
        // If the full day name is not found, return null or handle the error as per your requirement
        return null;
    }
}

  ionViewWillLeave(){
    if (this.fab) {
        this.fab.close();
      }
  }



}


export class WeeklySessionDetailsInput {
  ParentClubKey: string
  ParentClubId: string
  ClubKey: string
  ClubId: string
  MemberKey: string
  MemberId: string
  AppType: number
  ActionType: number
  DeviceType: number
  DeviceId: number
  fetchActiveSession: boolean
  SessionId: string
}

export class WeeklySessionInput {
  sessionId: string
}

export class CancelSessionDate {
  sessionDateId: string
  cancel_reason: string
  cancelled_by: string
}
export class RemoveEnrollment {
  membershipId: string
  userId: string
}

export class ToggleSessionDatePrivateInput {
  sessionDateId: string
  isPrivate: number
}