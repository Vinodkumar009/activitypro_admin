import { Component } from '@angular/core';
import { ToastController, AlertController, NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from "@ionic/storage";
import { Events } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { LanguageService } from '../../../services/language.service';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { HolidayCampsList, PendingUsers } from './models/holiday_camp.model';
import { IClubDetails } from '../../../shared/model/club.model';
import { first } from 'rxjs/operators';
import { HttpService } from '../../../services/http.service';
import { AppType } from '../../../shared/constants/module.constants';
import moment from 'moment';
import { camp_unenrolDTO } from './camprelateddetails';
import { API } from '../../../shared/constants/api_constants';
@IonicPage()
@Component({
  selector: 'holidaycamp-page',
  templateUrl: 'holidaycamp.html',
  providers: [HttpService]
})

export class Type2HolidayCamp {
  HolidayCampListingInput: HolidayCampListingInput = {
    // UserMemberId: '',
    UserMemberId: '',
    PostgresFields: {
      PostgresParentclubId: '',
      PostgresClubId: '',
      PostgresActivityId: '',
      PostgresCoachId: ''
    },
    fetchForAdmin: true,
    ActionType: 1 // 1 active 0 past
  }

  camp_unenrolDTO: camp_unenrolDTO = {
    session_id: "",
    enrolled_id: "",
    AppType: 0, //Which app {0:Admin,1:Member,2:Applus}
    ActionType: 2,
    DeviceType: 1 //Which app {1:Android,2:IOS,3:Web,4:API}
  }
  clubVenues: IClubDetails[] = [];
  holidayListObj: HolidayCampsList;
  navigate;
  isShowPaymentModal: boolean = false;
  LangObj: any = {};//by vinod
  sessionType: boolean = false;
  themeType: any;
  selectedClub = "";
  parentClubKey = "";
  HolidayCampList: HolidayCampsList[] = [];
  pendingUsers: PendingUsers[] = [];
  pastHolidayCampList = [];
  presentHolidayCampList = [];
  singleDaySessionsArr = [];
  selectedSessions = [];
  currencyDetails = {
    CurrencySymbol: "",
  };
  isNoData = false;
  loggedin_type: number = 2;
  can_coach_see_revenue: boolean = true;
  searchInput: "";
  searchTerm: any;
  activeIndex: number = 0;

  eventsDto = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 1,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",

  }
  constructor(public graphqlService: GraphqlService, 
    private httpService: HttpService,
     public events: Events, 
     public commonService: CommonService,
    public comonService: CommonService,  public alertCtrl: AlertController, 
    public modalCtrl: ModalController, 
    public actionSheetCtrl: ActionSheetController,
     public navCtrl: NavController, public storage: Storage,
      public fb: FirebaseService, public sharedservice: SharedServices, 
      platform: Platform, public popoverCtrl: PopoverController, 
      private langService: LanguageService,) {
    this.themeType = sharedservice.getThemeType();
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });

  }

  ionViewWillEnter() {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "update_camps_list") {
        this.loggedin_type = this.sharedservice.getLoggedInType();
        this.storage.get("userObj").then(async (val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            this.parentClubKey = val.UserInfo[0].ParentClubKey;
            this.HolidayCampListingInput.PostgresFields.PostgresParentclubId = this.sharedservice.getPostgreParentClubId();
            this.eventsDto.app_type = AppType.ADMIN_NEW;

            if (this.loggedin_type === 4) {
              this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
              const coach_id = await this.getCoachIdsByFirebaseKeys([val.UserInfo[0].CoachKey])
              this.HolidayCampListingInput.PostgresFields.PostgresCoachId = coach_id;
            }
            this.getClubList();
            this.getHolidayCamps();
            //this.getUserWithPendingPayment();
          }
        });
      }
    })
  }
  //   });
  // }


  getDays(DaysArray) {
    return DaysArray.split(",").map((day) => day[0]).join(',');
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
  gotoCreateHolidayCamp() {
    this.isShowPaymentModal = false;
    this.navCtrl.push("Type2CreateHolidayCamp");
  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
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
    this.graphqlService.query(clubs_query, { firebase_parentclubId: this.parentClubKey }, 0)
      .subscribe((res: any) => {
        this.clubVenues = res.data.getParentClubVenues;
        console.log("clubs lists:", JSON.stringify(this.clubVenues));
        if (this.clubVenues.length > 0) {
          // this.selectedClub = this.clubVenues[0].FirebaseId;
          this.selectedClub = "All";
          this.checkPaymentSetup();
        } else {
          this.commonService.toastMessage("clubs not found", 2500, ToastMessageType.Error)
        }

      },
        (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
        })
  }

  formatCurrency(number: number): string {
    const formattedAmount = this.currencyDetails.CurrencySymbol + (number || 0).toFixed(2);
    return formattedAmount;
  }

  totalAmount;
  calculatePercentComplete(dueAmount: number, paidAmount: number): string {
    this.totalAmount = dueAmount + paidAmount;
    if (dueAmount <= 0 && paidAmount <= 0) {
      return "0.00"; // Indicate 0% completion for non-positive total amount
    }
    const percentComplete = ((paidAmount / this.totalAmount) * 100).toFixed(2);
    //console.log(`${dueAmount}:${paidAmount}=${percentComplete}`);
    return percentComplete;
  }


  getHolidayCamps() {
    // this.commonService.showLoader("Please wait");
    // this.HolidayCampListingInput.ActionType = this.selectedType ? 1:0;
    const query = gql`
    query getHolidayCamps($holidayCampListingInput: HolidayCampListingInput!){
      getHolidayCamps(holidayCampListingInput:$holidayCampListingInput){
        enrolment_count
        holidaycamps {
          bookingCount
          id
          camp_name
          camp_type
          duration_per_day
          session_count
          start_date
          end_date
          venue_name
          age_group
          dueAmount
          paidAmount
          days
          parentclub {
            Id
            ParentClubName
            ParentClubAppIconURL
          }
          club {
            Id
            ClubName
            ClubShortName
          }
        }
      }
    }
    `;
    this.graphqlService.query(query, { holidayCampListingInput: this.HolidayCampListingInput }, 0)
      .subscribe((res: any) => {
        this.HolidayCampList = [];
        // this.commonService.hideLoader();
        console.log("HOLIDAY CAMP DATA:", JSON.stringify(this.holidayListObj));
        if (res.data.getHolidayCamps.holidaycamps && res.data.getHolidayCamps.holidaycamps.length > 0) {
          // this.commonService.hideLoader();
          this.HolidayCampList = res.data.getHolidayCamps.holidaycamps;
        } else {
          this.isNoData = true;
        }
        //this.getSortedHolidayCamp();
      }, (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
      })
  }

  // //payment activity details
  checkPaymentSetup() {
    const paymentsetup$Obs = this.fb.getAll(`Activity/${this.parentClubKey}`).subscribe((res) => {
      paymentsetup$Obs.unsubscribe();
      console.log(res);
      let showmodal: boolean = true;
      for (let i = 0; i < this.clubVenues.length; i++) {
        for (let j = 0; j < res.length; j++) {
          if (this.clubVenues[i].FirebaseId === res[j].$key) {
            for (let key in res[j]) {
              if (key != "$key") {
                res[j][key].PaymentSetup = this.commonService.convertFbObjectToArray(res[j][key].PaymentSetup);
                console.log(res[j][key].PaymentSetup);
                for (let l = 0; l < res[j][key].PaymentSetup.length; l++) {
                  if (res[j][key].PaymentSetup[l].IsActive) {
                    if ((res[j][key].PaymentSetup[l].PaymentGatewayName == "RealEx" || res[j][key].PaymentSetup[l].PaymentGatewayName == "StripeConnect" || res[j][key].PaymentSetup[l].PaymentGatewayName == "paytm" || res[j][key].PaymentSetup[l].PaymentGatewayName == "Stripe") && (res[j][key].PaymentSetup[l].SetupType == "Session Management")) {
                      // console.log("matched");
                      // console.log(`${res[j][key].PaymentSetup[l].IsActive}:${res[j][key].PaymentSetup[l].PaymentGatewayName}:${res[j][key].PaymentSetup[l].SetupType}`);
                      showmodal = false;
                      this.isShowPaymentModal = false;
                    }
                  }
                }
              }
            }
          }
        }
      }
      this.isShowPaymentModal = showmodal;

    }, (err) => {
      console.log(err);
    })
  }

  //custom component for payment setup redirect
  GotoPaymentSetup() {
    this.isShowPaymentModal = false;
    let setup = {
      SetupName: 'Session Management',
      DisplayName: 'Group Session',
      VenueList: true,
      ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fgroupsession.svg?alt=media&token=1f19b4aa-5051-4131-918d-4fa17091a7f9"
    }
    this.navCtrl.push("StripeconnectsetuplistPage", { setupDetails: setup });
  }

  skip() {
    this.isShowPaymentModal = false;
  }

  getSortedHolidayCamp() {
    this.presentHolidayCampList = [];
    this.pastHolidayCampList = [];
    let todayDate = this.commonService.getTodaysDate();
    for (let i = 0; i < this.holidayListObj.holidaycamps.length; i++) {
      if ((new Date(this.holidayListObj.holidaycamps[i].end_date).getTime()) >= (new Date(todayDate).getTime())) {
        this.presentHolidayCampList.push(this.holidayListObj.holidaycamps[i]);
      } else {
        this.pastHolidayCampList.push(this.holidayListObj.holidaycamps[i]);
      }
    }
    // this.commonService.hideLoader();
  }


  onChangeClub() {
    this.isNoData = false;
    // this.getCampList();
    this.HolidayCampListingInput.PostgresFields.PostgresClubId = this.selectedClub == "All" ? "" : this.selectedClub;
    this.getHolidayCamps();
  }

  addMemberToCamp(camp) {
    this.presentActionSheet(camp);
  }


  //
  //Action sheet for single day or multi day holiday camp
  //
  presentActionSheet(camp) {
    this.selecteSessionsForAddingMember(camp);
  }

  ///
  ///  Select sessions alert for multiday holiday camp
  ///

  selecteSessionsForAddingMember(camp) {
    let session = Array.isArray(camp.Session) ? camp.Session : this.comonService.convertFbObjectToArray(camp.Session)
    if (session.length > 0) {
      let alert = this.alertCtrl.create();
      alert.setTitle('Select Sessions to add member');

      for (let sessionIndex = 0; sessionIndex < session.length; sessionIndex++) {
        alert.addInput({
          type: 'checkbox',
          label: this.getDateIn_DDMM_Format(session[sessionIndex].SessionDate) + " " + session[sessionIndex].Day + " - " + session[sessionIndex].SessionName,
          value: session[sessionIndex].Key,
          checked: false
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: data => {
          this.selectedSessions = [];
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < session.length; j++) {
              if (session[j].Key == data[i]) {
                this.selectedSessions.push(session[j]);
                break;
              }
            }
          }
          this.navCtrl.push("Type2AddMemberHolidayCamp", { CampDetails: camp, Sessions: this.selectedSessions });
        }
      });
      alert.present();
    } else {
      this.commonService.toastMessage("No sessions", 2500, ToastMessageType.Error);
    }

  }


  chooseSessionType(camp) {
    let sessions = Array.isArray(camp.Session) ? camp.Session : this.comonService.convertFbObjectToArray(camp.Session);
    let x = [];
    for (let i = 0; i < sessions.length; i++) {
      x.push(
        {
          text: sessions[i].SessionName + "(" + sessions[i].StartTime + "-" + sessions[i].EndTime + ")",
          icon: 'filing',
          handler: () => {
            //100 for half day session of fullday holiday camp
            //200 for full day session of fullday holiday camp
            this.navCtrl.push("Type2AddMemberHolidayCamp", { SessionDetails: sessions[i], CampDetails: camp, BookFor: "100" });
          }
        }
      )
    }
    x.push(
      {
        text: ' Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
    );

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Add Member to session',
      buttons: x
    });
    actionSheet.present();
  }

  gotoCampDetails(camp) {
    this.navCtrl.push("Type2CampDetails", {
      camp: camp.id,
    });
  }

  viewCampDetails(camp: PendingUsers) {
    this.navCtrl.push("Type2CampDetails", {
      camp: camp.id,
    });
  }

  showPendingActionSheet(camp_ind: number) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'View Camp',
          icon: 'ios-eye',
          handler: () => {
            this.viewCampDetails(this.filteredUsers[camp_ind]);
          }
        },
        {
          text: 'Remove Player',
          icon: 'ios-trash',
          handler: () => {
            this.getRemoveConfirmation(this.filteredUsers[camp_ind]);
          }
        }
      ]
    });
    actionSheet.present();
  }

  getRemoveConfirmation(camp:PendingUsers) {
      let name=camp.username
      let confirm = this.alertCtrl.create({
        title: 'Remove Player',
        message: `Are you sure you want to remove ${name} from the camp ? `,
        buttons: [
          {
            text: 'No',
            handler: () => {
              //console.log('Disagree clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.removeMember(camp);
            }
          }
        ]
      });
      confirm.present();
    }
  
    removeMember(enrol_user: PendingUsers) {
    this.camp_unenrolDTO.enrolled_id = enrol_user.enrolmentid;
    this.camp_unenrolDTO.session_id=enrol_user.sessionid;
    this.camp_unenrolDTO.ActionType = 2//delete;
    this.camp_unenrolDTO.AppType = AppType.ADMIN_NEW;
    this.camp_unenrolDTO.DeviceType = this.sharedservice.getPlatform() == "android" ? 1:2
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
        this.getUserWithPendingPayment();
      },
      error => {
        // Handle errors
        console.error(error);
      }
    );

  }


  // holidayCampDetails(camp) {
  //   // let campDetailsModal = this.modalCtrl.create("Type2CampDetails", { CampDetails: camp });
  //   // campDetailsModal.present();
  //   // this.commonService.updateCategory("camp_member_add");
  //   this.navCtrl.push("Type2CampDetails", { CampDetails: camp });
  // }
  updateHolidayCamp(camp) {
    this.navCtrl.push("Type2UpdateHolidayCamp", { 'CampDetails': camp });
  }

  discountSetup(camp) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Discounts',
      buttons: [
        {
          text: 'Veiw Applied Discounts',
          icon: 'md-options',
          role: 'destructive',
          handler: () => {
            this.navCtrl.push("Type2CampDiscountList", { 'CampDetails': camp });
          }
        }, {
          text: 'Apply Discount',
          icon: 'ios-options-outline',
          handler: () => {
            this.navCtrl.push("Type2DiscountDetails", { 'CampDetails': camp });
          }
        }, {
          text: ' Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }


  getCampType(type): string {
    if (type == "502") {
      return "Multi day camp";
    } else if (type == "501") {
      return "Single day camp";
    }
  }
  getDateIn_DDMMYYYY_Format(date): string {
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
  }
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


  updateMemberDetails(camp) {
    this.navCtrl.push("HolidayCampMembers", { CampDetails: camp });
  }
  editHolidayCampDetails(camp) {
    this.navCtrl.push("Type2EditHolidayCamp", { CampDetails: camp });
  }

  applyDiscount(camp) {
    console.log(camp);
    // this.navCtrl.push("Type2DiscountDetails");
    this.navCtrl.push("Type2DiscountDetails", { CampDetails: camp });
  }
  selectedType: 'active' | 'past' | 'payment' = 'active'; // Default value

  //selectedType: boolean = true;
  // changeType(val) {
  //   this.selectedType = val;
  //   this.sessionType = !val;
  //   this.getHolidayCamps();
  // }

  changeType(index) {
    this.activeIndex = index;
    this.filteredUsers = [];
    this.HolidayCampList = [];
    if (this.activeIndex === 0) {
      this.HolidayCampListingInput.ActionType = 1;
      this.getHolidayCamps();
    } else if (this.activeIndex === 2) {
      this.HolidayCampListingInput.ActionType = 0;
      this.getHolidayCamps();
    } else if(this.activeIndex === 1) {
      this.getUserWithPendingPayment();
    }
  }





  getCoachIdsByFirebaseKeys(coach_ids): Promise<any> {
    return new Promise((res, rej) => {
      const coach_query = gql`
    query getCoachesByFirebaseIds($coachIds: [String!]) {
      getCoachesByFirebaseIds(coachIds: $coachIds){
        Id
        first_name
        last_name
        coach_firebase_id
       }
    }`
      const coach_query_variables = { coachIds: coach_ids };
      this.graphqlService.query(
        coach_query,
        coach_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getCoachesByFirebaseIds"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })

  }


  //update the subject with empty to avoid any subacriptions gets called
  ionViewWillLeave() {
    this.commonService.updateCategory("");
  }

  filteredUsers: PendingUsers[] = []

  getUserWithPendingPayment() {
    this.eventsDto.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.httpService.post(`${API.EnrolmentDetails}`, this.eventsDto)
      .subscribe((res: any) => {
        this.pendingUsers = res;
        this.filteredUsers = JSON.parse(JSON.stringify(this.pendingUsers))
        // if (this.filteredUsers.length > 0) {
        //   this.filteredUsers.map((item, index) => {
        //     item.is_selected = false;
        //   })
        // }
      },
      (err) => {
          console.error("Error fetching camp payments:", err);
          if((err && err.error && err.error.message) || (err && err.message)){
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
          }else{
            this.commonService.toastMessage('Failed to fetch data', 2500, ToastMessageType.Error, ToastPlacement.Bottom)
          }
      })
  }

  toggleCardOptions(index: number): void {
    this.pendingUsers.forEach((camp, i) => {
      // camp.is_selected = i === index ? !camp.is_selected : false;
    });
  }

  viewCamp(camp: any): void {
    console.log('View Camp:', camp);
    // Add logic to navigate or show camp details
  }

  removeCamp(camp: any): void {
    console.log('Remove Camp:', camp);
    // Add logic to handle camp removal
  }

  getFormattedDate(date: any) {
    return moment(+date).format("DD-MMM-YY");
  }

  getDateOnly(isoString) {
    // Create a Date object from the ISO string
    const date = new Date(isoString);

    // Format the date to YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }



  expandBottomSheet(index: number) {
    console.log('Clicked index:', index);
    this.filteredUsers[index].is_selected = !this.filteredUsers[index].is_selected;
    if (this.filteredUsers[index].is_selected) {
      this.filteredUsers.forEach((item, selectedIndex) => {
        if (selectedIndex !== index) {
          item.is_selected = false;
        }
      });
    }
  }


  getFilteredPlayer(ev: any) {
    // Reset items back to all of the items
    //this.resetItems();
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim()!= '') {
      if(val.length < 2){
        return;
      }
      this.filteredUsers = this.pendingUsers.filter((item) => {
        if (item.campname != undefined) {
          //(item.campname.toLowerCase().indexOf(val.toLowerCase()) > -1)
          if(item.campname.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
        if (item.username != undefined) {
          //return (item.username.toLowerCase().indexOf(val.toLowerCase()) > -1)
          if(item.username.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
      })
    }else{
      this.resetItems();
    }

  }

  resetItems() {
    this.filteredUsers = this.pendingUsers;
  }

    
     

 
  //Are you sure you want to remove this player from the camp

}

export class HolidayCampListingInput {
  PostgresFields: PostgreFields
  UserMemberId: string;
  fetchForAdmin: boolean;
  ActionType: number;
}
export class PostgreFields {
  PostgresParentclubId: string;
  PostgresClubId: string;
  PostgresActivityId: string;
  PostgresCoachId: string
}
