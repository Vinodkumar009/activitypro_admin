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
  selector: 'page-facilityreport',
  templateUrl: 'facilityreport.html',
})
export class FacilityReportPage {
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
  paymentObj = { parentClubKey : "",  activitykey : "", courtkey : "", clubKey : "", startDate :"", lasttDate :""}

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
  nestUrl: string;
  constructor(public events: Events, public sharedService: SharedServices, public commonService: CommonService, public loadingCtrl: LoadingController, platform: Platform, public storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,
    private renderer: Renderer2, private elementRef: ElementRef, private http: HttpClient, public actionSheetCtrl: ActionSheetController, ) {
    
    this.userData = this.sharedService.getUserData();
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    console.log(this.isAndroid);
    this.nestUrl = this.sharedService.getnestURL()
    this.reportType = "Paid";

    this.startDate = moment((moment().subtract(7, 'days'))).format("YYYY-MM-DD");;
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
        this.paymentObj.startDate = this.startDate
        this.paymentObj.lasttDate = this.endDate
        
        this.getClubList();  
       
      }
    });

  }


  scrollContent: any
  ionViewDidLoad() {
    this.scrollContent = this.elementRef.nativeElement.getElementsByClassName('scroll-content')[0];
    this.nodeUrl = SharedServices.getTempNodeUrl();

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

    let startDate7days = moment((moment().subtract(7, 'days'))).format("YYYY-MM-DD");;
    let endDate7days = moment().format("YYYY-MM-DD")
    this.paymentReportType = `${this.trnsMonths[index].month}-${this.trnsMonths[index].year}`;
    if (this.trnsMonths[index].year == "Days") {
      this.paymentObj.startDate = startDate7days
      this.paymentObj.lasttDate = endDate7days
      this.getactivebookingDetails()
      //this.getActiveBookings();
    } else if (this.trnsMonths[index].year == "") {
      this.paymentObj.startDate = this.startDate
      this.paymentObj.lasttDate = this.endDate
      this.isDateRange = true;
      this.getactivebookingDetails()
      //this.getActiveBookings();
    } else {
      this.paymentObj.startDate = moment().month(this.trnsMonths[index].month).startOf('month').format('YYYY-MM-DD');
      this.paymentObj.lasttDate = moment().month(this.trnsMonths[index].month).endOf('month').format('YYYY-MM-DD');
      this.getactivebookingDetails()
      //this.getActiveBookings();
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
        //this.getActiveBookings();
        this.getactivebookingDetails()
      }
    });
  }

  Search(){
    this.paymentObj.startDate = this.startDate
      this.paymentObj.lasttDate = this.endDate
      this.getactivebookingDetails()
    //this.getActiveBookings();
  }




   
  getActivityName(key, slot){
  
    return new Promise((res, rej)=>{
      if( slot.CourtInfo.ClubKey){
        let x = this.fb.getAllWithQuery("/Activity/" + this.parentClubKey + "/" + slot.CourtInfo.ClubKey, { orderByKey: true, equalTo: key }).subscribe((data) => {
          if (data.length != 0) {
            res (data[0]['ActivityName'])
            x.unsubscribe()
          }
        });
      }else{
        res('')
      }
      
    })
  }

  getRound(number){
    return parseFloat(number).toFixed(2)
  }

  // getactivebookingDetails(){
  //   this.loading = this.loadingCtrl.create({
  //     content: 'Please wait...'
  //   });
  //   this.loading.present();
  //   this.paidMemberList = [];
  //   this.paidMemberListtemp = [];
  //   this.TotTrnsAmt = 0.0;
  //   this.TotTransc = 0;
  
  //   let startDate =  new Date(new Date(this.paymentObj.startDate).setHours(0, 0, 0)).getTime();
  //   let lasttDate = new Date(new Date(this.paymentObj.lasttDate).setHours(23, 59, 59)).getTime();

  //   let type=2
  //   this.http.get(`${this.nesturl}/courtbooking/bookingsummary?type=${type}&startDate=${startDate}&endDate=${lasttDate}&parentClubKey=${this.userData.UserInfo[0].ParentClubKey}`).subscribe((data) => {
  //     let activebooking = data['data'];
  //     this.loading.dismiss()
  //     let bookingperactivity = this.commonService.convertFbObjectToArray(activebooking)
  //     bookingperactivity.forEach(booking => {
  //       if(booking.allCourtSlots && booking.allCourtSlots.length > 0){
  //         booking.allCourtSlots.forEach(async slots => {
  //           slots['MemberName']  = slots['Member'].find(member => member.IsPrimaryMember)
  //           this.TotTrnsAmt += +slots.Price;
  //           slots['ActivityName'] = await this.getActivityName(slots.CourtInfo.ActivityKey, slots)
            
  //           let filteredclub = this.clubs.filter(club => club.$key == slots.CourtInfo.ClubKey)
  //           if(filteredclub.length > 0){
  //             slots['clubName'] = filteredclub[0].ClubShortName
  //           }
  //           this.paidMemberListtemp.push(slots)
  //           //console.log(this.getActivityName(slots.CourtInfo.ActivityKey, slots))
            
            
  //         });
  //         if(this.selectedClub.toLowerCase() != "all"){
  //           this.paidMemberListtemp = this.paidMemberListtemp.filter(data => data.CourtInfo.ClubKey == this.selectedClub)
  //           this.paidMemberListtemp.forEach(slots => {
  //             this.TotTrnsAmt += +slots.Price;
  //           })
  //         }
  //       }
  //     })

  //     this.TotTransc = this.paidMemberListtemp.length
  //   },(error)=>{
  //     this.loading.dismiss()
  //   })
  // }

  getactivebookingDetails(){
    this.commonService.showLoader('Please wait...')
    this.paidMemberList = [];
    this.paidMemberListtemp = [];
    this.TotTrnsAmt = 0.0;
    this.TotTransc = 0;
    let club = ''
    if (this.selectedClub.toLowerCase() == "all"){
      club = 'nil'
    }else{
      club = this.selectedClub
    }

    this.http.get(`${this.nestUrl}/courtbooking/activebookinginrange/${this.userData.UserInfo[0].ParentClubKey}/${club}/${this.paymentObj.startDate}/${this.paymentObj.lasttDate}`)
    .subscribe((data: any) => {
      
    
      this.paidMemberListtemp = data['data']
      this.commonService.hideLoader()
      this.paidMemberListtemp.forEach(slot => {
        this.TotTrnsAmt += +slot.price;
        slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
        slot.slot_end_time = moment(slot.slot_end_time,'HH:mm:ss').format('HH:mm')
        slot.booking_date = moment.utc(slot.booking_date).local().format('DD-MMM-YYYY')
      });
      this.TotTransc = this.paidMemberListtemp.length
    }, (err) => {
      
      this.commonService.hideLoader()
     
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
      this.getactivebookingDetails()
      //this.getActiveBookings();
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
