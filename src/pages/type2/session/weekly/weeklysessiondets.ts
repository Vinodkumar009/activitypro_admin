import { Component, ViewChild } from '@angular/core';
import { ViewController, NavController, Slides, ActionSheetController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { IonicPage, NavParams, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import moment from 'moment';
// import { analyzeAndValidateNgModules } from '@angular/compiler';
import gql from 'graphql-tag';
import { WeeklySessionDetails } from './weekly.model';
import { GetWeeklySessionDateDetailsResponse, WeeklySessionDateDetailsInput, WeeklySessionMember } from './weeklydatedetails.model';
import { RemoveEnrollment } from './weekly-session-details/weekly-session-details';
import { GraphqlService } from '../../../../services/graphql.service';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { PaymentStatusText } from '../../../../shared/constants/payment.constants';
import { ModuleTypes } from '../../../../shared/constants/module.constants';

/**
 * Generated class for the WeeklysessiondetsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-weeklysessiondets',
  templateUrl: 'weeklysessiondets.html',
})
export class WeeklysessiondetsPage {
  @ViewChild(Slides) slides: Slides;
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
        "n", "n/a", "N/a", "na", "Na", "NA", "nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None ", "Non", "None\n", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
        "Best", "best", "Good", 'good','good '
  ];
  inclusionSet: Set<String> = new Set<String>(this.inclusionList);
  MemberListsForDeviceToken = [];
  Session: any;
  themeType: number;
  isAndroid: boolean = false;
  campDetails: any;
  memberLists: any;
  sessionList: any;
  //sesionDetails: any;
  sessionDetails: any;
  currencyDetails: any;
  block = "";
  blockIndex = -1;
  communicationBlockIndex = -1;
  weeklySession: WeeklySessionDetails;
  individualSessionId: string;
  weeklyData: GetWeeklySessionDateDetailsResponse;
  enrolmentData: WeeklySessionMember[] = []
  //MemberKey:string;
  removeEnrollment:RemoveEnrollment ={
    membershipId: '',
    userId: ''
  }
  weekly_session:WeeklySessionDetails;
  updateName:ChangeSessionDateNameInput={
    sessionDateId: '',
    sessionName: ''
  }
  
  startDate: any = '';
  endDate: any = "";
  loading: any;

  input: WeeklySessionDateDetailsInput = {
    SessionDateId: ''
  }
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
  constructor(private callNumber: CallNumber, private graphqlService: GraphqlService, platform: Platform, public sharedservice: SharedServices, public modalCtrl: ModalController, public alertCtrl: AlertController, public commonService: CommonService, private viewCtrl: ViewController, public toastCtrl: ToastController, public popoverCtrl: PopoverController,
    public navCtrl: NavController, public storage: Storage, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController, public fb: FirebaseService, public navParams: NavParams) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    
    
    // this.memberLists.forEach(element => {
    //   if (element.TransactionDate) {
    //     element.TransactionDate = moment(element.TransactionDate).format("DD-MM-YY")
    //   }
    // });


    // for (let i = 0; i < this.Session.Members.length; i++) {
    //   this.fb.getPropValue(`/Member/${this.Session.Members[i].ParentClubKey}/${this.Session.Members[i].ClubKey}/${this.Session.Members[i].Key}/MedicalCondition`).then(data => {
    //     this.Session.Members[i]['MedicalCondition'] = data ? data : this.Session.Members[i]['MedicalCondition'];
    //     this.Session.Members[i]['HasDisease'] = !this.inclusionSet.has(this.Session.Members[i]['MedicalCondition'].trim().toLowerCase());
    //   });

    //   this.fb.getPropValue(`/Member/${this.Session.Members[i].ParentClubKey}/${this.Session.Members[i].ClubKey}/${this.Session.Members[i].Key}/IsEnable`).then(data => {
    //     this.Session.Members[i]['IsEnable'] = data ? data : this.Session.Members[i]['IsEnable'];
    //   });
    //   if (this.Session.Members[i].IsChild) {
    //     this.fb.getPropValue(`/Member/${this.Session.Members[i].ParentClubKey}/${this.Session.Members[i].ClubKey}/${this.Session.Members[i].ParentKey}/EmailID`).then((data) => {
    //       this.Session.Members.EmailID = data;
    //     })
    //   }

    // }
    
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        if (val.$key != "") {
          //this.MemberKey = val.$key;
        }
      }
    })
  }

  ionViewWillEnter(){
    this.loggedin_type = this.sharedservice.getLoggedInType();
    if(this.loggedin_type == 4){
        this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
    }
    this.individualSessionId = this.navParams.get("individualWeekly");
    console.log("complete individual information:", this.individualSessionId);
    this.input.SessionDateId = this.individualSessionId;
    this.weeklySessionDetails();
    this.weekly_session = this.navParams.get("weekly_session")
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {});

    this.calculateRevenue();
  }

  sessionMemberAndPrice = {
    NumberOfMemberPaid: "0",
    NumberOfMemberEnrolled: "0",
    TotalAmount: "0",
    AmountPaid: "0"
  }


  GetFormattedTransDate(trnsdate) {
    return moment(trnsdate, "YYYY-MM-DD").format("DD-MMM");
  }

  calculateRevenue() {
    let totalRevenue = 0;
    let totalPaid = 0;
    let numberOfMemberPaid = 0;
    // for (let i = 0; i < this.Session.Members.length; i++) {
    //   if (this.Session.Members[i].IsActive) {
    //     try {
    //       if (this.Session.Members[i].AmountPayStatus == "Paid") {
    //         //if (!(isNaN(totalRevenue + (parseFloat(this.Session.Members[i].TotalFeesAmount))))) {
    //         totalRevenue += parseFloat(this.Session.Members[i].TotalFeesAmount);
    //         if (this.Session.Members[i].AmountPayStatus != "Due") {
    //           numberOfMemberPaid++;
    //           totalPaid += parseFloat(this.Session.Members[i].TotalFeesAmount);
    //         }
    //         //}
    //       }
    //     } catch (ex) {
    //       console.log(ex);
    //     }
    //   }
    // }
    // this.enrolledMemberInsession = this.commonService.sortingObjects(this.enrolledMemberInsession, "FirstName");
    // this.sessionMemberAndPrice.TotalAmount = parseFloat(totalRevenue.toString()).toFixed(2);
    // this.sessionMemberAndPrice.NumberOfMemberEnrolled = (this.enrolledMemberInsession.length).toString();
    // this.sessionMemberAndPrice.AmountPaid = parseFloat(totalPaid.toString()).toFixed(2);
    // this.sessionMemberAndPrice.NumberOfMemberPaid = numberOfMemberPaid.toString();

  }

  ionViewDidLoad() {
    console.log("WeeklyDetails Page Called!");

  }

  

  weeklySessionDetails() {
    this.commonService.showLoader("Please wait");
    //payment_instructions
    const weeklySessionDateDetails = gql`
       query getWeeklySessionDateDetails($input: WeeklySessionDateDetailsInput!){
             getWeeklySessionDateDetails(input:$input){
              id
              session_name
              bookingCount
              totalPaid
              totalPending
              session_name
              session_day
              session_date
              start_time
              end_time
              weeklySession {
                id
                session_name
                start_date
                end_date
                duration
                fee_for_member
                fee_for_nonmember
                coach_names
                coach_images
              }
              weeklySessionMember{
                id
                amount_pay_status
                paid_amount
                amount_due
                passcode
                total_amount
                amount_pay_status_text
                admin_comments
                user_comments
                transaction_date
                paid_by
                paid_by_text
                member{
                    Id
                    ParentId
                    FirstName
                    LastName
                    DOB
                    Gender
                    IsChild
                    IsEnable
                    ParentEmailID
                    EmailID
                    PhoneNumber
                    ParentPhoneNumber
                    MedicalCondition
                }
              }
           }
          }
       `;
    this.graphqlService.
      query(
        weeklySessionDateDetails, { input: this.input }, 0)
      .subscribe((data: any) => {
        this.commonService.hideLoader();
        try {
          this.weeklyData = data.data.getWeeklySessionDateDetails;
          this.enrolmentData = data.data.getWeeklySessionDateDetails.weeklySessionMember;
        } catch (error) {
          console.error("Error while processing data:", error);
          // Handle error gracefully here, such as displaying a message to the user.
        }
      },
        (error) => {
          this.commonService.hideLoader()
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
  dismiss() {
    this.viewCtrl.dismiss();
  }

  showBlock(index, item) {
    this.blockIndex = (this.blockIndex == index) ? -1 : index;
    if (this.blockIndex != -1) {
      let msg = "";
      if (item.AmountPayStatus == "Due") {
        msg = this.currencyDetails.CurrencySymbol + "" + item.AmountDue + " due for " + item.Session.length + " Sessions";
      } else {
        msg = this.currencyDetails.CurrencySymbol + "" + item.AmountPaid + " paid for " + item.Session.length + " Sessions";
      }

      this.showToast(msg, 2000);
    }

  }
  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }
  tapOnMember(enrol_member: WeeklySessionMember, payStatus: string, ev: any) {
    if (ev.target.className != "medical_img") {
      let actionSheet;
      actionSheet = this.actionSheetCtrl.create({
        //title: 'Modify your album',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Notify',
            icon: "ios-chatbubbles",
            handler: () => {
              this.sendNotification(enrol_member);
            }
          }, {
            text: 'Email',
            icon: "ios-mail",
            handler: () => {
              this.sendAMail(enrol_member);
            }
          }, {
            text: 'Call',
            icon: "ios-call",
            handler: () => {
              this.makeAcall(enrol_member);
            }
          },
          {
            text: 'Update Payment',
            icon: 'ios-create',
            handler: () => {
              this.UpdatePayment(enrol_member);
            }
          },
          {
            text: 'Profile',
            icon: 'ios-contact',
            handler: () => {
              this.getProfile(enrol_member);
            }
          }, {
            text: 'Remove Member',
            icon: "ios-trash",
            handler: () => {
              this.remove(enrol_member, payStatus);
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
    } else {
      let alert = this.alertCtrl.create({
        title: 'Medical Condition',
        message: `${enrol_member.member.MedicalCondition}`,
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
        ]
      });
      alert.present();
    }

  }
  memberList = [];
  phoneNumber = "";


  // making  a call to memmber,if member mob not available call parent
  async makeAcall(enrol_member: WeeklySessionMember) {
    const phone_no = enrol_member.member.IsChild ? enrol_member.member.ParentPhoneNumber : enrol_member.member.PhoneNumber;  
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

  //navigating to user profile page
  async getProfile(enrol_member: WeeklySessionMember) {
    try{
      let parent_id = "";
      if(enrol_member.member.IsChild){
          if(enrol_member.member.ParentId && enrol_member.member.ParentId!="" && enrol_member.member.ParentId!="-" && enrol_member.member.ParentId!="n/a"){
              parent_id = enrol_member.member.ParentId;
          }else{
              this.commonService.toastMessage("parentid not available",2500,ToastMessageType.Error);
              return false;
          }
      }else{
          parent_id = enrol_member.member.Id
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

  //sending a mail
  sendAMail(enrol_member: WeeklySessionMember) {
    const member_list = []; 
    member_list.push({
      IsChild:enrol_member.member.IsChild ? true:false,
      ParentId:enrol_member.member.IsChild ? enrol_member.member.ParentId:"",
      MemberId:enrol_member.member.Id, 
      MemberEmail:enrol_member.member.EmailID!="" && enrol_member.member.EmailID!="-" && enrol_member.member.EmailID!="n/a" ? enrol_member.member.EmailID:(enrol_member.member.IsChild ? enrol_member.member.ParentEmailID:""), 
      MemberName: enrol_member.member.FirstName + " " + enrol_member.member.LastName
    })
    const session = {}
    const email_modal = {
        module_info:session,
        email_users:member_list,
        type:102
    }
    this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
  }

  //print individual session report
  gotoPrintMember() {
    if (this.enrolmentData.length > 0) {
      const members = this.enrolmentData.map((enrol_user)=>{
          return {
              StartDate: this.weekly_session.start_date,
              EndDate: this.weekly_session.end_date,
              FirstName: enrol_user.member.FirstName,
              LastName: enrol_user.member.LastName,
              MedicalCondition: enrol_user.member.MedicalCondition,
              Age: enrol_user.member.DOB,
              Gender: enrol_user.member.Gender,
              PaymentStatus: enrol_user.amount_pay_status_text,
              PhoneNumber: enrol_user.member.IsChild ? enrol_user.member.ParentPhoneNumber:enrol_user.member.PhoneNumber,
              EmailID: enrol_user.member.IsChild ? enrol_user.member.ParentEmailID:enrol_user.member.EmailID,
              // ExtraLine: true,
              // ExtraLineNumber: 10,
              MemberType:"1"
          }
      })
      const session_info = {
          session_name:`${this.weekly_session.session_name}:${this.weeklyData.session_name}`,
          club_name:this.weekly_session.club.ClubName,
          coach_name:this.weekly_session.coach_names
      }
      this.navCtrl.push("SessionmembersheetPage", {session_info:session_info,repor_members:members,type:100});
    } else {
        this.commonService.toastMessage("No member(s) found in the current session",2500,ToastMessageType.Error);
    }     
  } 

  sendNotification(enrol_member: WeeklySessionMember) {
    const member_ids = [enrol_member.member.IsChild ? enrol_member.member.ParentId:enrol_member.member.Id];
    this.navCtrl.push("Type2NotificationSession",{
      users:member_ids,
      type:ModuleTypes.WEEKLYSESSION,
      heading:`Enrolment:${this.weeklyData.session_name}`
    })            
  }

  // asking session name prompt
  showEditPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Enter Session Name',
      inputs: [
        {
          name: 'sessionname',
          placeholder: 'Session Name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: data => {
            if (data.sessionname != "") {
             // this.UpdateSessionName(data.sessionname);
             this.updateSessionName(data.sessionname)
            } else {
              this.commonService.toastMessage("Please enter session name", 2500,ToastMessageType.Error);
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }


  UpdateSessionName(session: string) {
    this.fb.update(this.Session.Key, `/Session/${this.sessionDetails.ParentClubKey}/${this.sessionDetails.ClubKey}/${this.sessionDetails.CoachKey}/${this.sessionDetails.SessionType}/${this.sessionDetails.$key}/Sessions`, { SessionName: session }).then((status) => {
      this.Session.SessionName = session;
      this.commonService.toastMessage("Session name updated", 2500,ToastMessageType.Success);
    }).catch((err) => this.commonService.toastMessage(err, 2500,ToastMessageType.Error))
  }

  //****************************** */
  //  Remove member from session
  //----------
  remove(member, status) {
    let title = "Remove Member";
    let message = "Are you sure you want to remove the member?";
    let agreeBtn = "Yes";
    let disAgreeBtn = "No"
    if (status == 1) {
      title = "Attention",
        message = "Please note payment report will still show this payment. Refund will NOT be processed automatically."
      agreeBtn = "Yes: Remove";
      disAgreeBtn = " Don't Remove"
    }
    let paymentStatus = "Due";

    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: disAgreeBtn,
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: agreeBtn,
          handler: () => {
           // this.removeMember(member, status);
           this.cancelWeeklyEnrolMent(member)
          }
        }
      ]
    });
    confirm.present();

  }

  

  //navigating to payment updation page
  UpdatePayment(member:WeeklySessionMember) {
    this.navCtrl.push("Type2PaymentDetailsForWeekly", { 
      selected_member: member, 
      selectded_session: {
        session_id:this.weeklyData.id,
        session_name:this.weeklyData.session_name,
        weekly_session_id:this.weeklyData.weeklySession.id,
        weekly_session_name:this.weeklyData.weeklySession.session_name,
      }
    });
  }

  cancelWeeklyEnrolMent(enrol:WeeklySessionMember){
    try {
      this.removeEnrollment.membershipId = enrol.id;
      this.removeEnrollment.userId = enrol.member.Id;
      // Set the headers (optional)
      const delete_weekly_sess = gql`
        mutation cancelWeeklySessionEnrollment($input: RemoveEnrollment!) {
          cancelWeeklySessionEnrollment(input: $input) {
            id
          }
        }`;

      const delete_weekly_variable = { input: this.removeEnrollment };

      this.graphqlService.mutate(
        delete_weekly_sess,
        delete_weekly_variable,
        0
      ).subscribe((response) => {
        const message = "Member  removed successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
        // this.reinitializeSession();
      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Member deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {
      // Handle any synchronous errors that may occur outside of the GraphQL mutation
      console.error("An error occurred:", error);
      // Additional error handling or logging can be added here
    }
  }


  


  async updateSessionName(data){
    try{
      this.updateName.sessionDateId=this.individualSessionId;
      this.updateName.sessionName=data;
      const update_session_name=gql`
       mutation updateSessionDateName($input: ChangeSessionDateNameInput!){
        updateSessionDateName(input:$input){
          id
        }
       }
      `;
      const update_session_var={input:this.updateName}
      this.graphqlService.mutate(
        update_session_name,
        update_session_var,
        0
      ).subscribe((response) => {
        const message = "Session Name Updated Successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
       this.weeklySessionDetails();
      }, (err) => {
       
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Session deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });
    }catch (error) {
      
      console.error("An error occurred:", error);
      
    }
   
   
  }
 


}


export class ChangeSessionDateNameInput {
  sessionDateId: string
  sessionName: string
}