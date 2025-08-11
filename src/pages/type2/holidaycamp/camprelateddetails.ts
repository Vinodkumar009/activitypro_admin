import { Component, ViewChild } from "@angular/core";
import { ViewController, NavController, Slides, Platform, ActionSheetController, } from "ionic-angular";
import { PopoverController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { ToastController } from "ionic-angular";
import { IonicPage, NavParams, AlertController, ModalController, } from "ionic-angular";
import { FirebaseService } from "../../../services/firebase.service";
import { CommonService, ToastPlacement, ToastMessageType, } from "../../../services/common.service";
import { SharedServices } from "../../services/sharedservice";
import { CallNumber } from "@ionic-native/call-number";
import moment from "moment";
import gql from "graphql-tag";
import { UserPasscode, AttendanceDetails } from "./models/attendancecheckin.model";
import { GraphqlService } from "../../../services/graphql.service";
import { CampUserEnrols, CampUsers } from "./models/holiday_camp.model";
import { GetCampSessionEnrollmentDto } from "./addmembertocamp";
import { formatTransationDate } from "./functions/holidaycamp_utility";
import { PaymentPaidStatusText, PaymentStatusText } from "../../../shared/constants/payment.constants";
import { convertMinutesToHoursAndMinutes } from "../../../shared/utility/utility";
import { AppType, ModuleTypes } from "../../../shared/constants/module.constants";
import { HttpService } from "../../../services/http.service";
import { API } from "../../../shared/constants/api_constants";
@IonicPage()
@Component({
  selector: "page-camprelateddetails",
  templateUrl: "camprelateddetails.html",
  providers:[HttpService]
})
export class CampRelatedDetailsPage {
  selectedSessionObj: any;
  status: any;
  parentClubKey: any;
  holidayCampDetails: any;
  enrolledMembers: CampUserEnrols[] = [];
  enrolledUsersForCamp: CampUsers[] = [];
  enrollments: any;
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
  getCampSessionEnrollmentDto: GetCampSessionEnrollmentDto = {
    sessionId: ''
  }

  getHolidayCampEnrollmentDto: GetHolidayCampEnrollmentDto = {
    holiday_camp_id: ''
  }
  holidaCampSessionDeleteInput: HolidaCampSessionDeleteInput = {
    HolidayCampSessionId: "",
    DeletedBy: ""
  }
  camp_unenrolDTO: camp_unenrolDTO = {
    session_id: "",
    enrolled_id: "",
    AppType: 0, //Which app {0:Admin,1:Member,2:Applus}
    ActionType: 2,
    DeviceType: 1
  }
  @ViewChild(Slides) slides: Slides;
  themeType: number;
  isAndroid: boolean = false;
  campDetails: any;
  memberLists: any;
  sessionList: any;
  // sesionDetails: any;
  currencyDetails = {
    CurrencySymbol: "",
  };;
  block = "";
  blockIndex = -1;
  communicationBlockIndex = -1;
  nestUrl: string = "";
  SessionDate: any;
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
        "n", "n/a", "N/a", "na", "Na", "NA", "nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None ", "Non", "None\n", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
        "Best", "best", "Good", 'good','good '
  ];
  camp_extra_info:EnrolsExtraInfoStats[] = [];
  inclusionSet: Set<String> = new Set<String>(this.inclusionList);
  mem_ses_passcodes: UserPasscode[] = [];
  attendanceDetails: AttendanceDetails = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0, //Which app {0:Admin,1:Member,2:Applus}
    ActionType: 0,
    holidayCampPostGresId: "",
    sessionPostGresId: "",
    attendance_type: 0,
    holidayCampFirebaseKey: "",
    sessionFirebaseKey: "",
  };
  activeSessions = [];
  isShowPasscode: boolean = false;
  isPasscodesAvailable: boolean = false;
  // camp_extra_info = [
  //   {facility_name:"Early Dropoff", is_active:true, is_selected:false,users:[]},
  //   {facility_name:"Late Pickup", is_active:true, is_selected:false,users:[]},
  //   {facility_name:"Lunch", is_active:true, is_selected:false,users:[]},
  //   {facility_name:"Snacks", is_active:true, is_selected:false,users:[]}
  // ]
  constructor(
    public graphqlService: GraphqlService,
    private callNumber: CallNumber,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    public sharedservice: SharedServices,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public commonService: CommonService,
    private viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public popoverCtrl: PopoverController,
    public navCtrl: NavController,
    public storage: Storage,
    public fb: FirebaseService,
    public navParams: NavParams,
    private httpService:HttpService,
  ) {

  }

  ionViewWillEnter() {
    this.themeType = this.sharedservice.getThemeType();
    this.isAndroid = this.platform.is("android");
    this.nestUrl = this.sharedservice.getnestURL();
    // this.campDetails = this.navParams.get("CampDetails");
    // this.sessionList = this.navParams.get("SessionList");
    // this.memberLists = this.navParams.get("MemberList");
    // this.sesionDetails = this.navParams.get("SessionDetails");
    this.loggedin_type = this.sharedservice.getLoggedInType();
    if(this.loggedin_type === 4){
      this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
    }
    this.status = this.navParams.get("status");
    this.holidayCampDetails = this.navParams.get("holidayCampDetails");
    this.selectedSessionObj = this.navParams.get("session");
    //this.selectedSessionObj.duration = convertMinutesToHoursAndMinutes(Number(this.selectedSessionObj.duration))
    console.log('Selected Holiday Camp Details  ' + JSON.stringify(this.holidayCampDetails))
    // console.log('Selected SESSION OBJECT  ' + JSON.stringify(this.selectedSessionObj))
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        // this.getCampSessionEnrollmentDto.sessionId = this.selectedSessionObj.id
        // this.getHolidayCampEnrollmentDto.holiday_camp_id = this.holidayCampDetails.id
        // this.getEnrolledMebers();
        // this.getEnrollmentsForHolidayCamp();
        this.camp_unenrolDTO.ActionType = 2//delete;
        this.camp_unenrolDTO.AppType = AppType.ADMIN_NEW;
        this.camp_unenrolDTO.DeviceType = this.sharedservice.getPlatform() == "android" ? 1:2;
        if (this.status) {
          this.getHolidayCampEnrollmentDto.holiday_camp_id = this.holidayCampDetails.id
          this.getEnrollmentsForHolidayCamp();
        } else {
          this.holidaCampSessionDeleteInput.HolidayCampSessionId = this.selectedSessionObj.id
          console.log(this.holidaCampSessionDeleteInput.HolidayCampSessionId + 'sfngrwkjngjkrgnjkwgnjekwfnjeqkfnb')
          this.holidaCampSessionDeleteInput.DeletedBy = val.$key;
          this.getCampSessionEnrollmentDto.sessionId = this.selectedSessionObj.id;
          this.camp_unenrolDTO.session_id = this.selectedSessionObj.id;
          this.getEnrolledMebers();
          this.getEnrolUsersExtraInfo();
        }

      }
    });
    this.storage
      .get("Currency")
      .then((val) => {
        this.currencyDetails = JSON.parse(val);
      })
      .catch((error) => { });

      this.block = this.navParams.get("Functionality");

  }

  getHours(duration){
    return convertMinutesToHoursAndMinutes(Number(duration));
  }

  formatDate(dateString: string): string {
    const dateObject = new Date(dateString);
    
    const day = ('0' + dateObject.getDate()).slice(-2);
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(dateObject);
    const year = dateObject.getFullYear();
    
    const formattedDate = `${day}-${month}-${year}`;
    console.log(formattedDate);
    return formattedDate;
  }

  formatCurrency(string: string): string {
    // console.log("CURRENCY SYMBOL" + this.currencyDetails.CurrencySymbol);
    const formattedAmount = this.currencyDetails.CurrencySymbol + string;
    return formattedAmount;
  }

  getPaymentMethod(paid_by:number){
    return PaymentPaidStatusText[paid_by]
  }

  getFacilityUsers(index:number){
    this.camp_extra_info[index].is_selected = !this.camp_extra_info[index].is_selected;
    if(this.camp_extra_info[index].is_selected){
      this.camp_extra_info.map((item,selected_ind)=>{
        if(selected_ind!=index){
          item.is_selected = false;
        }
      })  
    }
  }

  deleteSession() {
    // this.holidaCampSessionDeleteInput.HolidayCampSessionId = this.selectedSessions.id
    // console.log(this.holidaCampSessionDeleteInput.HolidayCampSessionId + 'sfngrwkjngjkrgnjkwgnjekwfnjeqkfnb')
    const delete_mutation = gql`
    mutation deleteHolidayCampSession($input: HolidaCampSessionDeleteInput!) {
      deleteHolidayCampSession(input: $input){
        session_id
        session_name
      }
    }`

    const variables = { input: this.holidaCampSessionDeleteInput }

    this.graphqlService.mutate(delete_mutation, variables, 0).subscribe(
      result => {
        // Handle the result
        this.commonService.toastMessage("Successfully deleted session", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        console.log(`deleteCamnp res:${result}`);
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        console.error(error);
      }
    );

  }

  getEnrolledMebers() {
    const enroled_query = gql`
    query getCampSessionEnrollments($input: GetCampSessionEnrollmentDto!){
      getCampSessionEnrollments(input:$input){
        id
        user {
          DOB
          Id
          FirstName
          LastName
          MediaConsent
          MedicalCondition
          IsEnable
          IsChild
          EmailID
          PhoneNumber
          ParentPhoneNumber
          IsChild
          ParentId
          ParentEmailID
        }
        attendanceDetails{
        id
        created_at
        created_by
        updated_at
        is_active
        checked_in
        checked_out
        check_in_time
        check_in_by
        check_in_comments
        check_out_comments
        star_of_the_session
        leaderboard_points
        status
        checked_in
        isPresent
        checkInStatus
      }
      is_earlydrop_applied
      is_latepickup_applied
      is_lunch_opted
      is_snacks_opted
        amount_pay_status
        amount_due
        amount_paid
        passcode
        paid_by
        transaction {
          transaction_date
          paidby
        }
      }
    }
  `;
    this.graphqlService.query(enroled_query, { input: this.getCampSessionEnrollmentDto }, 0)
      .subscribe((res: any) => {
        this.enrolledMembers = res.data.getCampSessionEnrollments;
        console.log("ENROLLED MEMBERS:", JSON.stringify(this.enrolledMembers));
        if (this.enrolledMembers.length > 0) {
          this.enrolledMembers = this.enrolledMembers.map((enol_member) => {
            if (enol_member.transaction && enol_member.transaction.transaction_date) {
                enol_member.transaction.transaction_date = formatTransationDate(enol_member.transaction.transaction_date);
            }
            return enol_member;  // Return the modified or unchanged object
          });
        } else {
          this.commonService.toastMessage("No enrolled member(s) found", 2500, ToastMessageType.Error)
        }
      },
      (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
      })
  }

  getEnrolUsersExtraInfo(){
    const enroled_query = gql`
    query getCampEnrolsExtraInfo($input: GetCampSessionEnrollmentDto!){
      getCampEnrolsExtraInfo(input:$input){
          facility
          count
          user_names
      }
    }
  `;
    this.graphqlService.query(enroled_query, { input: this.getCampSessionEnrollmentDto }, 0)
      .subscribe((res: any) => {
        console.log("extrainfo")
        console.table(res.data.getCampEnrolsExtraInfo);
        this.camp_extra_info = res.data.getCampEnrolsExtraInfo;
        if(this.camp_extra_info.length > 0){
          this.camp_extra_info.map((item, index)=>{
            item.is_selected = false;
          })
        }

      },
      (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
      })
  }

  getEnrollmentsForHolidayCamp() {
    const enrolments_query = gql`
    query getEnrollmentsForHolidayCamp($input: GetHolidayCampEnrollmentDto!){
      getEnrollmentsForHolidayCamp(input:$input){
        Id
      FirstName
      LastName
      amount_due
      amount_paid
      invoice_amount
      txn_user_count
      enrollments {
        id
        amount_pay_status
        amount_due
        amount_paid
        transaction {
          is_active
          transaction_date
          id
          paidby
        }
        session {
          is_active
          start_time
          session_id
          session_day
          session_name
          session_date
          duration
        }
      }
      }
    }
  `;
    this.graphqlService.query(enrolments_query, { input: this.getHolidayCampEnrollmentDto }, 0)
      .subscribe((res: any) => {
        this.enrolledUsersForCamp = res.data.getEnrollmentsForHolidayCamp;
        console.log("ENROLLED Holiday camp  MEMBERS:", JSON.stringify(this.enrolledUsersForCamp));
        if (this.enrolledUsersForCamp.length > 0) {
          for(const enrol of this.enrolledUsersForCamp){
            enrol["pending_txn_count"] = 0;
            enrol["paid_txn_count"] = 0;
            if(enrol.enrollments.length > 0){
              for(const enrol_session of enrol.enrollments){
                if(enrol_session && enrol_session.amount_pay_status.toLowerCase() == "due"){
                  enrol["pending_txn_count"]++;
                }else{
                  enrol["paid_txn_count"]++;
                }
              }
            }
          }
        } else {
          this.commonService.toastMessage("No enrolled members found", 2500, ToastMessageType.Error)
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
        })
  }

  

  showPasscodes() {
    // if (!this.canDoAttendance() || this.mem_ses_passcodes.length == 0) {
    if (!this.canDoAttendance()) {
      this.isShowPasscode = false;
      this.commonService.toastMessage("Passcodes is available post Check-In", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    } else {
      this.isPasscodesAvailable = true;
      this.isShowPasscode = true;
    }
  }
  canDoAttendance(): boolean {
    const today = moment();
    const sessionDate = moment(this.selectedSessionObj.session_date); // No formatting needed!

    console.log(`${today.format("YYYY-MM-DD")}:${sessionDate.format("YYYY-MM-DD")}`); // Log for debugging (optional)

    if (this.enrolledMembers.length === 0) {
      this.commonService.toastMessage('Please add member(s)', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else if (today.isBefore(sessionDate)) {
      this.commonService.toastMessage('You can Check-In on session day only', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    return true; // Attendance allowed if both conditions are met
  }

  // canDoAttendance(): boolean {
  //   const today: any = moment().format("YYYY-MM-DD");
  //   const sessiondate: any = moment(this.selectedSessionObj.session_date, "YYYY-MM-DD").format("YYYY-MM-DD");
  //   console.log(`${today}:${sessiondate}`);
  //   if (this.enrolledMembers.length == 0) {
  //     this.commonService.toastMessage('Please add member(s)', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
  //     return false;
  //   }
  //   else if (moment(today).isBefore(sessiondate)) {
  //     this.commonService.toastMessage('You can Check-In on session day only', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
  //     return false;
  //   }
  //   return true;
  // }

  gotoCheckIn() {
    if (this.canDoAttendance()) {
      console.log(`memberlist:(JSON.stringify(${this.memberLists}))`);
      this.navCtrl.push("CampcheckinPage", {
        holidayCampDetails: this.holidayCampDetails,
        enrolledMembers: this.enrolledMembers,
        selectedSessionObj: this.selectedSessionObj,
        // CampDetails: this.campDetails,
        // SessionList: this.sessionList,
        // MemberList: this.memberLists,
        // SessionDetails: this.sesionDetails,
      });
    }
  }
  gotoCheckOut() {
    if (this.canDoAttendance()) {
      const checkedInMember = this.enrolledMembers.some(e => e.attendanceDetails.checked_in === 1);
      if (checkedInMember) {
        this.navCtrl.push("CampcheckoutPage", {
          holidayCampDetails: this.holidayCampDetails,
          enrolledMembers: this.enrolledMembers,
          selectedSessionObj: this.selectedSessionObj
        });
        return;
      } else {
        this.commonService.toastMessage("Checkout can't be completed until at least 1 member has been checked in.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
    // if (this.canDoAttendance()) {
    //   //if any e.attendanceDetails.checked_in= 1 then push to next page and break the loop

    //   // if (this.mem_ses_passcodes.length != 0) {
    //   console.log(`memberlist:(JSON.stringify(${this.memberLists}))`);
    //   this.navCtrl.push("CampcheckoutPage", {
    //     holidayCampDetails: this.holidayCampDetails,
    //     enrolledMembers: this.enrolledMembers,
    //     selectedSessionObj: this.selectedSessionObj,
    //     // CampDetails: this.campDetails,
    //     // SessionList: this.sessionList,
    //     // MemberList: this.memberLists,
    //     // SessionDetails: this.sesionDetails,
    //   });
    // } else {
    //   this.commonService.toastMessage("Can't Check-Out without Check-In", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    // }
    // }
  }

  editGroupSizeConfirmation(){
    const prompt = this.alertCtrl.create({
      //title: 'Edit capacity',
      message: "Enter revised capacity",
      inputs: [
        {
          type: 'number',
          name: 'session_capacity',
          placeholder: 'session capacity',
          value:this.selectedSessionObj.capacity
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
              if(Number(data.session_capacity) > 0 && data.session_capacity!=''){
                if(Number(data.session_capacity) < this.enrolledMembers.length){
                  this.commonService.toastMessage("Capacity can't be less than enrolled members size", 2500, ToastMessageType.Error);
                  return false;
                }
                this.updateSessionGroupSize(data.session_capacity);
              }else{
                  this.commonService.toastMessage("Please enter valid capacity", 2500, ToastMessageType.Error);
              }
          }
        }
      ]
    });
    prompt.present();
  }

  updateSessionGroupSize(new_capacity:number){
    //CAMP_SESSION_CAPACITY_UPDATE
    const groupSizeInput = {
      session_id:this.selectedSessionObj.id,
      new_capacity:Number(new_capacity),
      //parentclubId:this.postgre_parentclub_id,
      //clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      device_id:this.sharedservice.getDeviceId(),
      action_type:0,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW,
      updated_by:this.sharedservice.getLoggedInId()                 
    }
    
    this.httpService.post(API.CAMP_SESSION_CAPACITY_UPDATE,groupSizeInput).subscribe((res: any) => {
      this.selectedSessionObj.capacity = res.data.updated_capacity;
      const message = "Capacity updated successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
   },
   (error) => {
    console.error("Error in fetching:", error);
    this.commonService.toastMessage("Capacity updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
   }) 

  }

  
  dismiss() {
    this.viewCtrl.dismiss();
  }

  // Initialize the array with false values
  isShowArray: boolean[] = Array(this.enrolledUsersForCamp.length).fill(false);

  showBlock(item, index) {
    if (item.enrollments.length > 0) {
      // Toggle the value of isShow for the corresponding index
      this.isShowArray[index] = !this.isShowArray[index];
    } else {
      this.commonService.toastMessage("No enrollments found", 2500, ToastMessageType.Error);
    }
  }

  tapOnMember(item) {
    if (item.AmountPayStatus == "Due") {
    }
    switch (item.AmountPayStatus) {
      case "Due":
        this.commonService.toastMessage(item.UserName + " has not paid.", 2500);
        break;
      case "Pending Verification":
        this.commonService.toastMessage(
          item.UserName + " paid by Cash/BACS, verification required",
          2500
        );
        break;
      case "Paid":
        this.commonService.toastMessage(item.UserName + " has paid.", 2500);
        break;
    }
  }

  showUserActionSheet(ev:any,enrol_user:CampUserEnrols) {
    if (ev.target.className != "medical_img") {
      let actionSheetButtons = [
        {
          text: "Call",
          icon: "ios-call",
          handler: () => {
            this.makeAcall(enrol_user);
          },
        },
        {
          text: "Notification",
          icon: "ios-notifications",
          handler: () => {
            this.sendNotification(enrol_user);
          },
        },
        {
          text: "Mail",
          icon: "md-mail",
          handler: () => {
            this.sendAMail(enrol_user);
          },
        },
        {
          text: "Profile",
          icon: "ios-contact",
          handler: () => {
            this.getProfile(enrol_user);
          },
        },
      ];


      //if member is Due then show both Remove and Remove all unpaid otherwise only remove
      actionSheetButtons.push({
        text: "Remove",
        icon: "ios-trash",
        handler: () => {
          this.removeConfirm(enrol_user,1); //remove from present individual session
        },
      });

      if (enrol_user.amount_pay_status == "Due" && this.holidayCampDetails.camp_type == "502") {
        actionSheetButtons.push({
          text: "Remove all unpaid",
          icon: "ios-trash",
          handler: () => {
            this.removeConfirm(enrol_user,2); //remove from all individual unpaid sessions
          },
        });
      }

      let actionSheet = this.actionSheetCtrl.create({
        //title: 'Modify your album',
        buttons: actionSheetButtons,
      });
      actionSheet.present();
    } else {
      let alert = this.alertCtrl.create({
        title: "Medical Condition",
        message: `${enrol_user.user.MedicalCondition}`,
        buttons: [
          {
            text: "Ok",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            },
          },
        ],
      });
      alert.present();
    }
  }
  

  removeConfirm(enrol_user:CampUserEnrols,type:number) {
    let title = "Remove Member";
    let message = type == 1 ? "Remove member from session" : "Remove member from all unpaid sessions"
    //let message = "Removes member from session"
    let agreeBtn = "Yes";
    let disAgreeBtn = "No";
    if (enrol_user.amount_pay_status.toLocaleLowerCase() == "paid") {
      (title = "Attention"),
        (message =
          "Please note payment report will still show this payment. Refund will NOT be processed automatically.");
      agreeBtn = "Yes: Remove";
      disAgreeBtn = " Don't Remove";
    }
    let paymentStatus = "Due";

    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: disAgreeBtn,
          handler: () => {
            console.log("Disagree clicked");
          },
        },
        {
          text: agreeBtn,
          handler: () => {
            type == 1 ? this.removeMember(enrol_user):this.removeFromAllUnPaidSessions(enrol_user)
          },
        },
      ],
    });
    confirm.present();
  }

  deleteCampConfirm() {
    let title = "Remove Session";
    let message = "Are you sure you want to remove the session?";
    let agreeBtn = "Yes";
    let disAgreeBtn = "No";

    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: disAgreeBtn,
          handler: () => {
            console.log("Disagree clicked");
          },
        },
        {
          text: agreeBtn,
          handler: () => {
            this.deleteSession();
            // this.removeCamp();
          },
        },
      ],
    });
    confirm.present();
  }


  removeFromAllUnPaidSessions(enrol_user:CampUserEnrols) {
    const all_unenrol_ses = {
      camp_id: this.holidayCampDetails.id,
      user_id: enrol_user.user.Id,
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedservice.getPlatform() == "android"?1:2
      }
    };
    
    const unenrol_mutation = gql`
    mutation campUserMutiSessionUnEnrol($campUserUnEnrol: CampUserMultiSesUnEnrols!) {
      campUserMutiSessionUnEnrol(campUserUnEnrol: $campUserUnEnrol)
    }`

    const unenrol_input = { campUserUnEnrol: all_unenrol_ses }

    this.graphqlService.mutate(unenrol_mutation, unenrol_input, 0).subscribe(
      result => {
        // Handle the result
        this.commonService.toastMessage("Successfully removed from member from all unpaid sessions", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        console.log(`unenro res:${result}`);
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        console.error(error);
      }
    );
    
  }

  removeMember(enrol_user:CampUserEnrols) {
    this.camp_unenrolDTO.enrolled_id = enrol_user.id;
    const unenrol_mutation = gql`
    mutation campUnEnrolUser($campUserUnEnrol: camp_unenrolDTO!) {
      campUnEnrolUser(campUserUnEnrol: $campUserUnEnrol)
    }`

    const variables = { campUserUnEnrol: this.camp_unenrolDTO }

    this.graphqlService.mutate(unenrol_mutation, variables, 0).subscribe(
      result => {
        // Handle the result
        this.commonService.toastMessage("Successfully removed from session", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.camp_unenrolDTO.enrolled_id = ""
        console.log(`deleteCamnp res:${result}`);
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        console.error(error);
      }
    );
    
  }

 

  memberList = [];
  phoneNumber = "";
  makeAcall(enrol_user:CampUserEnrols) {
    const phone_no = enrol_user.user.IsChild ? enrol_user.user.ParentPhoneNumber : enrol_user.user.PhoneNumber;  
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

  async getProfile(enrol_user:CampUserEnrols) {
    try{
      let parent_id = "";
      if(enrol_user.user.IsChild){
          if(enrol_user.user.ParentId && enrol_user.user.ParentId!="" && enrol_user.user.ParentId!="-" && enrol_user.user.ParentId!="n/a"){
              parent_id = enrol_user.user.ParentId;
          }else{
              this.commonService.toastMessage("parentid not available",2500,ToastMessageType.Error);
              return false;
          }
      }else{
          parent_id = enrol_user.user.Id
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

  // email for individual
  sendAMail(enrols:CampUserEnrols) {
    const member_list = []; 
    member_list.push({
      IsChild:enrols.user.IsChild ? true:false,
      ParentId:enrols.user.IsChild ? enrols.user.ParentId:"",
      MemberId:enrols.user.Id, 
      MemberEmail:enrols.user.EmailID!="" && enrols.user.EmailID!="-" && enrols.user.EmailID!="n/a" ? enrols.user.EmailID:(enrols.user.IsChild ? enrols.user.ParentEmailID:""), 
      MemberName: enrols.user.FirstName + " " + enrols.user.LastName
    })
    const session = {}
    const email_modal = {
        module_info:session,
        email_users:member_list,
        type:500
    }
    this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
  }

  sendNotification(enrols:CampUserEnrols){
    const member_ids = [enrols.user.Id];
      this.navCtrl.push("Type2NotificationSession",{
          users:member_ids,
          type:ModuleTypes.HOLIDAYCAMP,
          heading:`Enrolment:${this.holidayCampDetails.camp_name}(${this.selectedSessionObj.session_name})`
      }); 
  }

  notifyToAllMembers() {
    if (this.enrolledMembers.length > 0) {
      const member_ids = this.enrolledMembers.map(enrol_member => enrol_member.user.IsChild ? enrol_member.user.ParentId:enrol_member.user.Id);
      this.navCtrl.push("Type2NotificationSession",{
          users:member_ids,
          type:ModuleTypes.HOLIDAYCAMP,
          heading:`Enrolment:${this.holidayCampDetails.camp_name}(${this.selectedSessionObj.session_name})`
      }); 
    } else {
        this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
    } 
  }

  EmailToAllMembers() {
    if (this.enrolledMembers.length > 0) {
      //const user_enrolments = res.data.getCampSessionEnrollments;
      const member_list = this.enrolledMembers.map((enrol_member:CampUserEnrols) => {
        return {
            IsChild:enrol_member.user.IsChild ? true:false,
            ParentId:enrol_member.user.IsChild ? enrol_member.user.ParentId:"",
            MemberId:enrol_member.user.Id, 
            MemberEmail:enrol_member.user.EmailID!="" && enrol_member.user.EmailID!="-" && enrol_member.user.EmailID!="n/a" ? enrol_member.user.EmailID:(enrol_member.user.IsChild ? enrol_member.user.ParentEmailID:""), 
            MemberName: enrol_member.user.FirstName + " " + enrol_member.user.LastName
        }
    })
    const session = {
        module_booking_club_id:this.holidayCampDetails.club_id,
        module_booking_club_name:this.holidayCampDetails.ClubName,
        module_booking_coach_id:this.holidayCampDetails.Coach[0].Id,
        module_booking_coach_name:this.holidayCampDetails.Coach[0].first_name+" "+this.holidayCampDetails.Coach[0].last_name,
        module_id:this.holidayCampDetails.id,
        module_booking_name:this.holidayCampDetails.camp_name,
        //module_booking_name:`${this.weeklyDets.session_name}(${sesData.session_name},${sesData.session_date})`,
        module_booking_start_date:this.holidayCampDetails.start_date,
        module_booking_end_date:this.holidayCampDetails.end_date,
        //module_booking_start_time:this.holidayCampDetails.start_time,
    }
    const email_modal = {
        module_info:session,
        email_users:member_list,
        type:500
    }
    this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
    } else {
      this.commonService.toastMessage("No member(s) found", 2500, ToastMessageType.Error)
    }
  }

  //membersheet
  gotoMembersheet() {
    this.navCtrl.push('MembersheetPage', {
      sheet_type:2,
      sessionDetails: this.selectedSessionObj,
      CampDetails: this.holidayCampDetails
    });
  }

  // loyaltyPoint() {
  //   this.navCtrl.push("CampSessionLoyalty", {
  //     sessionDetails: this.sesionDetails,
  //     CampDetails: this.campDetails,
  //   });
  // }

  
}

export class GetHolidayCampEnrollmentDto {
  holiday_camp_id: string;
}

export class HolidaCampSessionDeleteInput {
  HolidayCampSessionId: string;
  DeletedBy: string;
}

export class camp_unenrolDTO {
  session_id: string
  enrolled_id: string
  AppType: number; //Which app {0:Admin,1:Member,2:Applus}
  ActionType: number;
  DeviceType: number;
}

export class EnrolsExtraInfoStats {
  facility:string;
  count: string;
  user_names: string[];
  is_selected?:boolean;
}


