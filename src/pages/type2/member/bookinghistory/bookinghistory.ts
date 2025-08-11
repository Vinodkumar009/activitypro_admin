import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FamilyMember, FamilyMemberInput, VenueUser } from "../model/member";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../../../services/sharedservice';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/combineLatest';
import gql from "graphql-tag";
import { GraphqlService } from '../../../../services/graphql.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { ICourtBooking, IHolidayCampBookingModel, IMonthlyBookingModel, ISchoolSessionBooking, ITermBookingModel, IWeeklyBooking } from './model/bookinghistory.model';
import { AppType } from '../../../../shared/constants/module.constants';
import { HoldiayCampPendingPaymentModel, MonthlyPendingPaymentModel, SchoolSessionPendingPaymentModel, TermPendingPaymentsModel, WeeklyPendingPaymentModel } from '../../../../shared/model/booking_history.model';
import { L } from '@angular/core/src/render3';

/**
 * 📱 BookinghistoryPage - Displays comprehensive booking history for members
 */
@IonicPage()
@Component({
  selector: 'page-bookinghistory',
  templateUrl: 'bookinghistory.html',
  providers: [GraphqlService, HttpService]
})
export class BookinghistoryPage implements OnInit, OnDestroy {
  commonInput: any;
  // 🔄 Toggle state for pending payments
  isPendingPaymentsMode: boolean = false;
  getTermPendingPaymentsInput: GetTermPendingPaymentsInput = {
    parentclub_id: '',
    club_id: '',
    activity_id: '',
    member_id: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  // termPendingPaymentsRes: TermPendingPaymentsModel = {
  //   pending_sessions: [],
  //   totalCount: '0',
  //   totalDueAmountSum: '0'
  // };
  termPendingPaymentsRes = [];
  getWeeklyPendingPaymentsInput: GetWeeklyPendingPaymentsInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  weeklyPendingPaymentsRes: WeeklyPendingPaymentModel = {
    pending_sessions: [],
    totalCount: '0',
    totalDueAmountSum: '0'
  };
  monthlyPendingPaymentInput: MonthlyPendingPaymentInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  monthlyPendingPaymentRes: MonthlyPendingPaymentModel = {
    pending_sessions: [],
    totalCount: '0',
    totalDueAmountSum: '0'
  };
  schoolSessionPendingPaymentInput: SchoolSessionPendingPaymentInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  schoolSessionPendingPaymentRes: SchoolSessionPendingPaymentModel = {
    pending_sessions: [],
    totalCount: '0',
    totalDueAmountSum: '0'
  };

  holdiayCampPendingPaymentInput: HoldiayCampPendingPaymentInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  holidaycampPendingPaymentRes: HoldiayCampPendingPaymentModel = {
    pending_sessions: [],
    totalCount: '0',
    totalDueAmountSum: '0'
  };
  // 🎯 Original property names for template compatibility
  booking_input = {
    parentId: "",
    pageOptionsDto: {
      order: "DESC",
      page: 1,
      take: 30
    }
  };

  no_bookings_text: string = "";
  memberType: string = "";
  historyObj = new History();
  allTypeSessionDetails = new SessionDetails();
  term_session_list: ITermBookingModel[] = [];
  weekly_session_list: IWeeklyBooking[] = [];
  monthly_session_list: IMonthlyBookingModel[] = [];
  holidaycamp_list: IHolidayCampBookingModel[] = [];
  school_session_list: ISchoolSessionBooking[] = [];
  court_booking_list: ICourtBooking[] = [];
  selectedTab: any = [];
  selectedType: number = 0;
  currencyDetails: any = "";
  selectedParentClubKey: any;
  selectedMenu = 'session';
  family_members: FamilyMember[] = [];
  member_info: VenueUser;

  ListCount: string = "0";
  TotalDueAmount: string = "0.00";

  menus = [
    { name: 'Term Sessions', module: 0 },
    { name: 'Weekly Sessions', module: 1 },
    { name: 'Monthly Sessions', module: 5 },
    { name: 'Holiday Camps', module: 2 },
    { name: 'Facility Bookings', module: 3 },
    { name: 'School Sessions', module: 4 }
  ];

  AmountPayStatus = {
    0: "Due",
    1: "Paid",
    3: "Pending_Verification"
  };

  AmountPaidBy = {
    0: "Cash",
    1: "Online",
    2: "Bacs",
    3: "Childcare Voucher",
    4: "Wallet",
    5: "Cheque"
  };

  isNoBookings: boolean = false;
  tot_family: ITotalFamily[] = [];
  courtbooking: ICourtBooking[] = [];
  nestUrl: any;
  courtbookingactive: boolean = false;
  memberkey: any;

  private subscriptions: any[] = [];

  constructor(
    public storage: Storage,
    public sharedService: SharedServices,
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public fb: FirebaseService,
    private httpService: HttpService,
    private graphqlService: GraphqlService,

  ) {
    this.selectedType = 0;
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
      this.nestUrl = this.sharedService.getnestURL();
    }).catch(error => { });
  }

  ionViewDidLoad() {
    console.log('📱 ionViewDidLoad BookinghistoryPage');
  }

  ngOnInit() {
    this.selectedParentClubKey = this.sharedService.getParentclubKey();
    var device_id = this.sharedService.getDeviceId();
    console.log("📱 Device ID:", device_id);
    this.member_info = this.navParams.get('member_info');
    console.log("📋 Member Info:", this.member_info);
    this.booking_input.parentId = this.member_info.Id;
    this.family_members = this.navParams.get('family_members');

    this.tot_family = this.family_members
      .filter(member => member.IsActive)
      .map((member) => {
        return {
          Id: member.Id,
          FirstName: member.FirstName,
          LastName: member.LastName,
          ClubKey: member.ClubKey,
          MemberKey: member.FirebaseKey
        }
      });

    this.tot_family.splice(0, 0, {
      Id: this.member_info.Id,
      FirstName: this.member_info.parent_firstname,
      LastName: this.member_info.parent_lastname,
      ClubKey: this.member_info.parentFirebaseKey,
      MemberKey: this.member_info.clubkey
    });

    this.getTermSessionBookings();
    this.historyObj.Name = this.member_info.parent_firstname + " " + this.member_info.parent_lastname;

    this.getTermPendingPaymentsInput.parentclub_id = this.sharedService.getPostgreParentClubId();
    this.getTermPendingPaymentsInput.member_id = this.member_info.Id;
    this.getTermPendingPaymentsInput.action_type = 0;
    this.getTermPendingPaymentsInput.app_type = AppType.ADMIN_NEW;
    this.getTermPendingPaymentsInput.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
    this.getTermPendingPaymentsInput.device_id = '1';
    // this.getTermPendingPaymentsInput.device_id = this.sharedService.getDeviceId();
    this.getTermPendingPaymentsInput.updated_by = this.sharedService.getLoggedInId();

    this.getWeeklyPendingPaymentsInput.parentclubId = this.sharedService.getPostgreParentClubId();
    this.getWeeklyPendingPaymentsInput.memberId = this.member_info.Id;
    this.getWeeklyPendingPaymentsInput.action_type = 2;
    this.getWeeklyPendingPaymentsInput.app_type = AppType.ADMIN_NEW;
    this.getWeeklyPendingPaymentsInput.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
    this.getWeeklyPendingPaymentsInput.device_id = '1';
    // this.monthlyPendingPaymentInput.device_id = this.sharedService.getDeviceId();
    this.monthlyPendingPaymentInput.updated_by = this.sharedService.getLoggedInId();

    this.monthlyPendingPaymentInput.parentclubId = this.sharedService.getPostgreParentClubId();
    this.monthlyPendingPaymentInput.memberId = this.member_info.Id;
    this.monthlyPendingPaymentInput.action_type = 3;
    this.monthlyPendingPaymentInput.app_type = AppType.ADMIN_NEW;
    this.monthlyPendingPaymentInput.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
    this.monthlyPendingPaymentInput.device_id = '1';
    // this.monthlyPendingPaymentInput.device_id = this.sharedService.getDeviceId();
    this.monthlyPendingPaymentInput.updated_by = this.sharedService.getLoggedInId();

    this.holdiayCampPendingPaymentInput.parentclubId = this.sharedService.getPostgreParentClubId();
    this.holdiayCampPendingPaymentInput.memberId = this.member_info.Id;
    this.holdiayCampPendingPaymentInput.action_type = 2;
    this.holdiayCampPendingPaymentInput.app_type = AppType.ADMIN_NEW;
    this.holdiayCampPendingPaymentInput.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
    this.holdiayCampPendingPaymentInput.device_id = '1';
    // this.holdiayCampPendingPaymentInput.device_id = this.sharedService.getDeviceId();
    this.holdiayCampPendingPaymentInput.updated_by = this.sharedService.getLoggedInId();

    this.schoolSessionPendingPaymentInput.parentclubId = this.sharedService.getPostgreParentClubId();
    this.schoolSessionPendingPaymentInput.memberId = this.member_info.Id;
    this.schoolSessionPendingPaymentInput.action_type = 2;
    this.schoolSessionPendingPaymentInput.app_type = AppType.ADMIN_NEW;
    this.schoolSessionPendingPaymentInput.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
    this.schoolSessionPendingPaymentInput.device_id = '1';
    // this.schoolSessionPendingPaymentInput.device_id = this.sharedService.getDeviceId();
    this.schoolSessionPendingPaymentInput.updated_by = this.sharedService.getLoggedInId();
    // this.HolidayCampPendingPayment();
    // this.SchoolSessionPendingPayment();

  }

  // 🎯 Get button text based on current mode
  getPendingPaymentsButtonText(): string {
    return this.isPendingPaymentsMode ? 'Pending' : 'All';
  }

  //   getCurrentPaymentStats(): { amount: string, count: string } {
  //   if (!this.isPendingPaymentsMode) {
  //     return { amount: '0.00', count: '0' };
  //   }

  //   let amount = '0.00';
  //   let count = '0';

  //   switch (Number(this.selectedType)) {
  //     case 0:
  //       amount = this.termPendingPaymentsRes.totalDueAmountSum;
  //       count = this.termPendingPaymentsRes.totalCount;
  //       break;
  //     case 1:
  //       amount = this.weeklyPendingPaymentsRes.totalDueAmountSum;
  //       count = this.weeklyPendingPaymentsRes.totalCount;
  //       break;
  //     case 2:
  //       amount = this.holidaycampPendingPaymentRes.totalDueAmountSum;
  //       count = this.holidaycampPendingPaymentRes.totalCount;
  //       break;
  //     case 4:
  //       amount = this.schoolSessionPendingPaymentRes.totalDueAmountSum;
  //       count = this.schoolSessionPendingPaymentRes.totalCount;
  //       break;
  //     case 5:
  //       amount = this.monthlyPendingPaymentRes.totalDueAmountSum;
  //       count = this.monthlyPendingPaymentRes.totalCount;
  //       break;
  //   }

  //   this.TotalDueAmount = amount;
  //   this.ListCount = count;

  //   return { amount, count };
  // }

  // 💰 Get current total amount based on selected session type
  getCurrentTotalAmount(): string {
    if (!this.isPendingPaymentsMode) {
      return '0.00';
    }

    switch (Number(this.selectedType)) {
      case 0: // Term Sessions
        //this.TotalDueAmount = this.termPendingPaymentsRes.totalDueAmountSum;
        this.TotalDueAmount = this.termPendingPaymentsRes.reduce((sum, item) => sum + parseFloat(item.amount_due), 0);
        break;
      case 1: // Weekly Sessions  
        this.TotalDueAmount = this.weeklyPendingPaymentsRes.totalDueAmountSum;

        break;
      case 2: // Holiday Camps
        this.TotalDueAmount = this.holidaycampPendingPaymentRes.totalDueAmountSum;

        break;
      case 4: // School Sessions
        this.TotalDueAmount = this.schoolSessionPendingPaymentRes.totalDueAmountSum;

        break;
      case 5: // Monthly Sessions
        this.TotalDueAmount = this.monthlyPendingPaymentRes.totalDueAmountSum;

        break;
      default:
        this.TotalDueAmount = '0.00';
    }

    return this.TotalDueAmount;
  }

  ngOnDestroy(): void {
    // 🧹 Clean up subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
  }

  doInfinite(infiniteScroll) {
    this.booking_input.pageOptionsDto.page += this.booking_input.pageOptionsDto.page;
    setTimeout(() => {
      infiniteScroll.complete();
      this.onModuleChange();
    }, 500);
  }

  // reInitializeModule() {
  //   this.term_session_list = [];
  //   this.weekly_session_list = [];
  //   this.school_session_list = [];
  //   this.holidaycamp_list = [];
  //   this.courtbooking = [];
  //   this.historyObj.PaidAmount = "0.00";
  //   this.historyObj.DueAmount = "0.00";
  //   this.historyObj.Discount = "0.00";
  //   this.isNoBookings = false;
  // }

  reInitializeModule() {
    // 🧹 Clear regular session arrays
    this.term_session_list = [];
    this.weekly_session_list = [];
    this.monthly_session_list = [];
    this.school_session_list = [];
    this.holidaycamp_list = [];
    this.court_booking_list = [];
    this.courtbooking = [];

    // 🧹 Clear pending payments data
    // this.termPendingPaymentsRes = {
    //   pending_sessions: [],
    //   totalCount: '0',
    //   totalDueAmountSum: '0'
    // };
    this.termPendingPaymentsRes = [];
    this.weeklyPendingPaymentsRes = {
      pending_sessions: [],
      totalCount: '0',
      totalDueAmountSum: '0'
    };
    this.monthlyPendingPaymentRes = {
      pending_sessions: [],
      totalCount: '0',
      totalDueAmountSum: '0'
    };
    this.holidaycampPendingPaymentRes = {
      pending_sessions: [],
      totalCount: '0',
      totalDueAmountSum: '0'
    };
    this.schoolSessionPendingPaymentRes = {
      pending_sessions: [],
      totalCount: '0',
      totalDueAmountSum: '0'
    };

    // 🧹 Reset amounts
    this.historyObj.PaidAmount = "0.00";
    this.historyObj.DueAmount = "0.00";
    this.historyObj.Discount = "0.00";
    this.isNoBookings = false;
  }


  getEmptyBookingsText(): void {
    if (this.selectedType == 0 && this.term_session_list.length == 0) {
      this.isNoBookings = true;
      this.no_bookings_text = "No Sessions Found";
    }
    if (this.selectedType == 1 && this.weekly_session_list.length == 0) {
      this.isNoBookings = true;
      this.no_bookings_text = "No Sessions Found";
    }
    if (this.selectedType == 2 && this.holidaycamp_list.length == 0) {
      this.isNoBookings = true;
      this.no_bookings_text = "No Camps Found";
    }
    if (this.selectedType == 3 && this.court_booking_list.length == 0) {
      this.isNoBookings = true;
      this.no_bookings_text = "No Bookings Found";
    }
    if (this.selectedType == 4 && this.school_session_list.length == 0) {
      this.isNoBookings = true;
      this.no_bookings_text = "No Sessions Found";
    }
  }

  // 🎯 Toggle method for pending payments
  togglePendingPayments(): void {
    this.isPendingPaymentsMode = !this.isPendingPaymentsMode;
    console.log("🔄 Toggled pending payments mode:", this.isPendingPaymentsMode);

    // 🧹 Clear current data and reload based on toggle state
    this.reInitializeModule();
    this.onModuleChange();
  }

  // 📝 Updated onModuleChange to handle both modes
  onModuleChange() {
    this.reInitializeModule();

    if (this.isPendingPaymentsMode) {
      // 💳 Load pending payments based on selected type
      this.loadPendingPayments();
    } else {
      // 📋 Load regular sessions based on selected type
      this.loadRegularSessions();
    }
  }

  // 💳 Load pending payments based on selected session type
  private loadPendingPayments(): void {
    switch (Number(this.selectedType)) {
      case 0: // Term Sessions
        this.courtbookingactive = false;
        this.getTermPendingPayments();
        break;
      case 1: // Weekly Sessions
        this.courtbookingactive = false;
        this.GetPendingPaymentWeekly();
        break;
      case 2: // Holiday Camps
        this.courtbookingactive = false;
        this.HolidayCampPendingPayment();
        break;
      case 3: // Facility Bookings
        this.courtbookingactive = true;
        // Note: Court bookings don't have pending payments
        this.getEmptyBookingsText();
        break;
      case 4: // School Sessions
        this.courtbookingactive = false;
        this.SchoolSessionPendingPayment();
        break;
      case 5: // Monthly Sessions
        this.courtbookingactive = false;
        this.MonthlyPendingPayment();
        break;
      default:
        console.warn("⚠️ Unknown session type for pending payments:", this.selectedType);
        this.getEmptyBookingsText();
    }
  }

  // 📋 Load regular sessions based on selected session type
  private loadRegularSessions(): void {
    switch (Number(this.selectedType)) {
      case 0: // Term Sessions
        this.courtbookingactive = false;
        this.getTermSessionBookings();
        break;
      case 1: // Weekly Sessions
        this.courtbookingactive = false;
        this.getWeeklySessionBookings();
        break;
      case 2: // Holiday Camps
        this.courtbookingactive = false;
        this.getHolidayCampsBookings();
        break;
      case 3: // Facility Bookings
        this.getCourtBookingHistory();
        break;
      case 4: // School Sessions
        this.getSchoolSessionBookings();
        break;
      case 5: // Monthly Sessions
        this.getMonthlySessionBookings();
        break;
      default:
        console.warn("⚠️ Unknown session type:", this.selectedType);
        this.getEmptyBookingsText();
    }
  }

  // onModuleChange() {
  //   this.reInitializeModule();
  //   if (Number(this.selectedType == 0)) {
  //     this.courtbookingactive = false;
  //     this.getTermSessionBookings();
  //   }
  //   else if (Number(this.selectedType == 1)) {
  //     this.courtbookingactive = false;
  //     this.getWeeklySessionBookings();
  //   }
  //   else if (Number(this.selectedType == 2)) {
  //     this.courtbookingactive = false;
  //     this.getHolidayCampsBookings();
  //   }
  //   else if (Number(this.selectedType == 3)) {
  //     this.getCourtBookingHistory();
  //   } else if (Number(this.selectedType == 4)) {
  //     this.getSchoolSessionBookings();
  //   } else {
  //     this.getMonthlySessionBookings();
  //   }
  // }

  //fetch pending payments for term sessions
  getTermPendingPayments() {
    // this.setupPendingPaymentInputs();
    this.commonService.showLoader("Fetching info ...");
    this.httpService.post(`${API.GetTermPendingPayments}`, this.getTermPendingPaymentsInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.termPendingPaymentsRes = res.data
        // this.commonService.toastMessage(
        //   `${this.termPendingPaymentsRes.totalCount } Term Sessions Found`,
        //   2500,
        //   ToastMessageType.Success,
        //   ToastPlacement.Bottom
        // );
        this.commonService.toastMessage(
          `${this.termPendingPaymentsRes.length } Term Sessions Found`,
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        console.log("GetTermPendingPayments RESPONSE", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }
  //fetch pending payments for weekly sessions
  GetPendingPaymentWeekly() {
    // this.setupPendingPaymentInputs();
    // this.commonService.showLoader("Fetching info ...");
    this.httpService.post(`${API.GetPendingPaymentWeekly}`, this.getWeeklyPendingPaymentsInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.weeklyPendingPaymentsRes = res  // the response structure is not wrapped within 'data' object, so using res directly
        this.commonService.toastMessage(
          `${this.weeklyPendingPaymentsRes.totalCount} Weekly Sessions Found`,
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        console.log("GetPendingPaymentWeekly RESPONSE", JSON.stringify(res));
      } else {
        // this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }

  //fetch pending payments for monthly sessions
  MonthlyPendingPayment() {
    // this.setupPendingPaymentInputs();
    this.commonService.showLoader("Fetching info ...");
    this.httpService.post(`${API.MonthlyPendingPayment}`, this.monthlyPendingPaymentInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.monthlyPendingPaymentRes = res.data;
        this.commonService.toastMessage(
          `${this.monthlyPendingPaymentRes.totalCount} Monthly Sessions Found`,
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        console.log("MonthlyPendingPayment RESPONSE", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }
  //fetch pending payments for school sessions
  SchoolSessionPendingPayment() {
    this.commonService.showLoader("Fetching info ...");
    this.httpService.post(`${API.SchoolSessionPendingPayment}`, this.schoolSessionPendingPaymentInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.schoolSessionPendingPaymentRes = res.data;
        this.commonService.toastMessage(
          `${this.schoolSessionPendingPaymentRes.totalCount} School Sessions Found`,
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        console.log("SchoolSessionPendingPayment RESPONSE", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }

  //fetch pending payments for Holiday Camp sessions
  HolidayCampPendingPayment() {
    this.commonService.showLoader("Fetching info ...");
    this.httpService.post(`${API.EnrolmentDetails}`, this.holdiayCampPendingPaymentInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.holidaycampPendingPaymentRes = res   // the response structure is not wrapped within 'data' object, so using res directly
        this.commonService.toastMessage(`${this.holidaycampPendingPaymentRes.totalCount} Hoiday Camps Found`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
        console.log("HolidayCampPendingPayment RESPONSE", JSON.stringify(res));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }

  // 📡 Getting term session details of parent & family by parent postgre_id & firebasekey
  getTermSessionBookings() {
    const subscription = this.httpService.post(`${API.BOOKING_HISTORY}/term`, this.booking_input).subscribe((result: any) => {
      console.log("✅ Term sessions loaded");
      this.term_session_list = [...result.data, ...this.term_session_list];
      let amount = 0;
      let discount = 0;
      for (let i = 0; i < this.term_session_list.length; i++) {
        amount += parseFloat(this.term_session_list[i].paid_amount);
        discount += parseFloat(this.term_session_list[i].transaction.total_discount);
      }
      this.historyObj.PaidAmount = amount.toString();
      this.historyObj.Discount = discount.toString();
    }, (error) => {
      console.error("❌ Term session fetch failed:", error);
      this.commonService.toastMessage("Term session fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    });

    this.subscriptions.push(subscription);
  }

  getWeeklySessionBookings() {
    const subscription = this.httpService.post(`${API.BOOKING_HISTORY}/weekly`, this.booking_input).subscribe((result: any) => {
      console.log("✅ Weekly sessions loaded");
      this.weekly_session_list = [...result.data, ...this.weekly_session_list];
      let amount = 0;
      let discount = 0;
      for (let i = 0; i < this.weekly_session_list.length; i++) {
        amount += (this.weekly_session_list[i].amount_paid);
        discount += (this.weekly_session_list[i].total_discount);
      }
      this.historyObj.PaidAmount = amount.toString();
      this.historyObj.Discount = discount.toString();
    }, (error) => {
      console.error("❌ Weekly session fetch failed:", error);
      this.commonService.toastMessage("Weekly session fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    });

    this.subscriptions.push(subscription);
  }

  getMonthlySessionBookings() {
    const subscription = this.httpService.post(`${API.BOOKING_HISTORY}/monthly`, this.booking_input).subscribe((result: any) => {
      console.log("✅ Monthly sessions loaded");
      this.monthly_session_list = [...result.data, ...this.monthly_session_list];
      let amount = 0;
      let discount = 0;
      for (let i = 0; i < this.monthly_session_list.length; i++) {
        amount += (this.monthly_session_list[i].amount_paid);
        discount += (this.monthly_session_list[i].total_discount);
      }
      this.historyObj.PaidAmount = amount.toString();
      this.historyObj.Discount = discount.toString();
    }, (error) => {
      console.error("❌ Monthly session fetch failed:", error);
      this.commonService.toastMessage("Monthly session fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    });

    this.subscriptions.push(subscription);
  }

  getHolidayCampsBookings() {
    const subscription = this.httpService.post(`${API.BOOKING_HISTORY}/holidaycamp`, this.booking_input).subscribe((result: any) => {
      console.log("✅ Holiday camps loaded");
      this.holidaycamp_list = [...result.data, ...this.holidaycamp_list];
      let amount = 0;
      let discount = 0;
      for (let i = 0; i < this.holidaycamp_list.length; i++) {
        amount += parseFloat(this.holidaycamp_list[i].amount_paid);
        discount += parseFloat(this.holidaycamp_list[i].total_discount);
      }
      this.historyObj.PaidAmount = amount.toString();
      this.historyObj.Discount = discount.toString();
    }, (err) => {
      console.error("❌ Holiday camps fetch failed:", err);
      this.commonService.toastMessage("Holiday camps fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    });

    this.subscriptions.push(subscription);
  }

  getSchoolSessionBookings() {
    const subscription = this.httpService.post(`${API.BOOKING_HISTORY}/school`, this.booking_input).subscribe((result: any) => {
      console.log("✅ School sessions loaded");
      this.school_session_list = [...result.data, ...this.school_session_list];
      let amount = 0;
      let discount = 0;
      for (let i = 0; i < this.school_session_list.length; i++) {
        amount += parseFloat(this.school_session_list[i].amount_paid);
        discount += parseFloat(this.school_session_list[i].total_discount);
      }
      this.historyObj.PaidAmount = amount.toString();
      this.historyObj.Discount = discount.toString();
    }, (error) => {
      console.error("❌ School session fetch failed:", error);
      this.commonService.toastMessage("School session fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    });

    this.subscriptions.push(subscription);
  }

  getCourtBookingHistory() {
    console.log("🏟️ Court booking function called");
    let UserBookingsInput = {
      parentclub_id: this.selectedParentClubKey,
      member_id: this.member_info.parentFirebaseKey
    };

    const getCourtBooking = gql`
    query getPastBookingForMember($bookingInput: UserBookingsInput!){
      getPastBookingForMember(bookingInput:$bookingInput){
        Id
        name
        table_capacity
        surface
        floor
        court_type
        member_comments
        phone_number
        booked_member_key
        booking_date
        ActivityName
        courtname
        booking_transaction_time
        slot_start_time
        slot_end_time
        price
        booking_type
        purpose
        activitykey
        clubkey
        courtkey
        order_id
        paymentsource
      }
    }
    `;

    const subscription = this.graphqlService.query(getCourtBooking, { bookingInput: UserBookingsInput }, 0)
      .subscribe((res: any) => {
        this.court_booking_list = res.data.getPastBookingForMember;
        console.log("✅ Court bookings loaded:", this.court_booking_list.length);
      },
        (error) => {
          console.error("❌ Court booking fetch failed:", error);
          this.commonService.toastMessage("Court booking fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        });

    this.subscriptions.push(subscription);
  }

  resetAllTypeSessionDetails() {
    this.allTypeSessionDetails = new SessionDetails();
  }

  getAmountAfterDecimal(value) {
    let paidAmount = parseFloat(value);
    let amount = paidAmount.toFixed(2);
    return amount;
  }

  gotoDetails(session: any) {
    switch (Number(session.Type)) {
      case 0: {
        session["$key"] = session.SessionKey;
        this.navCtrl.push("GroupsessiondetailsPage", {
          SessionDetails: session,
          DeviceTokenOfMembers: "",
          ClubName: session.ClubName ? session.ClubName : "",
        });
        break;
      }
      case 1: {
        const camp$Obs = this.fb.getAllWithQuery(`HolidayCamp/${session.ParentClubKey}`, { orderByKey: true, equalTo: session.SessionKey }).subscribe((data) => {
          camp$Obs.unsubscribe();
          this.commonService.updateCategory('camp_member_add');
          const camp = data[0];
          this.navCtrl.push("Type2CampDetails", { CampDetails: camp });
        });
        break;
      }
      case 2: {
        const school$Obs = this.fb.getAllWithQuery(`SchoolSession/${session.ParentClubKey}`, { orderByKey: true, equalTo: session.SessionKey }).subscribe((data) => {
          school$Obs.unsubscribe();
          const school = data[0];
          this.navCtrl.push("EachSessionDetailsPage", { sessionObj: school });
        });
        break;
      }
      case 3: {
        // Court booking details
        break;
      }
    }
  }
}

export interface GetTermPendingPaymentsInput {
  parentclub_id: string;
  club_id: string;
  activity_id: string;
  member_id: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}
export interface GetWeeklyPendingPaymentsInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}
export interface MonthlyPendingPaymentInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}

export interface SchoolSessionPendingPaymentInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}

export interface HoldiayCampPendingPaymentInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}




// 📊 Model classes using original naming
class History {
  Name: string = "";
  PaymentType: string = "";
  PaidAmount: string = "0.00";
  DueAmount: string = "0.00";
  Discount: string = "0.00";
  PendingVerificationAmount: number = 0;
}

class SessionDetails {
  Name: string = "";
  ParentClubKey: string = "";
  ClubKey?: string = "";
  CoachKey?: string = "";
  Type: number;
  SessionKey: string = "";
  StartDate: string;
  Days: string;
  StartTime: string;
  ClubName: string;
  PaymentStatus: string = '';
  IndividualSes: string = '';
  SessionDate: string = '';
  Paid: string = "0.00";
  Due: string = "0.00";
  Discount: string = "0.00";
  SessionHolderName: string = "";
  CoachName: string = "";
  PaymentDate: string = "";
}

export interface ITermSessionCoach {
  coach_firebase_id: string;
  first_name: string;
  last_name: string;
}

export interface ITotalFamily {
  Id: string;
  FirstName: string;
  LastName: string;
  ClubKey: string;
  MemberKey: string;
}




