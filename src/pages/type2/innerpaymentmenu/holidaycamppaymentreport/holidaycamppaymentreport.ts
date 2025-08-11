
import { Listname } from './../../../Model/ImageSection';
import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform, PopoverController, Slides, Events } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
/**
 * Generated class for the HolidaycamppaymentreportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-holidaycamppaymentreport',
  templateUrl: 'holidaycamppaymentreport.html',
})
export class HolidaycamppaymentreportPage {
  @ViewChildren(Slides) slides: Slides;
  LangObj: any = {};//by vinod
  allHolidaycamp: any = [];
  allClubDetails: any = [];
  allPaidMember: any = [];
  parentClubKey: any = "";
  loading: any = "";
  selectedClubKey = "";
  selectedClubName: any = "";
  selectedClubType = "all";
  selectedCampName = "all";
  selectedCampKey = 'all';
  startDate:any;
  endDate:any;
  days = [7, 30, 60, 90, 120, 150, 180, 365];
  beforeDays: Number = 7;
  nestUrl:string;
  totalPaid: any = 0.0;
  totalPaidMemberLength = 0;
  currencyDetails: any = "";
  campObj = {ParentClubKey:"", VenueKey:"", MemberKey:"", Type:1, StartDate:0, EndDate:0 }
  constructor(public events: Events, public commonService: CommonService, public loadingCtrl: LoadingController, platform: Platform, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController, public navParams: NavParams, public storage: Storage,
    public http: HttpClient,) {
    this.nestUrl = this.sharedservice.getnestURL();
    let todaysDate = new Date();
    this.campObj.EndDate = new Date(todaysDate).getTime();
    let filterDate = todaysDate.setDate(todaysDate.getDate() - this.days[0]);
    this.campObj.StartDate = new Date(filterDate).getTime();
    this.startDate = moment((moment().subtract(15, 'days'))).format("YYYY-MM-DD");;
    this.endDate = moment().format("YYYY-MM-DD");
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
    // this.loading = this.loadingCtrl.create({
    //   content: 'Getting Parent Club Details...'
    // });
    //this.loading.present().then(() => {
      this.storage.get('Currency').then((val) => {
        this.currencyDetails = JSON.parse(val);
      }).catch(error => {
      });
      this.storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        for (let club of val.UserInfo) {
          if (val.$key != "") {
            this.parentClubKey = club.ParentClubKey;
            this.campObj.ParentClubKey = this.parentClubKey;
            this.getAllClub();
          }
        }
      })
     // this.loading.dismiss().catch(() => { });
    //});
  }

  ionViewDidLoad() {
    
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    });
  }

  getAllClub() {
    // this.loading = this.loadingCtrl.create({
    //   content: 'Getting  Club Details...'
    // });
    //this.loading.present().then(() => {
      this.fb.getAllWithQuery("Club/Type2/" + this.parentClubKey, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
        this.allClubDetails = data;
        this.selectedClubKey = 'all';
        this.campObj.VenueKey = "all";
        this.selectedClubName = 'All Venues';
        this.allHolidaycamp = [];
        this.getAllSessionDetails();
      //});
      //this.loading.dismiss().catch(() => { });
    });

  }
  // getAllSessionDetails() {
  //   this.allHolidaycamp = [];
  //   this.allPaidMember = [];
  //   this.totalPaid = 0
  //   this.totalPaidMemberLength = 0;
  //   for (let i = 0; i < this.allClubDetails.length; i++) {
  //     this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey, { orderByChild: 'ClubKey', equalTo: this.allClubDetails[i].$key }).subscribe((data) => {
  //       this.loading.dismiss().catch(() => { });
  //       let day = moment().subtract(Number(this.beforeDays), 'days');
  //       let dayInLong = new Date(day["_d"]).getTime();
  //       let calDay = moment();

  //       data.forEach((session) => {
  //         let sessionObj = new Session();
  //         sessionObj.name = session.CampName;
  //         sessionObj.vanueName = session.VenueName;
  //         sessionObj.sessionKey = session.$key;
  //         let totalActiveMember = 0;
  //         let totalSessionPaid = 0.00;
  //         if (session.Member != undefined) {
  //           if (session.Member.length == undefined) {
  //             session.Member = this.commonService.convertFbObjectToArray(session.Member);
  //           }
  //           session.Member.forEach((member) => {
  //             sessionObj.memberInfo.push(member);
  //             if (member.IsActive == true) {
  //               sessionObj.activeMember.push(member);
  //               totalActiveMember++;
  //               if (member.AmountPayStatus != 'Due') {
  //                 if (member.TransactionDate != undefined) {
  //                   let dates = member.TransactionDate.split("-");
  //                   if (dates.length == 3) {
  //                     member.TransactionDate = this.commonService.convertDatetoDDMMYYYYBySpliting(member.TransactionDate);
  //                   }
  //                 } else {
  //                   if (member.Transaction != undefined) {
  //                     member.Transaction = this.commonService.convertFbObjectToArray(member.Transaction);
  //                     let dates = member.Transaction[0].TransactionDate.split("-");
  //                     if (dates.length == 3) {
  //                       member["TransactionDate"] = this.commonService.convertDatetoDDMMYYYYBySpliting(member.Transaction[0].TransactionDate);
  //                     } else {
  //                       member["TransactionDate"] = member.Transaction[0].TransactionDate;
  //                     }
  //                   }
  //                 }
  //                 let dt = new Date(moment(member.TransactionDate).format()).getTime();
  //                 if (dt >= dayInLong) {
  //                   member["CampName"] = sessionObj.name;
  //                   member["CampKey"] = sessionObj.sessionKey;
  //                   if (member.TotalFeesAmount != undefined) {
  //                     member["Discount"] = member.TotalFeesAmount - member.AmountPaid;
  //                   } else {
  //                     member["Discount"] = 0;
  //                   }
  //                   member["VanueName"] = sessionObj.vanueName;
  //                   sessionObj.paidMember.push(member);
  //                   this.allPaidMember.push(member);
  //                   this.totalPaidMemberLength += 1;
  //                   totalSessionPaid = totalSessionPaid + parseFloat(member.AmountPaid);
  //                   this.totalPaid = this.totalPaid + parseFloat(member.AmountPaid);
  //                 }
  //               }
  //             } else {
  //               sessionObj.inActiveMember.push(member);
  //             }

  //           })
  //         }
  //         sessionObj.totalAmountpaid = totalSessionPaid;
  //         sessionObj.totalActiveMember = totalActiveMember;
  //         this.allHolidaycamp.push(sessionObj);
  //       });
  //       console.log(this.allHolidaycamp);
  //     });
  //   }
  // }
  // getSessionDetails() {
  //   this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey, { orderByChild: 'ClubKey', equalTo: this.selectedClubKey }).subscribe((data) => {
  //     this.loading = this.loadingCtrl.create({
  //       content: 'Please Wait...'
  //     });
  //     this.loading.present().then(() => {
  //       this.loading.dismiss().catch(() => { });
  //       this.allHolidaycamp = [];
  //       this.allPaidMember = [];
  //       let day = moment().subtract(Number(this.beforeDays), 'days');
  //       let dayInLong = new Date(day["_d"]).getTime();
  //       let calDay = moment();
  //       this.totalPaid = 0
  //       this.totalPaidMemberLength = 0;
  //       data.forEach((session) => {
  //         let sessionObj = new Session();
  //         sessionObj.name = session.CampName;
  //         sessionObj.vanueName = session.VenueName;
  //         sessionObj.sessionKey = session.$key;
  //         let totalActiveMember = 0;
  //         let totalSessionPaid = 0.00;
  //         if (session.Member != undefined) {
  //           if (session.Member.length == undefined) {
  //             session.Member = this.commonService.convertFbObjectToArray(session.Member);
  //           }
  //           session.Member.forEach((member) => {
  //             sessionObj.memberInfo.push(member);
  //             if (member.IsActive == true) {
  //               sessionObj.activeMember.push(member);
  //               totalActiveMember++;
  //               if (member.AmountPayStatus != 'Due') {
  //                 if (member.TransactionDate != undefined) {
  //                   let dates = member.TransactionDate.split("-");
  //                   if (dates.length == 3) {
  //                     member.TransactionDate = this.commonService.convertDatetoDDMMYYYYBySpliting(member.TransactionDate);
  //                   }
  //                 } else {
  //                   if (member.Transaction != undefined) {
  //                     member.Transaction = this.commonService.convertFbObjectToArray(member.Transaction);
  //                     let dates = member.Transaction[0].TransactionDate.split("-");
  //                     if (dates.length == 3) {
  //                       member["TransactionDate"] = this.commonService.convertDatetoDDMMYYYYBySpliting(member.Transaction[0].TransactionDate);
  //                     } else {
  //                       member["TransactionDate"] = member.Transaction[0].TransactionDate;
  //                     }
  //                   }
  //                 }
  //                 let dt = new Date(moment(member.TransactionDate).format()).getTime();
  //                 if (dt >= dayInLong) {
  //                   member["CampName"] = sessionObj.name;
  //                   member["CampKey"] = sessionObj.sessionKey;
  //                   if (member.TotalFeesAmount != undefined) {
  //                     member["Discount"] = member.TotalFeesAmount - member.AmountPaid;
  //                   } else {
  //                     member["Discount"] = 0;
  //                   }

  //                   member["VanueName"] = sessionObj.vanueName;
  //                   sessionObj.paidMember.push(member);
  //                   this.allPaidMember.push(member);
  //                   this.totalPaidMemberLength += 1;
  //                   totalSessionPaid = totalSessionPaid + parseFloat(member.AmountPaid);
  //                   this.totalPaid = this.totalPaid + parseFloat(member.AmountPaid);
  //                 }
  //               }
  //             } else {
  //               sessionObj.inActiveMember.push(member);
  //             }

  //           })
  //         }
  //         sessionObj.totalAmountpaid = totalSessionPaid;
  //         sessionObj.totalActiveMember = totalActiveMember;
  //         this.allHolidaycamp.push(sessionObj);
  //       });
  //     });
  //     console.log();
  //   });
  // }

  getAllSessionDetails(){
    //this.nestUrl = "http://localhost:3000"
    this.commonService.showLoader("Please wait");
    this.http.get(`${this.nestUrl}/HolidayCamp/getpaymentreport?parentClubKey=${this.campObj.ParentClubKey}&venueKey=${this.campObj.VenueKey}&memberKey=${this.campObj.MemberKey}&type=${this.campObj.Type}&startDate=${this.campObj.StartDate}&endDate=${this.campObj.EndDate}`).subscribe((res:any) => {
      console.log(res);
      this.commonService.hideLoader();
      this.allPaidMember = res.data.paidMembers;
      this.totalPaidMemberLength = res.data.transactionCount;
      this.totalPaid = res.data.totalPaidAmount;
      // sessionObj.totalAmountpaid = totalSessionPaid;
      // sessionObj.totalActiveMember = totalActiveMember;
    }, (err) => {
      this.commonService.hideLoader();
      console.log("err", err);
      this.commonService.toastMessage("There is some problem, Please try again",2500,ToastMessageType.Error);
    });
  }
  

  changeClub(key, name) {
    console.log(this.slides);
    this.selectedClubKey = key;
    this.selectedClubName = name;
    if (key == 'all') {
      this.campObj.VenueKey = "all";
      this.getAllSessionDetails();
    } else {
      // this.loading = this.loadingCtrl.create({
      //   content: 'Getting  Club Details...'
      // });
      // this.loading.present().then(() => {
      //   
      //   this.getAllSessionDetails();
      // });
      // this.loading.dismiss().catch(() => { });
      this.campObj.VenueKey = key;
      this.getAllSessionDetails();
    }
  }
  chageDate(day) {
    this.beforeDays = day;
    // if (this.selectedClubKey == 'all') {
    //   this.getAllSessionDetails();
    // } else {
    //   this.loading = this.loadingCtrl.create({
    //     content: 'Getting  Club Details...'
    //   });
    //   this.loading.present().then(() => {
    //     this.getSessionDetails();
    //   });
    //   this.loading.dismiss().catch(() => { });
    // }
    if(day!= 'dates'){
      let todaysDate = new Date();
      this.campObj.EndDate = new Date(todaysDate).getTime();
      let filterDate = todaysDate.setDate(todaysDate.getDate() - day);
      this.campObj.StartDate = new Date(filterDate).getTime();
      this.getAllSessionDetails();
    }
    
  }

  Search(){
    this.campObj.EndDate = new Date(this.endDate).getTime();
    this.campObj.StartDate = new Date(this.startDate).getTime();
    this.getAllSessionDetails();
  }

  getDay(dt) {
    return moment(dt).format('DD-MM-YYYY');
  }
  checkDiscount(bal) {
    if (bal != 0) {
      return true;
    } else {
      return false;
    }
  }
  getTotal(val: any) {
    return Number(val).toFixed(2);
  }
  goToDetailsPage(memberInfo) {
    this.navCtrl.push('HolidaycampaymentsdetailsPage', {
      info: memberInfo
    })
  }

  gotoPrint() {
    this.navCtrl.push("CampReportPrint", {
      memberList: this.allPaidMember,
      reportType: "paid",
      parentclubKey: this.parentClubKey
    });
  }


}
class Session {
  sessionKey: string;
  name: string;
  totalAmountpaid: number;
  memberInfo: any = [];
  totalActiveMember: Number = 0;
  activeMember: any = [];
  inActiveMember: any = [];
  paidMember: any = [];
  vanueName: string;
}

// this.loading = this.loadingCtrl.create({
//   content: 'Getting  Club Details...'
// });
// this.loading.present().then(() => {
//  });
//   this.loading.dismiss().catch(() => { });
// });