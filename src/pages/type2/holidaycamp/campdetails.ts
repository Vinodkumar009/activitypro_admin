import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController, FabContainer, LoadingController, ToastController, AlertController, ActionSheetController } from "ionic-angular";
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
// /import { first } from "rxjs/operators";
import moment from 'moment';
import gql from 'graphql-tag';
import { CampUsers, HolidayCamp } from './models/holiday_camp.model';
import { GraphqlService } from '../../../services/graphql.service';
import { convertToHoursMinutes } from './functions/holidaycamp_utility';
import { ModuleTypes } from '../../../shared/constants/module.constants';
@IonicPage()
@Component({
  selector: 'campdetails-page',
  templateUrl: 'campdetails.html',
})

export class Type2CampDetails {
  selectedCampId: string;
  holidayCampDetails: HolidayCamp;
  bookingMemberCount: any;

  holidayCampDetailInput: HolidayCampDetailInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    PostgresFields: {
      PostgresParentclubId: '',
      PostgresClubId: '',
      PostgresActivityId: ''
    },
    ActivityKey: '',
    HolidayCampId: '',
    UserMemberId: '',
    FetchActiveSession: false
  }

  holidaCampDeleteInput: HolidaCampDeleteInput = {
    HolidayCampId: '',
    DeletedBy: ''
  }

  showSession: boolean = false;
  @ViewChild('fab') fab: FabContainer; showMember: boolean = true;
  themeType: any;
  parentClubKey = "";
  campDetails: any;
  sessionList = [];
  memberList = [];
  myIndex = -1;
  totalDuration = 0;
  showBlock = false;
  noOfMembers = 0;
  bookedSessionLength = 0;
  currencyDetails = {
    CurrencySymbol: "",
  };
  selectedSessions = [];
  amountDetails = {
    TotalAmount: 0,
    TotalDue: 0,
    TotalPaid: 0,
    TotalPaidPercentage: 0
  }
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
    "n", "n/a", "N/a", "na", "Na", "NA", "nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
    "Best", "best", "Good", 'good'
  ];
  inclusionSet: Set<String> = new Set<String>(this.inclusionList);
  circleTitle = "";
  subtitle = "";
  memberLen = 0;
  bookingCount:number = 0;
  bookedSessionCount:number = 0;
  totBookedUserCount:number = 0;
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
  constructor(public graphqlService: GraphqlService, private platform: Platform, public comonService: CommonService, public actionSheetCtrl: ActionSheetController, public commonService: CommonService, public viewCtrl: ViewController, public fb: FirebaseService, private toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private navParams: NavParams, public navCtrl: NavController, public storage: Storage, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    //console.log(this.campDetails)
    
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.holidaCampDeleteInput.DeletedBy = val.$key;
        // this.holidaCampDeleteInput.HolidayCampId = this.selectedCampId.id
        // this.holidayCampDetailInput.HolidayCampId = this.selectedCampId
        // this.holidayCampDetailInput.UserMemberId = val.$key
        // this.getCampDetails();
      }
    });
    this.subtitle = parseFloat((this.amountDetails.TotalPaid).toString()).toFixed(2) + " Paid";
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
      let x = this.circleTitle;
      this.circleTitle = "";
      this.circleTitle = this.currencyDetails.CurrencySymbol + "" + x;
      this.subtitle = this.currencyDetails.CurrencySymbol + this.subtitle;
    }).catch(error => {
    });
  }

  ionViewDidLoad(){
    
  }
  ionViewWillEnter() {
    this.commonService.screening("Type2CampDetails");
    this.loggedin_type = this.sharedservice.getLoggedInType()
    this.selectedCampId = this.navParams.get('camp');
    this.holidayCampDetailInput.HolidayCampId = this.selectedCampId
    this.holidayCampDetailInput.PostgresFields.PostgresParentclubId = this.sharedservice.getPostgreParentClubId();
    console.log('CAMPList ID' + JSON.stringify(this.selectedCampId));
    this.getCampStats();
    this.getCampDetails();
  }

  calculateTotalDuration() {
    if (!this.holidayCampDetails || !this.holidayCampDetails.sessions) {
      return 0; // Handle cases where holidayCampDetails or sessions are missing
    }
    let totalDuration = 0;
    for (const session of this.holidayCampDetails.sessions) {
      totalDuration+=parseInt(session.duration)
      
    }
    return convertToHoursMinutes(totalDuration);
  }

  formatDateWithoutYear(dateString: string): string {
    const date = moment(dateString,"DD-MMM-YYYY");
    // Format the date with DD-MMM format
    const formattedDate = date.format("DD-MMM");
    return formattedDate;
  }

  getCampStats() {
    //this.commonService.showLoader("Please wait");
    const query = gql`
    query getHolidayCampStats($holidayCampDetailInput: HolidayCampDetailInput!){
      getHolidayCampStats(holidayCampDetailInput:$holidayCampDetailInput){
        bookedSessionCount
        bookingCount
        totalBookingCount
      }
    }
    `;
    this.graphqlService.query(query, { holidayCampDetailInput: this.holidayCampDetailInput }, 0)
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        //this.holidayCampDetails = res.data.getHolidayCampStats;
        console.log("HOLIDAY STATS DATA:", JSON.stringify(res.data.getHolidayCampStats));
        this.bookingCount = res.data.getHolidayCampStats.bookingCount;
        this.bookedSessionCount = res.data.getHolidayCampStats.bookedSessionCount;
        this.totBookedUserCount = res.data.getHolidayCampStats.totalBookingCount;
      },
      (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
      })
  }


  getCampDetails() {
    this.commonService.showLoader("Please wait");
    const query = gql`
    query getHolidayCampDetails($holidayCampDetailInput: HolidayCampDetailInput!){
      getHolidayCampDetails(holidayCampDetailInput:$holidayCampDetailInput){
          duration_per_day
          is_multi_sport
          capacity
          minimum_sessioncount
          is_allow_cash_payment
          is_child_care_voucher_accepted
          pay_by_date
          venuekey
          SquadSize
          is_restricted_squad_size
          moderator
          is_active
          days
          bookingCount
          bookedSessionCount
          session_count
          enrolment_count
          id
          is_early_drop_allowed
          is_late_pickup_allowed
          early_drop_fees_member
          early_drop_fees_non_member
          late_pickup_fees_member
          late_pickup_fees_non_member
          is_lunch_allowed
          is_snacks_allowed
          lunch_price
          lunch_price_non_member
          snack_price
          snack_price_non_member
          lunch_text
          early_drop_time
          late_pick_up_time
          holidaycamp_information
          show_additional_info
          camp_name
          venue_name
          camp_type
          ClubKey
          session_count
          start_date
          end_date
          age_group
          full_amount_for_member
          full_amount_for_non_member
          per_day_amount_for_member
          per_day_amount_for_non_member
          Coach {
            coach_firebase_id
            Id
            first_name
            last_name
            profile_image
          }
          sessions {
            is_active
            id
            session_name
            session_date
            session_day
            start_time
            end_time
            duration
            amount_for_member
            amount_for_non_member
            capacity
            capacity_left
            bookingCount
          }
          Activity {
            Id
            ActivityName
            ActivityCode
            FirebaseActivityKey
          }         
          club {
            Id
            ClubName
            FirebaseId
          }
          images {
            id
            image_url
            image_sequence
          }
          additional_info {
            id
            parentClub
            title
            body
            buttonOneText
            buttonTwoText
            visibility
            sequenceNo
            module
            contentUrl
            category
            legalNotificationText
            term_action_type
          }
           session_configs {
            id
            session_id
            session_name
            start_time
            session_day
            duration
            amount_for_member
            amount_for_non_member
            session_date
            session_day
            capacity
          }
        }
    }
    `;
    this.graphqlService.query(query, { holidayCampDetailInput: this.holidayCampDetailInput }, 0)
      .subscribe((res: any) => {
        this.commonService.hideLoader();
        this.holidayCampDetails = res.data.getHolidayCampDetails;
        console.log("HOLIDAY CAMP DETAILS DATA:", JSON.stringify(this.holidayCampDetails));
        this.bookingMemberCount = this.holidayCampDetails.bookingCount
      },
      (error) => {
          this.commonService.hideLoader();
          console.error("Error in fetching:", error);
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

  memberDetailsForGroup(index) {
    this.myIndex = this.myIndex == index ? -1 : index;
  }

  ionViewDidEnter() {
    this.fab.close();
  }
  
  getCoachName(Coach) {
    let coachArr = Array.isArray(Coach) ? Coach : this.commonService.convertFbObjectToArray(Coach);
    let coachName = "";
    for (let i = 0; i < coachArr.length; i++) {
      if (coachArr.length != 1 || i == coachArr.length - 1) {
        coachName += coachArr[i].CoachName;
      } else {
        coachName += ", " + coachArr[i].CoachName
      }
    }
    return coachName;
  }

  getCampType(type): string {
    if (type == "502") {
      return "Multi day camp";
    } else if (type == "501") {
      return "Single day camp";
    }
  }
  getDate_DD_MMM_YYYY_Format(date): string {
    let d = new Date(date);
    let month = "";
    switch (d.getMonth()) {
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

    return d.getDate() + "-" + month + "-" + d.getFullYear();
    // return date;
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
  showMemberDetails() {
    this.showSession = false;
    this.showMember = true;
  }
  showSessionDetails() {
    this.showMember = false;
    this.showSession = true;
  }



  presentActionSheetTapOnCamp() {
    let camp = this.campDetails;
    let actionSheet;
    let holidayCampDetails = this.holidayCampDetails;
    actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Discount',
          icon: this.platform.is('android') ? 'settings' : '',
          handler: () => {
            this.applyDiscount();
          }
        }, {
          text: 'Edit Camp',
          icon: this.platform.is('android') ? 'ios-create-outline' : '',
          handler: () => {
            this.editHolidayCampDetails(holidayCampDetails);
          }
        }, {
          text: 'Add Member',
          icon: this.platform.is('android') ? 'person-add' : '',
          handler: () => {
            this.selectSessionsForAddingMember(holidayCampDetails)
          }
        }, {
          text: 'Remove Member',
          icon: this.platform.is('android') ? 'person' : '',
          handler: () => {
            //this.addMemberToCamp(camp)
          }
        },
        {
          text: 'Update Payment',
          icon: this.platform.is('android') ? 'create' : '',
          handler: () => {
            this.updateMemberDetails()
          }
        }, {
          text: 'Delete Camp',
          cssClass: 'dangerRed',
          icon: this.platform.is('android') ? 'trash' : '',
          handler: () => {
            this.removeCamp();
          }
        }, {
          text: 'Email',
          icon: this.platform.is('android') ? 'md-mail' : '',
          handler: () => {
            //this.emailtoCampmember(camp);
          }
        },
        {
          text: 'Member Sheet',
          icon: this.platform.is('android') ? 'ios-clipboard' : '',
          handler: () => {
            this.navCtrl.push('MembersheetPage', {
              // sessionDetails: item,
              sheet_type:1,
              CampDetails: this.campDetails
            });
          }
        },
        {
          text: 'Notification',

          icon: this.platform.is('android') ? 'md-chatbubbles' : '',
          handler: () => {
            this.notificationToCampMember();
          }
        }
        , {
          text: 'Cancel',
          icon: this.platform.is('android') ? 'close' : '',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });

    actionSheet.present();

  }
  
  gotoMembersheet() {
    this.navCtrl.push('MembersheetPage', {
      // sessionDetails: item,
      sheet_type: 1, //for whole camp and 2 for individual session
      CampDetails:this.holidayCampDetails
    });
  }

  applyDiscount() {
    this.navCtrl.push("Type2DiscountDetails", { camp_id: this.holidayCampDetails.id });
  }

  //navigating to payment updations
  updateMemberDetails() {
    this.navCtrl.push("UpdateHolidayCampPaymentDetails", { camp:this.holidayCampDetails });
  }

  //edit req navigation
  editHolidayCampDetails(holidayCampDetails) {
    if(this.holidayCampDetails.session_configs.length > 0){
      this.holidayCampDetails.session_configs = this.holidayCampDetails.session_configs.map((session_config) => ({
        ...session_config,
        duration:convertToHoursMinutes(Number(session_config.duration))
      }))
    }
    this.navCtrl.push("Type2EditHolidayCamp", { holidayCampDetails: holidayCampDetails });
  }
//copy req navigation
  copyHolidayCampDetails() {
    if(this.holidayCampDetails.session_configs.length > 0){
      this.holidayCampDetails.session_configs = this.holidayCampDetails.session_configs.map((session_config) => ({
        ...session_config,
        duration:convertToHoursMinutes(Number(session_config.duration))
      }))
    }
    this.navCtrl.push("Type2CopyCamp", { holidayCampDetails: this.holidayCampDetails });
  }

  
  removeCamp() {
    let confirm = this.alertCtrl.create({
      title: 'Delete Camp',
      message: 'Are you sure you want to delete the Camp? ',
      buttons: [
        {
          text: 'No',
          handler: () => {},
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteCamp();
          }
        }
      ]
    });
    confirm.present();
  }

  // reConfirmDelete(camp) {
  //   //There are members in the holiday camp. Do you still want to go ahead and delete the Camp?
  //   let confirm = this.alertCtrl.create({
  //     title: 'Reconfirm Delete Camp',
  //     message: 'There are members in the holiday camp. Do you still want to go ahead and delete the Camp?',
  //     buttons: [
  //       {
  //         text: 'No',
  //         handler: () => {
  //         }
  //       },
  //       {
  //         text: 'Yes: Delete',
  //         handler: () => {
  //           //this.deleteCamp(camp);
  //           this.commonService.toastMessage("Camp removed successfully.", 2000, ToastMessageType.Success, ToastPlacement.Bottom);
  //           this.fb.update(camp.$key, "HolidayCamp/" + camp.ParentClubKey, { IsEnable: false });
  //           this.navCtrl.pop();
  //         }
  //       }
  //     ]
  //   });
  //   confirm.present();
  // }
  deleteCamp() {
    this.holidaCampDeleteInput.HolidayCampId = this.holidayCampDetails.id
    const delete_camp_mutation = gql`
    mutation deleteHolidayCamp($input: HolidaCampDeleteInput!) {
      deleteHolidayCamp(input: $input){
        id
        camp_name
        camp_type
      }
    }`

    const variables = { input: this.holidaCampDeleteInput }

    this.graphqlService.mutate(delete_camp_mutation, variables, 0).subscribe(
      result => {
        // Handle the result
        this.commonService.toastMessage("Successfully deleted camp", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("update_camps_list");
        console.log(`deleteCamnp res:${result}`);
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        console.error(error);
      }
    );
    
  }
  
  selectSessionsForAddingMember(holidayCampDetails: any) {
    let sessions = holidayCampDetails.sessions.filter(camp_session => camp_session.is_active);

    if (!sessions) {
      console.error("Unable to access or filter sessions.");
      return; // Or handle it differently based on your needs
    }

    // sessions = sessions.filter(session => session.IsActive);

    if (sessions.length > 0) {
      let alert = this.alertCtrl.create();
      alert.setTitle('Select Session to add member');

      for (let session of sessions) {
        alert.addInput({
          type: 'radio',
          label: session.session_date + " " + session.session_day + " - " + session.session_name,
          value: session.id // Pass session ID as the value
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: data => {
          // Assuming data contains the selected session ID
          const selectedSession = sessions.find(session => session.id === data);

          if (selectedSession) {
            this.navCtrl.push("Type2AddMemberHolidayCamp", {
              holidayCampDetails: holidayCampDetails,
              selectedSessionId: selectedSession.id,
              selectedSessionCapacity: selectedSession.capacity,
            });
          } else {
            console.error("Unable to find selected session.");
          }
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No sessions", 3000,ToastMessageType.Error);
    }
  }





  // selecteSessionsForAddingMember(holidayCampDetails) {
  //   let sessions = [];
  //   if (Array.isArray(camp.Session)) {
  //     sessions = camp.Session.filter(session => session.IsActive);
  //   } else {
  //     sessions = this.comonService.convertFbObjectToArray(camp.Session).filter(session => session.IsActive);
  //   }

  //   if (sessions.length > 0) {
  //     let alert = this.alertCtrl.create();
  //     alert.setTitle('Select Session to add member');

  //     for (let sessionIndex = 0; sessionIndex < sessions.length; sessionIndex++) {
  //       alert.addInput({
  //         type: 'radio',
  //         label: this.getDate_DD_MMM_YYYY_Format1(sessions[sessionIndex].SessionDate) + " " + sessions[sessionIndex].Day + " - " + sessions[sessionIndex].SessionName,
  //         value: sessions[sessionIndex].Key,
  //         //checked: false
  //       });
  //     }

  //     alert.addButton('Cancel');
  //     alert.addButton({
  //       text: 'OK',
  //       handler: data => {

  //         this.selectedSessions = [];
  //         // for (let i = 0; i < data.length; i++) {
  //         //   for (let j = 0; j < session.length; j++) {
  //         //     if (session[j].Key == data[i]) {
  //         //       this.selectedSessions.push(session[j]);
  //         //       break;
  //         //     }
  //         //   }
  //         // }
  //         const session = sessions.find(session => session.Key === data);
  //         this.selectedSessions.push(session);
  //         this.navCtrl.push("Type2AddMemberHolidayCamp", { CampDetails: camp, Sessions: this.selectedSessions });
  //       }
  //     });

  //     alert.present();

  //   } else {
  //     this.showToast("No sessions", 3000);

  //   }

  // }
  getDateIn_DDMM_Format(date): string {
    let d = new Date(date);
    let month = "";
    switch (d.getMonth()) {
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

    return d.getDate() + "-" + month;
  }

  showDetails(item, clickOn) {
    let memberlist = JSON.parse(JSON.stringify(this.memberList));
    if (clickOn == "Session") {
      this.navCtrl.push("CampRelatedDetailsPage", { holidayCampDetails: this.holidayCampDetails, session: item, status: false }); //true shows all enroled members
      // this.navCtrl.push("CampRelatedDetailsPage", { CampDetails: this.campDetails, SessionList: this.sessionList, MemberList: memberlist, SessionDetails: item, Functionality: clickOn });
    } else if (clickOn == "Member") {
      this.navCtrl.push("CampRelatedDetailsPage", { holidayCampDetails: this.holidayCampDetails, status: true }); //false shows all enroled members for particular session
      // this.navCtrl.push("CampRelatedDetailsPage", { CampDetails: this.campDetails, SessionList: this.sessionList, MemberList: memberlist, SessionDetails: item, Functionality: clickOn });
    }
  }


  showSessionActionSheet(item) {
    let camp = this.campDetails;
    let actionSheet;
    if (this.platform.is('android')) {
      actionSheet = this.actionSheetCtrl.create({

        buttons: [
          {
            text: 'Member',
            icon: 'ios-people',
            handler: () => {
              this.showDetails(item, "Session");
            }
          }, {
            text: 'Notify',
            icon: 'ios-notifications',
            handler: () => {
              this.notificationToCampMember();
            }
          }, {
            text: 'Email',
            icon: 'md-mail',
            handler: () => {
              //this.sentAnEmailToMember(item);
            }
          },
          {
            text: 'Member Sheet',
            icon: 'ios-clipboard',
            handler: () => {
              this.navCtrl.push('MembersheetPage', {
                sessionDetails: item,
                CampDetails: this.campDetails
              });
            }
          }
          , {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {

            }
          }
        ]
      });
    } else {
      actionSheet = this.actionSheetCtrl.create({

        buttons: [
          {
            text: 'Member',
            handler: () => {
              this.showDetails(item, "Session");
            }
          }, {
            text: 'Notify',
            handler: () => {
              this.notificationToCampMember();
            }
          }, {
            text: 'Email',
            handler: () => {
              //this.sentAnEmailToMember(item);
            }
          },
          {
            text: 'Member Sheet',
            handler: () => {
              this.navCtrl.push('MembersheetPage', {
                sessionDetails: item,
                CampDetails: this.campDetails
              });
            }
          }
          , {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {

            }
          }
        ]
      });
    }

    actionSheet.present();
  }

  async getCampEnrolments(){
    return new Promise((resolve,reject)=> {
      try{
        const enroled_query = gql`
        query getEnrollmentsForHolidayCamp($input: GetHolidayCampEnrollmentDto!){
          getEnrollmentsForHolidayCamp(input:$input){
            Id
            FirstName
            LastName
            IsChild
            ParentId
            ParentEmailID
            EmailID
            PhoneNumber
            ParentPhoneNumber
            amount_due
            amount_paid
          }
        }
      `;
    
        const get_enrols_input = {
          holiday_camp_id: this.holidayCampDetails.id
        }
        this.graphqlService.query(enroled_query, { input: get_enrols_input }, 0)
        .subscribe((res: any) => {
          resolve(res.data.getEnrollmentsForHolidayCamp);
        },
        (error) => {
            this.commonService.hideLoader()
            console.error("Error in fetching:", error);
        })
      }catch(err){
        reject(err);
      }
    }) 
  }

  notificationToCampMember() {
      
  }

  sentAnEmailToMembers() {
    this.commonService.showLoader("Please wait");
    this.getCampEnrolments().then((response:[CampUsers]) => {
      this.commonService.hideLoader();
      if (response.length > 0) {
        const user_enrolments = response;
        const member_list = user_enrolments.map((enrol_member:CampUsers) => {
          return {
              IsChild:enrol_member.IsChild ? true:false,
              ParentId:enrol_member.IsChild ? enrol_member.ParentId:"",
              MemberId:enrol_member.Id, 
              MemberEmail:enrol_member.EmailID!="" && enrol_member.EmailID!="-" && enrol_member.EmailID!="n/a" ? enrol_member.EmailID:(enrol_member.IsChild ? enrol_member.ParentEmailID:""), 
              MemberName: enrol_member.FirstName + " " + enrol_member.LastName
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
        this.commonService.hideLoader();
        this.commonService.toastMessage("No member(s) found", 2500, ToastMessageType.Error)
      }
    }).catch(err => {
      this.commonService.hideLoader();
      console.log("Error in fetching enrolments:", err);
    })
  }

  notificationToCampMembers() {
    this.commonService.showLoader("Please wait");
    this.getCampEnrolments().then((response:[CampUsers]) => {
      this.commonService.hideLoader();
      if (response.length > 0) {
        const user_enrolments = response;
        const member_ids = user_enrolments.map(enrol_member => enrol_member.IsChild ? enrol_member.ParentId:enrol_member.Id);
            this.navCtrl.push("Type2NotificationSession",{
                users:member_ids,
                type:ModuleTypes.HOLIDAYCAMP,
                heading:`Enrolment:${this.holidayCampDetails.camp_name}`
        }); 
      } else {
        this.commonService.hideLoader();
        this.commonService.toastMessage("No member(s) found", 2500, ToastMessageType.Error)
      }
    }).catch(err => {
      this.commonService.hideLoader();
      console.log("Error in fetching enrolments:", err);
    })  
    
  }


  closeFab(fab: FabContainer) {
    fab.close();
  }



}


export class HolidayCampDetailInput {
  ParentClubKey: string
  ClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  PostgresFields: PostgreFields
  ActivityKey: string
  HolidayCampId: string
  UserMemberId: string
  FetchActiveSession: boolean
}

export class PostgreFields {
  PostgresParentclubId: string
  PostgresClubId: string
  PostgresActivityId: string
}

export class HolidaCampDeleteInput {
  HolidayCampId: string
  DeletedBy: string
}
