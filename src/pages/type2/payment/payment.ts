// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component, ViewChild, Renderer2, ElementRef, } from '@angular/core';
import { NavController, PopoverController, Platform, ActionSheetController, LoadingController, Slides, Content } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as moment from 'moment';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { IClubDetails } from '../session/sessions_club.model';
import { HttpService } from '../../../services/http.service';
import { IClubCoaches } from '../../../shared/model/club.model';
import { DueMemberDetails, PaidMemberDetails, payment_email, report_model } from './model/report.model';
@IonicPage()
@Component({
  selector: 'payment-page',
  templateUrl: 'payment.html',
  providers: [HttpService]
})

export class Payment {
  @ViewChild('myslider') myslider: Slides;
  isDateRange: boolean = true;
  @ViewChild(Content) content: Content;
  isSearchEnabled: boolean = false;
  isDuePaymentLoaded: boolean = false;
  paymentReportType: any;
  LangObj: any = {};//by vinod
  isMonthSelected: boolean = false;
  TotTransc: number = 0;
  TotTrnsAmt: any = 0.0;
  TotDueTrnsAmt: any = 0.0;
  TotDueTransc: number = 0;
  showTypeVal: any = "paid";
  totalDueAmount: number;
  numberofTransaction: number;
  pendingPaymentInput: PendingPaymentInput = {
    parentclub_id: '',
    club_id: '',
    date: moment().format('YYYY-MM-DD'),
    user_postgre_metadata: new UserPostgreMetadataField
  }
  postgre_parentclub_id:string = '';
  inputObj = {
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
  }

  paymentObj = { ParentClubKey: "", CoachKey: "All", VenueKey: "All", MemberKey: "", SelectedMonth: "", Type: 1, Channel: "Mobile" };
  nestUrl: string = "";
  currentFinacialYearTermList = [];
  financialYear1Key: any;
  financialYear1: any;
  termKey = "";
  themeType: number;
  isAndroid: boolean = false;
  reportType = "Paid";
  loading: any;
  coachKey: any;
  parentClubKey: any;
  obj = {
    Message: ''
  }
  sessionFolder = [];
  clubs: IClubDetails[] = [];
  selectedClub = "";
  selectedCurrentClub = "";
  coaches: IClubCoaches[] = [];
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
  paidMemberList: Array<TermPaymentReport> = [];
  paidMemberListtemp:TermPaymentReport[]=[]
  dueMemberList:Array<PendingPaymentDetails>= [];
  dueMemberListtemp :PendingPaymentDetails[]=[];
  pendingPayment: PendingPaymentDetails[] = [];
  filteredPendingPayment: PendingPaymentDetails[] = [];

  constructor(public events: Events, 
    public sharedService: SharedServices, 
     public http: HttpClient, public commonService: CommonService, 
     public loadingCtrl: LoadingController, platform: Platform, 
     public storage: Storage, public fb: FirebaseService, 
     public navCtrl: NavController, public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private renderer: Renderer2, 
    private elementRef: ElementRef, 
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,
     private httpService: HttpService) {

    // Setup initial values and configuration
    this.setupInitialConfig(platform);
  

  }

  
  ngOnInit() {
    // Fetch user data and initialize months
    this.initializeMonths();
    this.loadUserData();
  }

  async setupInitialConfig(platform: Platform) {
    const [login_obj,postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
    ])
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.userData = this.sharedService.getUserData();
      this.themeType = this.sharedservice.getThemeType();
      this.nestUrl = this.sharedService.getnestURL();
      this.isAndroid = platform.is('android');
      this.startDate = moment().subtract(10, 'days').format("YYYY-MM-DD");
      this.endDate = moment().format("YYYY-MM-DD");
      this.inputObj.start_date = this.startDate;
      this.inputObj.end_date = this.endDate;
      this.inputObj.parentclubId = postgre_parentclub.Id;
      this.pendingPaymentInput.parentclub_id = postgre_parentclub.Id;
      this.pendingPaymentInput.club_id = "All";
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
        this.paymentObj.ParentClubKey = this.parentClubKey;
        this.clubs = [];
        this.getPayment();
        //this.getAllPendingPayment();
      }
    });

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = val ? JSON.parse(val) : null;
    }).catch((error) => console.error('Currency fetch error:', error));
  }

  public SelectedMonth(index: number) {
    this.isDateRange = false;
    this.isTransactionsAvail = false;
    this.TotTrnsAmt = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;

    // Deactivate other months
    this.trnsMonths.forEach((item, itemIndex) => {
      if (itemIndex !== index) item.IsActive = false;
    });
    // Determine the selected month and year
    const selectedMonth = this.trnsMonths[index];
    this.paymentReportType = `${selectedMonth.month}-${selectedMonth.year}`;
    console.log("selected month index value and selcted value is:", selectedMonth, selectedMonth.year);
    if (selectedMonth.year === "Days") {
      // Set date range to the last 7 days
      this.inputObj.start_date = moment().subtract(7, 'days').format("YYYY-MM-DD");
      this.inputObj.end_date = moment().format("YYYY-MM-DD");
    } else if (selectedMonth.year === "") {
      // Enable custom date range selection
      this.isDateRange = true;
      this.inputObj.start_date = moment().subtract(10, 'days').format("YYYY-MM-DD");
      this.inputObj.end_date = moment().format("YYYY-MM-DD");
    } else {
      // Set date range for the selected month and year
      const startOfMonth = moment(`${selectedMonth.year}-${selectedMonth.month}-01`,'YYYY-MMM-DD').startOf('month');
      const endOfMonth = moment(startOfMonth).endOf('month');

      this.inputObj.start_date = startOfMonth.format("YYYY-MM-DD");
      this.inputObj.end_date = endOfMonth.format("YYYY-MM-DD");
      // Update the selected month for the report
      this.paymentObj.SelectedMonth = `${selectedMonth.month}-${selectedMonth.year}`;
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
      this.inputObj.start_date = this.startDate;
      this.inputObj.end_date = this.endDate;
      // this.getSessionDetails();
      this.getPayment();
    }
  }


  paymentTabClick(type: string) {
    this.reportType = type;
    // console.log(this.reportType);
    // console.log(this.dueMemberListtemp.length);
    if (type == "Paid") {
      if (this.isAndroid) {
        this.renderer.removeClass(this.scrollContent, "androidMargin");
      } else {
        this.renderer.removeClass(this.scrollContent, "iosMargin");
      }
      this.getPayment();
    } else {
        if (this.isAndroid) {
          this.renderer.addClass(this.scrollContent, "androidMargin");
        } else {
          this.renderer.addClass(this.scrollContent, "iosMargin");
        }
        this.getAllPendingPayment();        
    }
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
          this.getData();
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
    this.paidMemberListtemp
      .filter((mem: TermPaymentReport) => mem.ClubKey === club.FirebaseId)
      .forEach((mem: TermPaymentReport) => {
        totalPaid += parseFloat(mem.amount_paid);
        totalTransactions++;
      });
  
    // Update the club's paid amount and transaction count
    club.AmountPaid = totalPaid.toFixed(2);
    club.Transactions = totalTransactions;
  }
  
  /**
   * Calculate and update the amount due and transactions for the given club.
   * @param club The club object to update.
   */
  calculateClubDues(club: IClubDetails): void {
    // Initialize the amount and transactions
    let totalDue = 0;
    let totalTransactions = 0;
  
    // Filter members that belong to this club and calculate totals
    this.dueMemberListtemp
      .filter((mem: PendingPaymentDetails ) => mem.ClubKey === club.FirebaseId)
      .forEach((mem: PendingPaymentDetails) => {
        totalDue += parseFloat(mem.amount_due);
        totalTransactions++;
      });
  
    // Update the club's due amount and transaction count
    club.AmountDue = totalDue.toFixed(2);
    club.Transactions = totalTransactions;
  }
  
  filterByClub(session: any) {
    console.log(session);
    this.selectedClub = session.ClubKey;
  }

  sendFirebaseResp(firebasereq: any) {
    return this.fb.getPropValue(firebasereq);
  }

  onChangeOfClub() {
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    if (this.selectedClub != "All") {
      this.inputObj.clubId = this.clubs.find(club => club.FirebaseId === this.selectedClub).Id;
    } else {
      this.inputObj.clubId = ""
    }
    console.log("change club and club id", this.selectedClub);
    // this.coaches = [];
    // this.getCoachLists();
    this.paidMemberList = []
    this.getPayment();
  }

  async onChangeOfCoach() {
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    if (this.selectedCoach != "All") {
      // this.paymentObj.CoachKey = this.selectedCoach;
      //this.getSessionDetails();
     //this.inputObj.coach_id = await this.getCoachIdsByFirebaseKeys(this.selectedCoach);
    } else {
     // this.inputObj.coach_id = ""
    }
    console.log("change of coach and id for coach id", this.selectedCoach);
    this.getPayment();
  }

  //calling from getClubList method
  getCoachLists() {
    const coachInput = {
      parentclub: this.selectedClub.toLowerCase() == "all" ? this.sharedservice.getPostgreParentClubId() : this.parentClubKey,
      club: this.selectedClub.toLowerCase() == "all" ? "" : this.selectedClub,
      fetch_from: this.selectedClub.toLowerCase() == "all" ? 1 : 0
    }
    const coaches_query = gql`
    query getClubCoaches($coachInput: CoachFetchInput!){
      getClubCoaches(coachInput:$coachInput){
          Id
          coach_firebase_id
          first_name
          last_name
          gender
          email_id 
        }
    }
    `;
    this.graphqlService.query(coaches_query, { coachInput }, 0)
      .subscribe((res: any) => {
        this.coaches = res.data.getClubCoaches as IClubCoaches[];
        console.log("coach lists:", JSON.stringify(this.coaches));
        this.selectedCoach = "All";
        this.getPayment();
      },
      (error) => {
          console.error("Error in fetching:", error);
          // Handle the error here, you can display an error message or take appropriate action.
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

  goToPaymentDetailsListPage() {
    this.navCtrl.push("PaymentDetails", { AllSessionLists: this.sessionDetails, AllClubs: this.clubs, SelectedClub: this.selectedClub, SelectedCoach: this.selectedCoach, ReportType: "Overall", TermKey: this.termKey });
    // console.log(this.sessionDetails);
    // console.log(this.clubs);
  }

  goToCurrentPaymentDetailsListPage() {
    this.navCtrl.push("PaymentDetails", { AllSessionLists: this.sessionDetailsCurrentTerm, AllClubs: this.clubs, SelectedClub: this.selectedCurrentClub, SelectedCoach: this.selectedCurrentCoach, ReportType: "CurrentTerm", TermKey: this.termKey });
  }

  gotoEmailPage() {
    try{
      console.log(this.reportType)
      const reportList:payment_email[] = this.reportType == "Due" ? this.dueMemberListtemp : this.paidMemberListtemp;
      if(reportList.length == 0){
        this.commonService.toastMessage("No records found", 2500, ToastMessageType.Error)
        return false;
      }
      const member_list = reportList.map((member,index) => {
        return {
            IsChild:member.is_child ? true:false,
            ParentId:member.is_child ? member.parent_key:"",
            MemberId:member.user_id, 
            MemberEmail:member.email!="" && member.email!="-" && member.email!="n/a" ? member.email:(member.is_child ? member.ParentEmailID:""), 
            MemberName: member.FirstName + " " + member.LastName
        }
      })
    
      const email_modal = {
          module_info:null,
          email_users:member_list,
          type:100
      }
      this.navCtrl.push("PaymentstatusemailPage", { email_modal });
    }catch(err){
      this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error)
    }
  }

  // Create a helper function to check if an object is a PaidMemberDetails type
  isPaidMemberDetails(txn: any): txn is PaidMemberDetails {
    return txn.amount_paid !== undefined;
  }

  slectedList: Array<any> = [];
  goToPrintPage() {
    try{
      const txn_list = (this.reportType == "Due" ? this.dueMemberListtemp : this.paidMemberListtemp) as unknown[];

      if(txn_list.length == 0){
        this.commonService.toastMessage("No records found", 2500, ToastMessageType.Error)
        return false;
      }
      
      let report_list: report_model[] = txn_list.map((txn) => {
        if (this.isPaidMemberDetails(txn)) {
          // Handle Paid Members
          const paidTxn = txn as PaidMemberDetails;
          return {
            FirstName: paidTxn.FirstName,
            LastName: paidTxn.LastName,
            Session: paidTxn.session_name,
            Coach: paidTxn.coach_name || '',
            Venue: paidTxn.ClubName,
            PaidAmount: paidTxn.amount_paid,
            PaidOn: paidTxn.transaction_date,
            PaidBy: paidTxn.paid_by_text,
            DueAmount: "",
            Discount: paidTxn.total_discount,
          };
        } else {
          // Handle Due Members
          const dueTxn = txn as DueMemberDetails;
          return {
            FirstName: dueTxn.FirstName,
            LastName: dueTxn.LastName,
            Session: dueTxn.session_name,
            Coach: dueTxn.coach_name || '',
            Venue: dueTxn.ClubName,
            PaidAmount: "",
            PaidOn: "",
            PaidBy: "",
            DueAmount: dueTxn.amount_due,
            Discount: "",
          };
        }
      });
      this.navCtrl.push('PaidmemberstatusPage', {
        showType: this.reportType == "Due" ? 'due' : 'paid',
        memberList: report_list,
        reportType: this.paymentReportType
      }); 
    }catch(err){
      this.commonService.toastMessage("Something went wrong",2500,ToastMessageType.Error)
    }
  }


  presentActionSheetForDue(record: any) {
    // this.myIndex = -1;
    let actionSheet: any;
    actionSheet = this.actionSheetCtrl.create({
      //title: 'Modify your album',
      buttons: [
        {
          text: 'Notify',
          icon: 'md-notifications',
          handler: () => {
            this.notify(record, "Due");
          }
        },
        {
          text: 'Email',
          icon: 'mail',
          handler: () => {
            this.mailToIndividualMember(record);
            console.log(record);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });

    actionSheet.present();
  }


  mailToIndividualMember(member: any) {
    let data = [];
    // if (isMonthly) {
    //   data.push(
    //     {
    //       coachName: session.CoachName,
    //       FirstName: session.FirstName,
    //       LastName: session.LastName,
    //       SessionName: session.SessionName,
    //       ClubName: session.ClubName,
    //       IsActive: true,
    //       EmailID: emailid
    //     })
    // } else {
    //   data.push(session);
    // }
    data.push(member);
    this.slectedList = JSON.parse(JSON.stringify(data));
    let memberList = this.slectedList;
    this.navCtrl.push("PaymentstatusemailPage", {
      memberList: memberList,
      type: this.reportType,
      parentclubKey: this.parentClubKey
    })
  }

  notify(member, pagename) {
    console.log(member);
    //
    //ClubKey,ParentKey,ParentClubKey
    //  //nothing but memberkey
    //"A gentle reminder for the payment for the session: " + this.memberDetails.SessionName + "-" + this.memberDetails.Days + "-" + this.memberDetails.StartTime + "-" + this.memberDetails.CoachName + ". Thanks";
    this.navCtrl.push("Type2PaymentNotification", { MemberDetails: member, PageName: pagename });
  }

  


  //   Searching Sessions

  getFilterItems(ev: any) {

    let val = ev.target.value;
    console.log(this.reportType);
    if (val && val.trim() != '') {
      if (this.reportType == "Paid") { // if active tab is Paid
        this.paidMemberListtemp = this.paidMemberList.filter((item) => {
          if (item.session_name != undefined) {
            if (item.session_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.FirstName != undefined) {
            if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.LastName != undefined) {
            if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.coach_name != undefined) {
            if (item.coach_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.ClubName != undefined) {
            if (item.ClubName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
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
            if (item.transaction_date != undefined) {
              if (item.transaction_date.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                return true;
              }
            }
            if (item.paid_by_text != undefined) {
              if (item.paid_by_text.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                return true;
              }
            }if (item.term_name != undefined) {
              if (item.term_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                return true;
              }
            }

        })
      }else { // if active tab is Due
        this.dueMemberListtemp = this.dueMemberList.filter((item) => {
          if (item.session_name != undefined) {
            if (item.session_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.FirstName != undefined) {
            if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.LastName != undefined) {
            if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.coach_name != undefined) {
            if (item.coach_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
          if (item.ClubName != undefined) {
            if (item.ClubName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
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
          if (item.term_name != undefined) {
            if (item.term_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }
        })
      } 
    }else { // if the search term is empty resetting the tabs according to active tab
      if(this.reportType=="Paid"){
        this.paidMemberListtemp = this.paidMemberList;
      }else{
        this.dueMemberListtemp = this.pendingPayment;
      }
    }
  }


  //Post-Gre Api To Get Pending payment
  getAllPendingPayment() {
    this.commonService.showLoader("Please wait...");
    const report = gql`
    query getAllPendingPaymentTermSession($pendingPaymentInput:PendingPaymentInput!){
      getAllPendingPaymentTermSession(pendingPaymentInput:$pendingPaymentInput){
        ClubName
        user_id
        parent_key
        FirebaseKey
        ClubKey
        club_id
         is_child
         postgre_clubid
         FirstName
         LastName
         amount_due
         session_name
        coach_name
        start_time
        days
        term_name
        coach_id
        phone_number
        email
        DOB
        MedicalCondition
        MediaConsent
        PhoneNumber
        ParentEmailID
        ParentPhoneNumber

      }
    }
    `;

    this.graphqlService.query(report, { pendingPaymentInput: this.pendingPaymentInput }, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.dueMemberList = res.data.getAllPendingPaymentTermSession;
      this.dueMemberListtemp= JSON.parse(JSON.stringify(res.data.getAllPendingPaymentTermSession));
      const totalDueAmount = this.dueMemberList.reduce((total, payment) => {
        const amountDue = parseFloat(payment.amount_due);
        return total + amountDue;
      }, 0);
      this.totalDueAmount = totalDueAmount;
      this.numberofTransaction = this.dueMemberList.length;
      this.getData();
    }, (error) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage("Fetching failed for Payment", 2500, ToastMessageType.Error);
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

  //getting paid payments
  getPayment(): void {
    console.log("input obj is:", JSON.stringify((this.inputObj)));
    this.httpService.post<{ data: TermPaymentReport[] }>('paymentreport/termpaymentreport', this.inputObj)
    .subscribe({
        next: (res) => {
          this.paidMemberList = res.data;
          this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
          this.TotTrnsAmt = this.paidMemberList.reduce((accumulator,item) => {return accumulator +=parseFloat(item.amount_paid)},0);
          this.TotTransc = this.paidMemberList.length;
          if(this.clubs.length == 0)this.getClubList();
        },
        error: () => {
          this.commonService.toastMessage('Failed to fetch payment',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      });
  }





}








enum ShowType {
  Paid = 'paid',
  Due = "due",
  Pending = "pending"
}


export class PendingPaymentDetails {

  ClubName: string
  user_id: string
  parent_key: string
  FirebaseKey: string
  ClubKey: string
  club_id: string
  is_child: boolean
  postgre_clubid: string
  FirstName: string
  LastName: string
  amount_due: string
  session_name: string
  coach_name: string
  start_time: string
  days: string
  term_name: string
  coach_id: string
  phone_number: string
  email: string
  DOB:string;
  MedicalCondition:string;
  MediaConsent:string;
  PhoneNumber:string;
  ParentEmailID:string
  ParentPhoneNumber:string;
}

export class TermPaymentReport{
  club_id: string
  ClubKey: string
  session_id: string
  parent_key:string
  ClubName:string
  start_time: string
  session_name: string
  term_name:string
  days: string
  FirstName: string
  LastName: string
  user_id: string
  phone_number: string
  email: string
  is_child: boolean
  coach_name: string
  Id: string
  paidby: number
  amount_paid:string
  transaction_date: string
  total_discount: string
  paid_by_text: string
  DOB:string;
  MedicalCondition:string;
  MediaConsent:string;
  PhoneNumber:string;
  ParentEmailID:string
  ParentPhoneNumber:string;
}

export class PendingPaymentInput {


  parentclub_id: string
  club_id: string
  date: string

  user_postgre_metadata: UserPostgreMetadataField
}

export class UserPostgreMetadataField {
  UserParentClubId: string
  UserClubId: string
  UserMemberId: string
  UserActivityId: string
}
