import { FirebaseService } from '../../../../services/firebase.service';
import { Component, ViewChild, Renderer2, ElementRef, } from '@angular/core';
import { NavController, PopoverController, Platform, ActionSheetController, LoadingController, Slides, Content } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
// import { PaymentDetails } from './paymentdetails';
import * as moment from 'moment';
import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

/**
 * Generated class for the MembershipreportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membershipreport',
  templateUrl: 'membershipreport.html',
})
export class MembershipreportPage {
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Content) content: Content;
  isSearchEnabled: boolean = false;
  isFirstTime: boolean = true;
  paymentReportType: any;
  LangObj: any = {};//by vinod
  isMonthSelected: boolean = false;
  TotTransc: number = 0;
  TotTrnsAmt: any = 0.0;

  TotDueTrnsAmt: any = 0.0;
  TotDueTransc: number = 0;
  showTypeVal: any = "paid";
  dueMemberList = [];
  paidMemberListtemp = [];
  dueMemberListtemp = [];
  pendingVerificationMemberList = [];
  pendingVerificationMemberListtemp = [];

  //paymentObj = { parentClubKey: "", MemberShipKey:"All", clubKey : "All", StartDate:"",EndDate:"",SelectedMonth:"", SearchCriteria:"Days"};
  paymentObj = { parentClubKey: "", membershipKey: "All", clubKey: "All", searchCriteria: {} };
  nodeUrl: string = "";
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
  clubs = [];
  selectedClub = "";
  selectedCurrentClub = "";
  coaches = [];
  memberships = [];
  selectedCoach = "";
  MembershipKey = "";
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
  isDateRange: boolean = false;
  paidMemberList: Array<any> = [];
  startDate: any;
  endDate: any;
  maxDate: any;
  minDate: any;
  currencyDetails: any = "";
  constructor(public events: Events, public sharedService: SharedServices, public commonService: CommonService, public loadingCtrl: LoadingController, platform: Platform, public storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,
    private renderer: Renderer2, private elementRef: ElementRef, private http: HttpClient, public actionSheetCtrl: ActionSheetController, ) {
    
    this.userData = this.sharedService.getUserData();
    this.themeType = sharedservice.getThemeType();
    this.nodeUrl = this.sharedService.getnestURL()
    this.isAndroid = platform.is('android');
    console.log(this.isAndroid);
    this.reportType = "Paid";

    this.startDate = moment((moment().subtract(10, 'days'))).format("YYYY-MM-DD");;
    this.endDate = moment().format("YYYY-MM-DD")
    // let now = moment().add(10, 'year');
    // this.maxDate = moment(now).format("YYYY-MM-DD");
    // this.minDate = this.endDate;

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });



  }

  startdateChanged() {
    //this.weeklySessionObj.NoOfWeeks = Math.ceil( this.days.length / 7);
  }
  // validateSessionDate() {
  //   if (new Date(this.startDate).getTime() > new Date(this.endDate).getTime()) {
  //     //this.showToast("Session start date should be greater than end date.", 5000);
  //     return false;
  //   }
  //   return true;
  // }



  trnsMonths: Array<any> = [];
  ionViewWillEnter() {
    for (let i = 0; i < 4; i++) {
      let check = moment().subtract(i, 'months');
      let month = check.format('MMM');
      let year = check.format('YYYY');
      this.trnsMonths.push({ month: month, year: year, IsActive: false });
    }
    this.trnsMonths.reverse();
    this.trnsMonths.push({ month: "7", year: "Days", IsActive: true });
    this.trnsMonths.push({ month: "Dates", year: "", IsActive: false });
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.paymentObj.parentClubKey = this.parentClubKey;
        this.paymentObj.searchCriteria["type"] = "DAYS";
        this.paymentObj.searchCriteria["numberOfDays"] = '7';
      //   this.paymentObj.searchCriteria["type"] = "CUSTOM";
      // this.paymentObj.searchCriteria["startDate"] = "2020-05-01";
      // this.paymentObj.searchCriteria["endDate"] = "2020-05-15";
        this.getMembershipDetails();
        this.getClubList();
      }
    });

  }


  scrollContent: any
  ionViewDidLoad() {
    this.scrollContent = this.elementRef.nativeElement.getElementsByClassName('scroll-content')[0];
    

    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });

  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      //console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  slideChanged() {

  }

  SelectedMonth(index: number) {
    this.isDateRange = false;
    this.TotTrnsAmt = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;

    if (this.trnsMonths[index].IsActive) {
      this.trnsMonths.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item.IsActive = false;
      });
    }

    this.paymentReportType = `${this.trnsMonths[index].month}-${this.trnsMonths[index].year}`;
    if (this.trnsMonths[index].year == "Days") {
      this.paymentObj.searchCriteria["type"] = "DAYS";
      this.paymentObj.searchCriteria["numberOfDays"] = 7;
      this.getMembershipDetails();
    } else if (this.trnsMonths[index].year == "") {
      this.paymentObj.searchCriteria["type"] = "CUSTOM";
      this.paymentObj.searchCriteria["startDate"] = this.startDate;
      this.paymentObj.searchCriteria["endDate"] = this.endDate;
      this.isDateRange = true;
      this.getMembershipDetails();
    } else {
      this.paymentObj.searchCriteria["type"] = "MONTH";
      this.paymentObj.searchCriteria["monthWithYear"] = `${this.trnsMonths[index].month}-${this.trnsMonths[index].year}`;
      this.getMembershipDetails();
    }

    

  }

  ChooseDates() {

  }



  cancel() {
    this.navCtrl.pop();
  }
  pay() {

  }

  paymentTabClick(type: string) {
    console.log(this.reportType);
    console.log(this.dueMemberListtemp.length);
    if (this.reportType == "Paid") {

      this.showType('Paid');
      if (this.isAndroid) {
        this.renderer.removeClass(this.scrollContent, "androidMargin");
      } else {
        this.renderer.removeClass(this.scrollContent, "iosMargin");
      }
    } else {

      this.showType('Due');
      if (this.isAndroid) {
        this.renderer.addClass(this.scrollContent, "androidMargin");
      } else {
        this.renderer.addClass(this.scrollContent, "iosMargin");
      }

    }

  }


  getClubList() {
    console.log("/Club/Type2/" + this.parentClubKey);
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (this.clubs.length != 0) {
        this.selectedClub = "All";
        this.selectedCurrentClub = "All";
      }
    });
  }

  Search(){
    this.paymentObj.searchCriteria["type"] = "CUSTOM";
    this.paymentObj.searchCriteria["startDate"] = this.startDate;
    this.paymentObj.searchCriteria["endDate"] = this.endDate;
    this.getMembershipDetails();
  }

  getMembershipDetails() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    this.paidMemberList = [];
    this.paidMemberListtemp = [];
    this.TotTrnsAmt = 0.0;
    this.TotTransc = 0;

  
    //this.nodeUrl = "http://localhost:5000"
    //this.paymentObj.ParentClubKey = "-Kd2fSCGOw6K3mvzu-yH";//need to be removedme
    //this.paymentObj.searchCriteria = JSON.stringify(this.paymentObj.searchCriteria);
    let criteraiaObj = JSON.stringify(this.paymentObj.searchCriteria);
    this.http.get(`${this.nodeUrl}/membership/paymentreport?searchCriteria=${criteraiaObj}&membershipKey=All&clubKey=${this.paymentObj.clubKey}&parentClubKey=${this.paymentObj.parentClubKey}`).subscribe((res: any) => {
      //console.log(this.clubs);
      console.log(res);
      this.loading.dismiss();

      this.paidMemberList = res.data.paidPaymentList;

      this.dueMemberList = res.data.duePaymentList;

      this.dueMemberList.forEach((member)=> member["IsActive"] = true);//need to remove once this filed got from api

      for (let i = 0; i < this.paidMemberList.length; i++) {
        this.paidMemberList[i]["IsActive"] = true;//need to remove once this filed got from api
        this.paidMemberList[i].TransactionDate = moment(this.paidMemberList[i].TransactionDate).format('DD-MMM-YY');
        this.paidMemberList[i].Amount = parseFloat(this.paidMemberList[i].Amount).toFixed(2);
        if (this.paidMemberList[i].Amount && this.paidMemberList[i].Amount != "NaN"){ 
          this.TotTrnsAmt = parseFloat(this.TotTrnsAmt) + parseFloat(this.paidMemberList[i].Amount);
          this.TotTrnsAmt = parseFloat(this.TotTrnsAmt).toFixed(2);
        }
        //this.paidMemberList[i].MonthsPaidFor[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.paidMemberList[i].MonthsPaidFor[j].TotalFeesAmount) - parseFloat(this.paidMemberList[i].MonthsPaidFor[j].AmountPaid))).toFixed(2);
        this.TotTransc = this.TotTransc + 1;
      }



      // this.paidMemberList = this.paidMemberList.sort((d1, d2) => {
      //   return new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime();
      // });


      this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
      this.dueMemberListtemp = JSON.parse(JSON.stringify(this.dueMemberList));

      console.log(this.paidMemberList);
      this.showType('Paid');
    }, (err) => {
      console.log("err", err);
      this.loading.dismiss();
      //this.showToast("There is some problem,Please try again",2500);
    });
  }





  onChangeOfClub() {
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    if (this.selectedClub != "All") {
      console.log(this.selectedClub);
      this.paymentObj.clubKey = this.selectedClub;
      // this.fb.getAll("/Club/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/Coach/").subscribe((data) => {
      //   this.coaches = data;
      //   this.selectedCoach = "All";
      //   this.getMembershipDetails();
      // });
      this.getMembershipDetails();
    }

  }
  // onChangeOfCoach() {
  //   this.amountDue = "0.00";
  //   this.amountPaid = "0.00";
  //   if (this.selectedCoach != "All") {
  //     this.paymentObj.CoachKey = this.selectedCoach;

  //     this.getMembershipDetails();

  //   }

  // }
  
  //-KpyPVVvqEJ_g_i77biY
  //KpyPVVvqEJ_g_i77biY
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
    console.log(this.sessionDetails);
    console.log(this.clubs);
  }

  goToCurrentPaymentDetailsListPage() {
    this.navCtrl.push("PaymentDetails", { AllSessionLists: this.sessionDetailsCurrentTerm, AllClubs: this.clubs, SelectedClub: this.selectedCurrentClub, SelectedCoach: this.selectedCurrentCoach, ReportType: "CurrentTerm", TermKey: this.termKey });
  }

  
  slectedList: Array<any> = [];
  showType(val) {
    if (val == 'Paid') {
      this.showTypeVal = ShowType.Paid;
      let data = [];
      this.paidMemberListtemp.forEach((paidMember) => {
        if (paidMember.isMonthlySes) {
          if (paidMember.MonthsPaidFor.length > 0) {
            paidMember.MonthsPaidFor.forEach((monthlySes) => {
              monthlySes["coachName"] = paidMember.CoachName;
              monthlySes["FirstName"] = paidMember.FirstName;
              monthlySes["LastName"] = paidMember.LastName;
              monthlySes["SessionName"] = paidMember.SessionName;
              monthlySes["ClubName"] = paidMember.ClubName;
              data.push(monthlySes);
            });
          }
        } else {
          data.push(paidMember);
        }
      });
      this.slectedList = JSON.parse(JSON.stringify(data));
    } else if (val == 'Due') {
      this.showTypeVal = ShowType.Due;
      let data = [];
      this.dueMemberListtemp.forEach((dueMember) => {
        if (dueMember.isMonthlySes) {
          if (dueMember.MonthsNeedtoPay.length > 0) {
            dueMember.MonthsNeedtoPay.forEach((monthlySes) => {
              monthlySes["coachName"] = dueMember.CoachName;
              monthlySes["FirstName"] = dueMember.FirstName;
              monthlySes["LastName"] = dueMember.LastName;
              monthlySes["SessionName"] = dueMember.SessionName;
              monthlySes["ClubName"] = dueMember.ClubName;
              data.push(monthlySes);
            });
          }
        } else {
          data.push(dueMember);
        }
      });
      //this.dueMemberListtemp = data;
      this.slectedList = data;
    }
  }



  //print
  goToPrint() {
    this.navCtrl.push('PrintmembershipPage', {
      showType: this.showTypeVal,
      memberList: this.reportType == "Due" ? this.dueMemberListtemp:this.paidMemberListtemp,
      parentClubKey: this.parentClubKey,
      reportType: this.paymentReportType
    });
  }
  
  sendMailStatus() {
    console.log(this.reportType)
    //let  memberList = this.reportType == "Due"?this.dueMemberListtemp:this.paidMemberListtemp
    let memberList = this.slectedList;
    this.navCtrl.push("PaymentstatusemailPage", {
      memberList: this.reportType == "Due" ? this.dueMemberListtemp:this.paidMemberListtemp,
      type: this.reportType,
      parentclubKey: this.parentClubKey
    })

  }


}




enum ShowType {
  Paid = 'paid',
  Due = "due",
  Pending = "pending"
}
