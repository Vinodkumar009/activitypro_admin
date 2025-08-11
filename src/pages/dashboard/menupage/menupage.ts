import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, IonicPage, MenuController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
//import { PopoverPage } from ./popover';
import * as moment from 'moment';
// import { Setup } from './setup';
import { Slides } from 'ionic-angular';
import { ViewChild } from '@angular/core';


@IonicPage()
@Component({
  selector: 'menupage-page',
  templateUrl: 'menupage.html'
})

export class MenupagePage {
  @ViewChild(Slides) slides: Slides;
  LangObj:any = {};//by vinod
  themeType: number;

  menus = [];
  submenus = [];
  unreadNotificationCounts = 0;


  parentClubKey = "";
  holidayCampList = [];
  currencyDetails: any;
  activeHolidayCampMember = 0;

  schoolSessionList = [];
  activeSchoolSessionMember = 0;


  currentFinancialYear = "";
  // it carries the sessions which are active in the current financial year
  sessionList = [];
  //it carries only active session list
  activeSessionList = [];
  activeSessionMember = 0;
  //active due member
  dueMember = 0;

  //weekly hours
  weeklyHours = 0;
  isThisCoach = false;

  //Amount related variables for financial year

  totalRevenueforCurrentFinancialYear = 0;
  totalPaidForCurrentFinancialYear = 0;
  totalDueForCurrentFinancialYear = 0;

  totalRev = "0.00";
  totalPaid = "0.00";
  totalDue = "0.00";

  totalRevenuePercentage = 0;
  subtitleTotalRevenue = "";

  coachKey = "";

  allClubDetails = [];






  //active sessions for all the financial year
  allActivesessionweeklyHours = 0;
  allActivesessionLisAcrossTheFinancialYear = [];
  activeSessionMemberForAllSession = 0;
  dueMemberForAllSession = 0;
  totalRevenueforAllActiveSession = 0;
  totalPaidForAllActiveSession = 0;
  totalDueForAllActiveSession = 0;
  subtitleTotalRevenueForAllActiveSession = "";
  totalRevenuePercentageForAllActiveSession = 0;
  totalRevForAllSession = "0";










  nodeURl :string;
  userObj: any = {};
  parentClubInfo = {};
  selectedClubKey: any;
  ActiveSetups: any;
  daysLeftforMembership: any;
  schooldetails: any;
  allholidaycampdetails: any;
  constructor(public events: Events,public commonService: CommonService, public storage: Storage, public menuCtrl: MenuController, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController, public fb: FirebaseService) {
    this.storage.get('userObj').then(async (val) => {
      this.userObj = JSON.parse(val);
      console.log(this.userObj)
      this.themeType = sharedservice.getThemeType();
    });
   

  }
  // getRevinueShowValue() {
  //   if (this.userObj.RoleType == 5 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }
 
  getCurrencyDetials() {
    const curency$Obs = this.fb.getAllWithQuery("/Currency/Type2/" + this.parentClubKey, { orderByKey: true }).subscribe((data) => {
      curency$Obs.unsubscribe();
      this.currencyDetails = data[0];
      this.storage.set('Currency', JSON.stringify(data[0]));
    });
  }
  // ionViewWillEnter() {
  //   //this.slides.initialSlide=0;
  //   this.slides.slideTo(1, 500);
  // }
  ionViewDidEnter() {
    //  this.slides.slideTo(, 500);
    this.menus = [];
    this.submenus = []
    let x = [];
    x = this.sharedservice.getMenuList();
    for (let i = 0; i < x.length; i++) {
      //if (x[i].Level == 1 && x[i].IsEnable) { vinod commented after menus api done -->
      if (x[i].Level == 1) {
        this.menus.push(x[i]);
      }
    }
  }
  goTo(obj) {
    if (obj.MobComponent != "Setup") {
      // if(obj.MobComponent === "Type2HolidayCamp"){
      //   this.commonService.updateCategory('holidaycamp');
      // }
      
      if(obj.MobComponent === "Type2SchoolSessionList" || obj.MobComponent === "CoachSchoolSessionList"){
        obj.MobComponent = "Type2SchoolSessionList"
        this.commonService.updateCategory('update_scl_session_list'); 
      }
      // else if(obj.MobComponent == 'EventsPage'){
      //   this.commonService.alertWithText("","We are upgrading. This is not available now. Sorry for the inconvenience","Ok")
      //   return false;
      // }
      else if(obj.MobComponent === "Type2ManageSession" || obj.MobComponent === "CoachManageSession"){
        obj.MobComponent = "Type2ManageSession"
        this.commonService.updateCategory('update_session_list')
      }
      else if(obj.MobComponent === "Type2HolidayCamp"){
        this.commonService.updateCategory('update_camps_list') ;
      }
      else if(obj.MobComponent === "Type2Member" || obj.MobComponent === "CoachMember"){
        obj.MobComponent = "Type2Member";
      }
      else if(obj.MobComponent === "EventsandnewsPage"){
        this.commonService.updateCategory('refresh_news')
      }
      else if(obj.MobComponent === "VideomenueslistingPage"){
        this.commonService.updateCategory('refresh_videos')
      }
      // else if(obj.MobComponent === "EventsPage" || obj.MobComponent === "MembershipRecord"){
      //   const alert_msg = "We are upgrading our platform. This module is temporarily unavailable. We apologise for the inconvenience."
      //   this.commonService.alertWithText("Info",alert_msg,"OK");
      //   return false;
      // }
      this.navCtrl.push(obj.MobComponent);
    } else {
      this.navCtrl.push("Setup");
    }
  }
 //added by vinod
 ionViewDidLoad() {
  this.getLanguage();
  this.events.subscribe('language', (res) => {
    this.getLanguage();
  });
}
getLanguage(){
  this.storage.get("language").then((res)=>{
    console.log(res["data"]);
    this.LangObj = res.data;
  })
}
//returning label
getLabel(label:string){
 return this.LangObj[label];
}
//added by vinod ends here
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }



  // ionViewDidLoad() {
  //   this.themeType = this.sharedservice.getThemeType();

  //   this.menuCtrl.swipeEnable(true);

  //   this.storage.get('userObj').then((val) => {
  //     val = JSON.parse(val);

  //     if (val.$key != "") {
  //       this.parentClubKey = val.UserInfo[0].ParentClubKey;

  //       this.sharedservice.setParentclubKey(this.parentClubKey);

  //       // this.parentClubName = val.Name;
  //       // this.parentClubEmail = val.EmailID;
  //       this.getFinancialYearList();
  //       this.getCurrencyDetials();
       
  //       if (val.RoleType == "4" && val.UserType == "2") {
  //         this.isThisCoach = true;
  //         this.coachKey = val.UserInfo[0].CoachKey;
  //         this.getActiveHolidayCamp();
  //         this.getActiveSchoolSessionForCoach();
  //         this.getCurrentYearRevenueForCoach();
  //       } else {
  //         this.getUnreadNotifcations();
  //         this.getActiveHolidayCamp();
  //         this.getActiveSchoolSession();
  //         this.getCurrentYearRevenue();
  //       }
       
  //     }
  //   })
  // }

  // goToNotification() {
  //   this.navCtrl.push("Type2notification");
  // }


//   getUnreadNotifcations() {
//     this.fb.getAllWithQuery("/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", { orderByChild: "Status", equalTo: "Unread" }).subscribe((data) => {
//       this.unreadNotificationCounts = 0;
//       this.unreadNotificationCounts = data.length;
//       //x.unsubscribe();
//     });
//   }

//   //----------------------------------
//   //  Get Active shoolsession details
//   //--------------------------
//   getActiveSchoolSession() {
//     this.fb.getAllWithQuery("SchoolSession/" + this.parentClubKey + "/", { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
//       this.schoolSessionList = [];
//       for (let i = 0; i < data.length; i++) {
//         let mm = ((new Date(this.commonService.getTodaysDate()).getMonth()) + 1);
//         let month = mm < 10 ? "0" + mm : mm.toString();
//         let todayDate = (new Date(this.commonService.getTodaysDate()).getFullYear()) + "-" + month + "-" + (new Date(this.commonService.getTodaysDate()).getDate());
//         if (((new Date(data[i].EndDate).getTime()) >= (new Date(todayDate).getTime())) && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
//           this.schoolSessionList.push(data[i]);
//         }
//       }
//       this.schoolSessionActiveMemberCount(this.schoolSessionList);
//     });
//   }
//   //---------------------------------------------
//   //  Get Active member enrolled in shoolsession
//   //--------------------------
//   schoolSessionActiveMemberCount(data) {
//     for (let i = 0; i < data.length; i++) {
//       if (this.schoolSessionList[i]["Member"] != undefined) {
//         let memberLength = this.commonService.convertFbObjectToArray(this.schoolSessionList[i]["Member"]);
//         for (let j = 0; j < memberLength.length; j++) {
//           if (memberLength[j].IsActive) {
//             this.activeSchoolSessionMember++;
//           }
//         }
//       }
//     }
//   }

//   //----------------------------------
//   //  Get Active HolidayCamp details
//   //--------------------------
//   getActiveHolidayCamp() {
//     this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
//       this.holidayCampList = [];
//       for (let i = 0; i < data.length; i++) {
//         let mm = ((new Date(this.commonService.getTodaysDate()).getMonth()) + 1);
//         let month = mm < 10 ? "0" + mm : mm.toString();
//         let todayDate = this.commonService.getTodaysDate();
//         if (((new Date(data[i].EndDate).getTime()) >= (new Date(todayDate).getTime())) && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
//           this.holidayCampList.push(data[i]);
//         }
//       }
//       this.holidayCampActiveMemberCount(this.holidayCampList);
//     });
//   }
//   //---------------------------------------------
//   //  Get Active member enrolled in HolidayCamp
//   //-------------------------------
//   holidayCampActiveMemberCount(data) {


//     for (let i = 0; i < data.length; i++) {
//       //let ActiveMember = 0;
//       if (this.holidayCampList[i]["Member"] != undefined) {
//         let memberLength = this.commonService.convertFbObjectToArray(this.holidayCampList[i]["Member"]);
//         for (let j = 0; j < memberLength.length; j++) {
//           if (memberLength[j].IsActive) {
//             this.activeHolidayCampMember++;
//           }
//         }
//         // this.holidayCampList[i]["ActiveMemberStrength"] = ActiveMember;
//       }
//     }
//   }

//   // get financial year for term
//   getFinancialYearList() {

//     this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {
//       let financialYears = data;
//       if (financialYears.length != 0) {
//         let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//         let currentYear = new Date().getFullYear();
//         let currentMonth = new Date().getMonth();
//         let isDone = false;
//         for (let i = 0; i < financialYears.length; i++) {
//           if ((financialYears[i].StartYear == financialYears[i].EndYear) && (parseInt(financialYears[i].EndYear) == currentYear) && (currentMonth <= monthArray.indexOf(financialYears[i].EndMonth))) {
//             isDone = true;
//             this.currentFinancialYear = financialYears[i].$key;
//             break;
//           }
//         }
//         if (!isDone) {
//           for (let financialYearIndex = 0; financialYearIndex < financialYears.length; financialYearIndex++) {
//             let currentYear = new Date().getFullYear();
//             let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//             let endMonthIndex = monthArray.indexOf(financialYears[financialYearIndex].EndMonth);
//             let startMonthIndex = monthArray.indexOf(financialYears[financialYearIndex].StartMonth);
//             let condition1 = (parseInt(financialYears[financialYearIndex].StartYear) <= currentYear);
//             let condition2 = (parseInt(financialYears[financialYearIndex].EndYear) >= currentYear);
//             let condition3 = false;
//             if (parseInt(financialYears[financialYearIndex].StartYear) == currentYear) {
//               condition3 = (startMonthIndex <= new Date().getMonth());
//             } else {
//               condition3 = (endMonthIndex >= new Date().getMonth());
//             }
//             if (condition1 && condition2 && condition3) {
//               this.currentFinancialYear = financialYears[financialYearIndex].$key;
//               break;
//             }
//           }
//         }

//       }
//     });


//   }




//   //---------------------------------------------
//   //  Get data of session and find the active session and active member
//   //  current financial year revenue and session going on how many hour per week
//   //  1. Session revenue
//   //-------------------------------

//   getCurrentYearRevenue() {
//     this.fb.getAllWithQuery("Session/" + this.parentClubKey + "/", { orderByKey: 'true' }).subscribe((data) => {
//       this.sessionList = [];
//       this.activeSessionList = [];
//       this.weeklyHours = 0;
//       this.activeSessionMemberForAllSession = 0;
//       this.allActivesessionweeklyHours = 0;
//       this.allActivesessionLisAcrossTheFinancialYear = [];
//       this.totalRevenueforCurrentFinancialYear = this.totalRevenueforAllActiveSession = 0;
//       this.activeSessionMember = 0;
//       this.dueMember = this.dueMemberForAllSession = 0;
//       this.totalPaidForAllActiveSession = this.totalPaidForCurrentFinancialYear = 0;






//       for (let i = 0; i < data.length; i++) {
//         let coachSessions = [];
//         coachSessions = this.commonService.convertFbObjectToArray(data[i]);
//         let groupSessions = [];
//         for (let j = 0; j < coachSessions.length; j++) {
//           groupSessions = this.commonService.convertFbObjectToArray(coachSessions[j].Group);

//           for (let k = 0; k < groupSessions.length; k++) {
//             if (groupSessions[k].IsActive && groupSessions[k].IsEnable != false && groupSessions[k].IsEnable != false && groupSessions[k].FinancialYearKey === this.currentFinancialYear) {
//               this.activeSessionList.push(groupSessions[k]);
//               if (((new Date(groupSessions[k].EndDate).getTime()) > (new Date(this.commonService.getTodaysDate()).getTime()))) {
//                 this.sessionList.push(groupSessions[k])
//               }

//             }

//             //all active session for all the financial year

//             if (groupSessions[k].IsActive && groupSessions[k].IsEnable != false && ((new Date(groupSessions[k].EndDate).getTime()) > (new Date(this.commonService.getTodaysDate()).getTime()))) {
//               this.allActivesessionLisAcrossTheFinancialYear.push(groupSessions[k])
//             }

//           }
//         }

//       }
//       this.sessionActiveMemberDetails();

//     });
//   }



//   //---------------------------------------------
//   //  Get Active member enrolled in Session
//   //-------------------------------
//   sessionActiveMemberDetails() {


//     for (let i = 0; i < this.sessionList.length; i++) {
//       //let ActiveMember = 0;

//       let days = this.sessionList[i].Days.split(",");
//       this.weeklyHours += (days.length * parseInt(this.sessionList[i].Duration));
//       // this.weeklyHours = parseFloat(this.weeklyHours.toFixed(2));


//       if (this.sessionList[i]["Member"] != undefined) {
//         let memberLength = this.commonService.convertFbObjectToArray(this.sessionList[i]["Member"]);
//         for (let j = 0; j < memberLength.length; j++) {
//           if (memberLength[j].IsActive) {
//             this.activeSessionMember++;
//             if (memberLength[j].AmountPayStatus === "Due") {
//               this.dueMember++;
//             }

//           }
//         }
//         // this.holidayCampList[i]["ActiveMemberStrength"] = ActiveMember;
//       }
//     }

//     this.weeklyHours = this.weeklyHours / 60;

//     this.weeklyHours = parseFloat(this.weeklyHours.toFixed(2));









//     //<summary>
//     // 
//     //    for all active session including all financial year
//     //
//     //</summary>


//     for (let i = 0; i < this.allActivesessionLisAcrossTheFinancialYear.length; i++) {

//       let days = this.allActivesessionLisAcrossTheFinancialYear[i].Days.split(",");
//       this.allActivesessionweeklyHours += (days.length * parseInt(this.allActivesessionLisAcrossTheFinancialYear[i].Duration));

//       if (this.allActivesessionLisAcrossTheFinancialYear[i]["Member"] != undefined) {
//         let memberLengthOfActiveSessionList = this.commonService.convertFbObjectToArray(this.allActivesessionLisAcrossTheFinancialYear[i]["Member"]);
//         for (let j = 0; j < memberLengthOfActiveSessionList.length; j++) {
//           if (memberLengthOfActiveSessionList[j].IsActive) {
//             this.activeSessionMemberForAllSession++;
//             if (memberLengthOfActiveSessionList[j].AmountPayStatus === "Due") {
//               this.dueMemberForAllSession++;
//             }

//           }
//         }
//       }
//     }

//     this.allActivesessionweeklyHours = this.allActivesessionweeklyHours / 60;
//     this.allActivesessionweeklyHours = parseFloat(this.allActivesessionweeklyHours.toFixed(2));





//     //revenue calculation for entire financial year 
//     for (let i = 0; i < this.allActivesessionLisAcrossTheFinancialYear.length; i++) {

//       let days = this.allActivesessionLisAcrossTheFinancialYear[i].Days.split(",");

//       if (this.allActivesessionLisAcrossTheFinancialYear[i]["Member"] != undefined) {
//         let memberLength = this.commonService.convertFbObjectToArray(this.allActivesessionLisAcrossTheFinancialYear[i]["Member"]);
//         for (let j = 0; j < memberLength.length; j++) {
//           if (memberLength[j].IsActive) {
//             if (!(isNaN(parseFloat(memberLength[j].TotalFeesAmount) + this.totalRevenueforAllActiveSession))) {
//               this.totalRevenueforAllActiveSession += parseFloat(memberLength[j].TotalFeesAmount);
//             }
//             if (memberLength[j].AmountPayStatus === "Due" && !(isNaN(this.totalDueForAllActiveSession + (parseFloat(memberLength[j].AmountDue))))) {
//               this.totalDueForAllActiveSession += parseFloat(memberLength[j].AmountDue);
              
//             } else if (memberLength[j].AmountPayStatus != "Due" && !(isNaN(this.totalPaidForAllActiveSession + (parseFloat(memberLength[j].TotalFeesAmount))))) {
//               this.totalPaidForAllActiveSession += parseFloat(memberLength[j].AmountPaid);
//             }
//           }
//         }
//       }
//       this.totalRevForAllSession = this.totalRevenueforAllActiveSession.toFixed(2);
//       // this.totalRevForAllSession = this.totalRevenueforCurrentFinancialYear.toFixed(2);
//       this.totalRevenuePercentageForAllActiveSession = (this.totalPaidForAllActiveSession / this.totalRevenueforAllActiveSession) * 100;
//       if (this.currencyDetails != undefined || this.currencyDetails.CurrencySymbol != undefined) {
//         this.subtitleTotalRevenueForAllActiveSession = this.currencyDetails.CurrencySymbol + "" + this.totalPaidForAllActiveSession.toFixed(2) + " Paid";
//       } else {
//         this.subtitleTotalRevenueForAllActiveSession = this.totalPaidForAllActiveSession.toFixed(2) + " Paid";
//       }
//     }

//     //------------------------------------------------------------------------------------
//     //----------------------------------- end here  --------------------------------------
//     //------------------------------------------------------------------------------------






//     //revenue calculation for entire current financial year 
//     for (let i = 0; i < this.activeSessionList.length; i++) {
//       //let ActiveMember = 0;

//       let days = this.activeSessionList[i].Days.split(",");
//       //this.weeklyHours +=(days.length*parseInt(this.activeSessionList[i].Duration));



//       if (this.activeSessionList[i]["Member"] != undefined) {
//         let memberLength = this.commonService.convertFbObjectToArray(this.activeSessionList[i]["Member"]);
//         for (let j = 0; j < memberLength.length; j++) {
//           if (memberLength[j].IsActive) {
//             if (!(isNaN(parseFloat(memberLength[j].TotalFeesAmount) + this.totalRevenueforCurrentFinancialYear))) {
//               this.totalRevenueforCurrentFinancialYear += parseFloat(memberLength[j].TotalFeesAmount);
//             }
//             if (memberLength[j].AmountPayStatus === "Due" && !(isNaN(this.totalDueForCurrentFinancialYear + (parseFloat(memberLength[j].AmountDue))))) {
//               this.totalDueForCurrentFinancialYear += parseFloat(memberLength[j].AmountDue);
//             } else if (memberLength[j].AmountPayStatus != "Due" && !(isNaN(this.totalPaidForCurrentFinancialYear + (parseFloat(memberLength[j].TotalFeesAmount))))) {
//               this.totalPaidForCurrentFinancialYear += parseFloat(memberLength[j].AmountPaid);
//             }
// // console.log(memberLength[j])
//           }
//         }

//       }

//       this.totalRev = this.totalRevenueforCurrentFinancialYear.toFixed(2);
//       this.totalRevenuePercentage = (this.totalPaidForCurrentFinancialYear / this.totalRevenueforCurrentFinancialYear) * 100;
//       if (this.currencyDetails != undefined || this.currencyDetails.CurrencySymbol != undefined) {
//         this.subtitleTotalRevenue = this.currencyDetails.CurrencySymbol + "" + this.totalPaidForCurrentFinancialYear.toFixed(2) + " Paid";
//       } else {
//         this.subtitleTotalRevenue = this.totalPaidForCurrentFinancialYear.toFixed(2) + " Paid";
//       }
//     }
//     // this.activeSessionList
//   }


//   // report block click



//   goToHolidayCamp() {
//     this.navCtrl.push("Type2HolidayCamp");
//   }


//   goToSchoolSesion() {
//     if (this.isThisCoach) {
//       this.navCtrl.push("CoachSchoolSessionList");
//     } else {
//       this.navCtrl.push("Type2SchoolSessionList");
//     }
//   }
//   goToMember() {
//     this.navCtrl.push("Type2Member");
//   }
//   goToSesion() {
//     if (this.isThisCoach) {
//       this.navCtrl.push("CoachManageSession");
//     } else {
//       this.navCtrl.push("Type2ManageSession");
//     }
//   }
 
//   async getClubdetailsAPIcall(){
//    let arr = []
//    return new Promise<any>((res, rej) =>{
//     $.ajax({
//       url: this.nodeURl + "/session/history",
//       data: {
//         parentCLubKey: "-Kd2fSCGOw6K3mvzu-yH"
//       },
//       type: "POST",
//       success: function (response) {
       
//        arr=response
//         console.log(arr)
//         console.log(response)
//        res(arr)

        
//       }, error: function (error, xhr) {
       

//       }
//     });
//    })
    
//   }

//   async getSchooldetailsAPIcall(){
//     let arr = []
//     return new Promise<any>((res, rej) =>{
//      $.ajax({
//        url: this.nodeURl +"/schoolsession/history",
//        data: {
//          parentCLubKey: "-Kd2fSCGOw6K3mvzu-yH",
//          filterType:"present"
//        },
//        type: "POST",
//        success: function (response) {
        
//         arr=response
//          console.log(arr)
//          console.log(response)
//         res(arr)
 
         
//        }, error: function (error, xhr) {
        
 
//        }
//      });
//     })
     
//    }
//    async getHolidayCampdetailsAPIcall(){
//     let arr = []
//     return new Promise<any>((res, rej) =>{
//      $.ajax({
//        url: this.nodeURl +"/holidaycamp/history",
//        data: {
//          parentCLubKey: "-Kd2fSCGOw6K3mvzu-yH",
//          filterType:"present"
//        },
//        type: "POST",
//        success: function (response) {
        
//         arr=response
//          console.log(arr)
//          console.log(response)
//         res(arr)
 
         
//        }, error: function (error, xhr) {
        
 
//        }
//      });
//     })
     
//    }

//   //----------------------------------
//   //  Get Active shoolsession details for coach
//   //--------------------------
//   getActiveSchoolSessionForCoach() {
   
//     this.fb.getAllWithQuery("SchoolSession/" + this.parentClubKey + "/", { orderByChild: "CoachKey", equalTo: this.coachKey }).subscribe((data) => {
//       this.schoolSessionList = [];
//       for (let i = 0; i < data.length; i++) {
//         if (data[i].IsActive) {
//           let mm = ((new Date(this.commonService.getTodaysDate()).getMonth()) + 1);
//           let month = mm < 10 ? "0" + mm : mm.toString();
//           let todayDate = (new Date(this.commonService.getTodaysDate()).getFullYear()) + "-" + month + "-" + (new Date(this.commonService.getTodaysDate()).getDate());
//           if (((new Date(data[i].EndDate).getTime()) >= (new Date(todayDate).getTime())) && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
//             this.schoolSessionList.push(data[i]);
//           }
//         }
//       }
//       this.schoolSessionActiveMemberCount(this.schoolSessionList);
//     });
//   }


//   getCurrentYearRevenueForCoach() {
//     this.fb.getAllWithQuery("Coach/Type2/" + this.parentClubKey + "/" + this.coachKey + "/Session/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
//       // this.sessionList = [];
//       this.activeSessionList = [];
//       for (let i = 0; i < data.length; i++) {
//         if (data[i].FinancialYearKey == this.currentFinancialYear && data[i].IsActive && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
//           //total financialyear sesisons
//           this.activeSessionList.push(data[i]);
//           //Active sessions
//           if (((new Date(data[i].EndDate).getTime()) > (new Date(this.commonService.getTodaysDate()).getTime()))) {
//             this.sessionList.push(data[i]);
//           }
//         }

//       }
//       this.sessionActiveMemberDetails();
//     });
//   }


//   getParentClubImage() {
//     this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.userObj.UserInfo[0].ParentClubKey }).subscribe((data) => {
//       this.parentClubInfo = data[0];
//     })
//   }
  goToDashboardMenuPage(){
    this.navCtrl.setRoot('Dashboard');
  }
  // ionViewWillLeave(){
  //   this.commonService.updateCategory("");
  // }
}
