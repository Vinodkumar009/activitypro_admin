// import { Dashboard } from '../../dashboard/dashboard';

import { Component, ViewChild, Renderer2, ElementRef, } from '@angular/core';
import { NavController, PopoverController, ActionSheetController, LoadingController, Slides, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as moment from 'moment';
import { IonicPage } from 'ionic-angular';
import gql from 'graphql-tag';
import { HttpService } from '../../../../services/http.service';
import { GraphqlService } from '../../../../services/graphql.service';
import { IClubCoaches, IClubDetails } from '../../../../shared/model/club.model';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { API } from '../../../../shared/constants/api_constants';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import { payment_email } from '../../payment/model/report.model';
import { ModuleTypeForEmail } from '../../mailtomemberbyadmin/mailtomemberbyadmin';
@IonicPage()
@Component({
  selector: 'monthlysesreport-page',
  templateUrl: 'monthlysesreport.html',
  providers: [HttpService]
})

export class MonthlySessionReport {
  @ViewChild('myslider') myslider: Slides;
  isDateRange: boolean = true;
  @ViewChild(Content) content: Content;
  isSearchEnabled: boolean = false;
  isDuePaymentLoaded: boolean = false;
  LangObj: any = {};//by vinod
  isMonthSelected: boolean = false;
  total_txns: number = 0.00;
  total_txns_amount: number = 0.00;
  toal_due_txns_amout: number = 0.00;
  toal_due_txns: number = 0.00;
  showTypeVal: any = "paid";
  totalDueAmount: number;
  numberofTransaction: number;
  postgre_parentclub_id:string = '';

  report_input= {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    start_date: "",
    end_date: "",
    status:1
  }

  reportType = "Paid";
  parentClubKey:string = "";
  clubs: IClubDetails[];
  selectedClub = "";
  selectedCurrentClub = "";
  coaches: IClubCoaches[];
  selectedCoach = "";
  selectedCurrentCoach = "";
  memberList = [];
  sessionDetails = [];
  sessionDetailsCurrentTerm = [];
  amountPaid = "0.00";
  amountDue = "0.00";
  currentAmountPaid = "0.00";
  currentAmountDue = "0.00";
  duecount: number;
  paidcount: number;
  userData: any = {};
  startDate: any;
  endDate: any;
  maxDate: any;
  minDate: any;
 
  isTransactionsAvail: boolean = true;
  currencyDetails: any = "";
  isClubView: boolean = false;
  trnsMonths: Array<any> = [];
  paidMemberList: Array<MonthlySessionPaymentReportRes> = [];
  paidMemberListtemp:MonthlySessionPaymentReportRes[]=[]
  dueMemberList: Array<MonthlySessionPaymentReportRes> = [];
  dueMemberListtemp:MonthlySessionPaymentReportRes[]=[]

  constructor(public events: Events, 
    
    private commonService: CommonService, 
    public loadingCtrl: LoadingController, 
    public storage: Storage,  
    public navCtrl: NavController,
    private sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private renderer: Renderer2, 
    private elementRef: ElementRef, 
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,
    private httpService: HttpService) {

    // Setup initial values and configuration
    this.setupInitialConfig();

  }

  
  ngOnInit() {
    // Fetch user data and initialize months
    this.initializeMonths();
    this.loadUserData();
  }

  async setupInitialConfig() {
    const [login_obj,postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
    ])
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.userData = this.sharedservice.getUserData();
      //this.themeType = this.sharedservice.getThemeType();
     
      this.getClubList();
      this.startDate = moment().subtract(10, 'days').format("YYYY-MM-DD");
      this.endDate = moment().format("YYYY-MM-DD");
      this.report_input.start_date = this.startDate;
      this.report_input.end_date = this.endDate;
      this.report_input.parentclubId = postgre_parentclub.Id;
      this.report_input.app_type = AppType.ADMIN_NEW;
      this.report_input.device_id = this.sharedservice.getDeviceId();
      this.report_input.updated_by = this.sharedservice.getLoggedInId();
      this.report_input.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    }
  }

  private initializeMonths() {
    for (let i = 0; i < 4; i++) {
      let check = moment().subtract(i, 'months');
      let month = check.format('MMM');
      let year = check.format('YYYY');
      this.trnsMonths.push({ month: month, year: year, IsActive: false });
    }
    this.trnsMonths.reverse();
    this.trnsMonths.push({ month: "7", year: "Days", IsActive: false });
    this.trnsMonths.push({ month: "Dates", year: "", IsActive: true });
  }

  scrollContent: any
  ionViewDidLoad() {
    this.scrollContent = this.elementRef.nativeElement.getElementsByClassName('scroll-content')[0];
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  private loadUserData() {
    this.storage.get('userObj').then((val) => {
      if (val) {
        val = JSON.parse(val);
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        //this.getPayment();
      }
    });

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = val ? JSON.parse(val) : null;
    }).catch((error) => console.error('Currency fetch error:', error));
  }

  //getting paid payments
  getPayment(): void {
    console.log("input obj is:", JSON.stringify((this.report_input)));
    this.httpService.post<{ message:String,data: MonthlySessionPaymentReportRes[] }>(`${API.MONTHLY_SESSION_PAYMENT_REPORT}`, this.report_input)
    .subscribe({
        next: (res) => {
          if(this.report_input.status == 1){
            this.paidMemberList = res.data;
            this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
            this.total_txns_amount = this.paidMemberList.reduce((accumulator,item) => {return accumulator +=(+item.amount_paid)},0);
            this.total_txns = this.paidMemberListtemp.length;
          }else{
            this.dueMemberList = res.data;
            this.dueMemberListtemp = JSON.parse(JSON.stringify(this.dueMemberList));
            this.total_txns_amount = this.dueMemberListtemp.reduce((accumulator,item) => {return accumulator +=(+item.plan_amount)},0);
            this.total_txns = this.dueMemberListtemp.length;
          }
        },
        error: () => {
          this.commonService.toastMessage('Failed to fetch payment',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      });
  }

  public SelectedMonth(index: number) {
    this.isDateRange = false;
    this.isTransactionsAvail = false;
    this.total_txns_amount = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;

    // Deactivate other months
    this.trnsMonths.forEach((item, itemIndex) => {
      if (itemIndex !== index) item.IsActive = false;
    });
    // Determine the selected month and year
    const selectedMonth = this.trnsMonths[index];
    //this.paymentReportType = `${selectedMonth.month}-${selectedMonth.year}`;
    console.log("selected month index value and selcted value is:", selectedMonth, selectedMonth.year);
    if (selectedMonth.year === "Days") {
      // Set date range to the last 7 days
      this.report_input.start_date = moment().subtract(7, 'days').format("YYYY-MM-DD");
      this.report_input.end_date = moment().format("YYYY-MM-DD");
    } else if (selectedMonth.year === "") {
      // Enable custom date range selection
      this.isDateRange = true;
      this.report_input.start_date = moment().subtract(10, 'days').format("YYYY-MM-DD");
      this.report_input.end_date = moment().format("YYYY-MM-DD");
    } else {
      // Set date range for the selected month and year
      const startOfMonth = moment(`${selectedMonth.year}-${selectedMonth.month}-01`,'YYYY-MMM-DD').startOf('month');
      const endOfMonth = moment(startOfMonth).endOf('month');

      this.report_input.start_date = startOfMonth.format("YYYY-MM-DD");
      this.report_input.end_date = endOfMonth.format("YYYY-MM-DD");
      // Update the selected month for the report
      //this.paymentObj.SelectedMonth = `${selectedMonth.month}-${selectedMonth.year}`;
    }
    // Fetch the updated payment data based on the new date range
    this.getPayment();
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      //console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  
  cancel() {
    this.navCtrl.pop();
  }
  
  Search() {
    if (moment(this.startDate).isAfter(this.endDate)) {
      this.commonService.toastMessage("end should not be greaterthan start date", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else {
      this.report_input.start_date = this.startDate;
      this.report_input.end_date = this.endDate;
      // this.getSessionDetails();
      this.getPayment();
    }
  }


  paymentTabClick(type: string) {
    this.reportType = type;
    // console.log(this.reportType);
    // console.log(this.dueMemberListtemp.length);
    if (type == "Paid") {
      this.report_input.status = 1;
      if (this.sharedservice.getPlatform() == "android") {
        this.renderer.removeClass(this.scrollContent, "androidMargin");
      } else {
        this.renderer.removeClass(this.scrollContent, "iosMargin");
      }
      
    } else {
        this.report_input.status = 0;
        if (this.sharedservice.getPlatform() == "android") {
          this.renderer.addClass(this.scrollContent, "androidMargin");
        } else {
          this.renderer.addClass(this.scrollContent, "iosMargin");
        }
    }
    this.getPayment();
  }

  getClubList() {
    const clubs_input = {
      parentclub_id: this.postgre_parentclub_id,
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
      }
    }
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe((res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
        this.selectedClub = this.clubs[0].FirebaseId;
        if (this.clubs.length != 0) {
          this.selectedClub = "All";
          this.selectedCurrentClub = "All";
          //this.getData();
        }
      },
      (error) => {
          this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error)
          console.error("Error in fetching:", error);
      })
  }


  //goto 
  changeView() {
    this.isClubView = !this.isClubView;
    this.getData();
  }

  //Get Clubs View Detail  
  getData(): void {
    this.clubs.forEach((club: IClubDetails) => {
      if (this.reportType === 'Paid') {
        this.calculateClubPayments(club);
      } else {
        this.calculateClubDues(club);
      }
    });
  }
  
  /**
   * Calculate and update the amount paid and transactions for the given club.
   * @param club The club object to update.
   */
  calculateClubPayments(club: IClubDetails): void {
    // Initialize the amount and transactions
    let totalPaid = 0;
    let totalTransactions = 0;
  
    // Filter members that belong to this club and calculate totals
    // this.paidMemberListtemp
    //   .filter((mem: TermPaymentReport) => mem.ClubKey === club.FirebaseId)
    //   .forEach((mem: TermPaymentReport) => {
    //     totalPaid += parseFloat(mem.amount_paid);
    //     totalTransactions++;
    //   });
  
    // // Update the club's paid amount and transaction count
    // club.AmountPaid = totalPaid.toFixed(2);
    // club.Transactions = totalTransactions;
  }
  
  /**
   * Calculate and update the amount due and transactions for the given club.
   * @param club The club object to update.
   */
  calculateClubDues(club: IClubDetails): void {
    // Initialize the amount and transactions
    let totalDue = 0;
    let totalTransactions = 0;
  
  }
  
  filterByClub(session: any) {
    console.log(session);
    this.selectedClub = session.ClubKey;
  }


  onChangeOfClub() {
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    if (this.selectedClub == "All") {
      this.report_input.clubId = ""
    } else {
      this.report_input.clubId = this.selectedClub;
    }
    console.log("change club and club id", this.selectedClub);
    // this.coaches = [];
    // this.getCoachLists();
    this.paidMemberList = []
    this.getPayment();
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

  //sending emails
  gotoEmailPage() {
    try{
      //console.log(this.reportType)
      const reportList:payment_email[] = [];
      if(this.reportType.toLowerCase() === "due" && this.dueMemberListtemp.length == 0){
        this.commonService.toastMessage("Due members emails are not available", 2500, ToastMessageType.Error)
        return false;
      } 
      if(this.reportType.toLowerCase() === "paid" &&this.paidMemberListtemp.length == 0){
        this.commonService.toastMessage("No records found", 2500, ToastMessageType.Error)
        return false;
      }
      const txn_list = this.reportType.toLowerCase() === "due" ? this.dueMemberListtemp : this.paidMemberListtemp;
      const member_list = txn_list.map((member,index) => {
        return {
            IsChild:member.is_child,
            ParentId:'',
            MemberId:member.member_id, 
            MemberEmail:member.is_child ? member.parent_emailid:member.email_id, 
            MemberName: member.user_name
        }
      })
    
      const email_modal = {
          module_info:null,
          email_users:member_list,
          type:ModuleTypeForEmail.MONTHLYSESSION
      }
      this.navCtrl.push("MailToMemberByAdminPage", { email_modal });
    }catch(err){
      this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error)
    }
  }

  // Create a helper function to check if an object is a PaidMemberDetails type
  // isPaidMemberDetails(txn: any): txn is PaidMemberDetails {
  //   return txn.amount_paid !== undefined;
  // }

  slectedList: Array<any> = [];
  goToPrintPage() {
    // try{
    //   const txn_list = (this.reportType == "Due" ? this.dueMemberListtemp : this.paidMemberListtemp) as unknown[];

    //   if(txn_list.length == 0){
    //     this.commonService.toastMessage("No records found", 2500, ToastMessageType.Error)
    //     return false;
    //   }
      
    //   let report_list: report_model[] = txn_list.map((txn) => {
    //     if (this.isPaidMemberDetails(txn)) {
    //       // Handle Paid Members
    //       const paidTxn = txn as PaidMemberDetails;
    //       return {
    //         FirstName: paidTxn.FirstName,
    //         LastName: paidTxn.LastName,
    //         Session: paidTxn.session_name,
    //         Coach: paidTxn.coach_name || '',
    //         Venue: paidTxn.ClubName,
    //         PaidAmount: paidTxn.amount_paid,
    //         PaidOn: paidTxn.transaction_date,
    //         PaidBy: paidTxn.paid_by_text,
    //         DueAmount: "",
    //         Discount: paidTxn.total_discount,
    //       };
    //     } else {
    //       // Handle Due Members
    //       const dueTxn = txn as DueMemberDetails;
    //       return {
    //         FirstName: dueTxn.FirstName,
    //         LastName: dueTxn.LastName,
    //         Session: dueTxn.session_name,
    //         Coach: dueTxn.coach_name || '',
    //         Venue: dueTxn.ClubName,
    //         PaidAmount: "",
    //         PaidOn: "",
    //         PaidBy: "",
    //         DueAmount: dueTxn.amount_due,
    //         Discount: "",
    //       };
    //     }
    //   });
    //   this.navCtrl.push('PaidmemberstatusPage', {
    //     showType: this.reportType == "Due" ? 'due' : 'paid',
    //     memberList: report_list,
    //     reportType: this.paymentReportType
    //   }); 
    // }catch(err){
    //   this.commonService.toastMessage("Something went wrong",2500,ToastMessageType.Error)
    // }
  }

  //Searching Sessions

  getFilterItems(ev: any) {
    let val = ev.target.value;
    console.log(this.reportType);
    if (val && val.trim() != '') {
      this.paidMemberListtemp = this.paidMemberList.filter((item) => {
        if (item.session_name != undefined) {
          if (item.session_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        if (item.user_name != undefined) {
          if (item.user_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
       
        if (item.coach_name != undefined) {
          if (item.coach_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        if (item.club_name != undefined) {
          if (item.club_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
        if (item.days != undefined) {
            if ((item.days).toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }

          if (item.start_time != undefined) {
            if (item.start_time.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.transaction_id != undefined) {
            if (item.transaction_id.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
      })    
    }else { // if the search term is empty resetting the tabs according to active tab
      if(this.reportType=="Paid"){
        this.paidMemberListtemp = this.paidMemberList;
      }
    }
  }




}








enum ShowType {
  Paid = 'paid',
  Due = "due",
  Pending = "pending"
}



export class UserPostgreMetadataField {
  UserParentClubId: string
  UserClubId: string
  UserMemberId: string
  UserActivityId: string
}

export class MonthlySessionPaymentReportRes {
  enrol_id: string;
  session_id: string;
  member_id: string;
  is_child:boolean;
  session_name: string;
  user_name: string;
  subscription_id?: string;
  subscription_status?: string;
  subscribed_date?: string;
  latest_payment_date?: string;
  txn_date:string;
  enrolled_date:string;
  paid_month:string;
  start_month?: string;
  end_month?: string;
  cancelled_date?: string;
  transaction_id?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  amount_paid?: number;
  order_id?: string;
  paidby?: string;
  plan_amount: number;
  start_time?: string;
  days?: string;
  dob:string; 
  medical_condition:string;
  media_consent:boolean;
  email_id:string; 
  phone_number: string;
  parent_emailid: string;
  parent_phoneno: string;
  parentclub_id: string;
  parentclub_name: string;
  coach_id?: string;
  coach_name?: string;
  FirebaseKey?: string;
  club_id?: string;
  club_name?: string;
  activity_id?: string;
  activity_name?: string;
}
