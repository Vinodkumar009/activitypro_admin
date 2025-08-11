import { Listname } from './../../../Model/ImageSection';

import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform, PopoverController, Slides, Events } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { CommonService , ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { forEach } from '@firebase/util/dist/esm/src/obj';
/**
 * Generated class for the SchoolpaymentreportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schoolpaymentreport',
  templateUrl: 'schoolpaymentreport.html',
})
export class SchoolpaymentreportPage {
  @ViewChildren(Slides) slides: Slides;
  allSchoolDetails:any = [];
  selectedSchoolSessionDetails = []; 
  parentClubKey:any = "";
  selectedSchool:any = "";
  beforeDays:Number = 7;
  calculatedDay:any;
  days = [7,30,60,90,120,150,180,365];
  totalPaid:any = 0.0;
  selectedSchoolName:any = "";
  schoolMap:Map<string,any> = new Map<string,any>();
  totalPaidMemberLength = 0;
  currencyDetails:any = "";
  userData:any = {};
  LangObj:any = {};//by vinod
  nestUrl:string;
  paidMember:Array<any> = [];
  startDate:any;
  endDate:any;
  schoolObj = {ParentClubKey:"", VenueKey:"", MemberKey:"", Type:1, StartDate:0, EndDate:0 }
  constructor(public events: Events, public sharedService:SharedServices,public commonService:CommonService,public loadingCtrl: LoadingController, platform: Platform, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,public navParams:NavParams,public storage:Storage, 
    public http: HttpClient,) {
    this.userData = this.sharedService.getUserData();
    this.schoolObj.ParentClubKey = this.userData.UserInfo[0].ParentClubKey;
    this.nestUrl = this.sharedservice.getnestURL();
    let todaysDate = new Date();
    this.schoolObj.EndDate = new Date(todaysDate).getTime();
    let filterDate = todaysDate.setDate(todaysDate.getDate() - this.days[0]);
    this.schoolObj.StartDate = new Date(filterDate).getTime();
    this.startDate = moment((moment().subtract(15, 'days'))).format("YYYY-MM-DD");;
    this.endDate = moment().format("YYYY-MM-DD");
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
    
    this.getAllSchoolDetails();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SchoolpaymentreportPage');
  // this.parentClubKey = this.navParams.get('parentClubKey');
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
    this.getLanguage(); 
  }

getLanguage(){
    this.storage.get("language").then((res)=>{
      console.log(res["data"]);
     this.LangObj = res.data;
    })
}
  getAllSchoolDetails(){
    this.fb.getAllWithQuery('School/Type2/'+this.schoolObj.ParentClubKey,{orderByChild:'IsActive',equalTo:true}).subscribe((data) =>{
      this.allSchoolDetails = [];
      data.forEach((element) =>{
        this.allSchoolDetails.push(element);
      });
      this.selectedSchool = 'all';
      this.selectedSchoolName = 'All Schools';
      this.schoolObj.VenueKey = 'all';
      this.getAllDetails();
    });
  }
  changeDay(){
    

  }
  // getAllDetails(){
  //   this.selectedSchoolSessionDetails = [];
  //   this.totalPaid = 0.00;
  //   this.totalPaidMemberLength = 0;
  //   this.allSchoolDetails.forEach(element => {
  //     this.fb.getAllWithQuery("SchoolSession/"+this.parentClubKey,{orderByChild:'SchoolKey',equalTo:element.$key}).subscribe((data) =>{
  //       let day = moment().subtract(Number(this.beforeDays), 'days').format();
  //       let dayInLong = new Date(day).getTime();
  //       let calDay = moment();
  //       data.forEach((session) =>{
  //         let sessionObj = new Session();
  //         sessionObj.name = session.SessionName;
  //         sessionObj.sessionFee = session.SessionFee;
  //         let totalActiveMember =  0;
  //         let totalSessionDue = 0.00;
  //         let totalSessionPaid = 0.00;
  //         if(session.Member != undefined){
  //           if(session.Member.length == undefined){
  //             session.Member = this.commonService.convertFbObjectToArray(session.Member);
  //           }
  //           session.Member.forEach((member) =>{
  
  //             sessionObj.memberInfo.push(member);
  //             if(member.IsActive == true){
  //               sessionObj.activeMember.push(member);
  //               totalActiveMember++;
  //               if(member.AmountPayStatus == 'Due'){
  //                 sessionObj.dueMember.push(member);
  //                 totalSessionDue = totalSessionDue + parseFloat(member.AmountDue);
                  
  //               }else{
  //                let dates = member.TransactionDate.split("-");
  //                 if(dates.length==3){
  //                   member.TransactionDate  = this.commonService.convertDatetoDDMMYYYYBySpliting(member.TransactionDate);
  //                 }
  //                let dt = new Date(member.TransactionDate).getTime();
  //                 if(dt >= dayInLong){
  //                   if(member.FirstName == 'Luca'){
  //                     console.log('luca arrived');
  //                   }
  //                   sessionObj.paidMember.push(member);
  //                   this.totalPaidMemberLength += 1;
  //                   totalSessionPaid = totalSessionPaid + parseFloat(member.AmountPaid);
  //                   this.totalPaid = parseFloat(this.totalPaid) + parseFloat(member.AmountPaid);
  //                 }
  //               }
  //             }else{
  //               sessionObj.inActiveMember.push(member);
  //             }
             
  //           })
  //         }
  //         sessionObj.totalamountDue = totalSessionDue;
  //         sessionObj.totalAmountpaid = totalSessionPaid;
  //         sessionObj.totalActiveMember = totalActiveMember;
  //         this.selectedSchoolSessionDetails.push(sessionObj);
  //       });
  //       console.log();
  //       this.totalPaid = this.totalPaid.toFixed(2);
  //     });
  //   });
  // }
  // getSessionDetails(){
  //   this.fb.getAllWithQuery("SchoolSession/"+this.parentClubKey,{orderByChild:'SchoolKey',equalTo:this.selectedSchool}).subscribe((data) =>{
  //     this.selectedSchoolSessionDetails = [];
  //     let day = moment().subtract(Number(this.beforeDays), 'days');
  //     let dayInLong = new Date(day["_d"]).getTime();
  //     let calDay = moment();
  //     this.totalPaid = 0
  //     this.totalPaidMemberLength = 0;
  //     data.forEach((session) =>{
  //       let sessionObj = new Session();
  //       sessionObj.name = session.SessionName;
  //       sessionObj.sessionFee = session.SessionFee;
  //       let totalActiveMember =  0;
  //       let totalSessionDue = 0.00;
  //       let totalSessionPaid = 0.00;
  //       if(session.Member != undefined){
  //         if(session.Member.length == undefined){
  //           session.Member = this.commonService.convertFbObjectToArray(session.Member);
  //         }
  //         session.Member.forEach((member) =>{

  //           sessionObj.memberInfo.push(member);
  //           if(member.IsActive == true){
  //             sessionObj.activeMember.push(member);
  //             totalActiveMember++;
  //             if(member.AmountPayStatus == 'Due'){
  //               sessionObj.dueMember.push(member);
  //               totalSessionDue = totalSessionDue + parseFloat(member.AmountDue);
                
  //             }else{
  //               let dates = member.TransactionDate.split("-");
  //                 if(dates.length==3){
  //                   member.TransactionDate  = this.commonService.convertDatetoDDMMYYYYBySpliting(member.TransactionDate);
  //                 }
  //               let dt = new Date(moment(member.TransactionDate).format()).getTime();
  //               if(dt >= dayInLong){
  //                 sessionObj.paidMember.push(member);
  //                 this.totalPaidMemberLength += 1;
  //                 totalSessionPaid = totalSessionPaid + parseFloat(member.AmountPaid);
  //                 this.totalPaid = this.totalPaid + parseFloat(member.AmountPaid);
  //               }
  //             }
  //           }else{
  //             sessionObj.inActiveMember.push(member);
  //           }
           
  //         })
  //       }
  //       sessionObj.totalamountDue = totalSessionDue;
  //       sessionObj.totalAmountpaid = totalSessionPaid;
  //       sessionObj.totalActiveMember = totalActiveMember;
  //       this.selectedSchoolSessionDetails.push(sessionObj);
  //     });
  //     console.log()
  //   });
  // }
  // getSessionDetails(){
  //   this.fb.getAllWithQuery("SchoolSession/"+this.parentClubKey,{orderByChild:'SchoolKey',equalTo:this.selectedSchool}).subscribe((data) =>{
  //     this.selectedSchoolSessionDetails = [];
  //     let day = moment().subtract(Number(this.beforeDays), 'days');
  //     let dayInLong = new Date(day["_d"]).getTime();
  //     let calDay = moment();
  //     this.totalPaid = 0.00;
  //     this.totalPaidMemberLength = 0;
  //     data.forEach((session) =>{
  //       let sessionObj = new Session();
  //       sessionObj.name = session.SessionName;
  //       sessionObj.sessionFee = session.SessionFee;
  //       let totalActiveMember =  0;
  //       let totalSessionDue = 0.00;
  //       let totalSessionPaid = 0.00;
  //       if(session.Member != undefined){
  //         if(session.Member.length == undefined){
  //           session.Member = this.commonService.convertFbObjectToArray(session.Member);
  //         }
  //         session.Member.forEach((member) =>{

  //           sessionObj.memberInfo.push(member);
  //           if(member.IsActive == true){
  //             sessionObj.activeMember.push(member);
  //             totalActiveMember++;
  //             if(member.AmountPayStatus == 'Due'){
  //               sessionObj.dueMember.push(member);
  //               totalSessionDue = totalSessionDue + parseFloat(member.AmountDue);
                
  //             }else{
  //               let dt = new Date(member.TransactionDate).getTime();
  //               if(dt >= dayInLong){
  //                 sessionObj.paidMember.push(member);
  //                 this.totalPaidMemberLength += 1;
  //                 totalSessionPaid = totalSessionPaid + parseFloat(member.AmountPaid);
  //                 this.totalPaid = parseFloat(this.totalPaid) + parseFloat(member.AmountPaid);
  //               }
  //             }
  //           }else{
  //             sessionObj.inActiveMember.push(member);
  //           }
           
  //         })
  //       }
  //       sessionObj.totalamountDue = totalSessionDue;
  //       sessionObj.totalAmountpaid = totalSessionPaid;
  //       sessionObj.totalActiveMember = totalActiveMember;
  //       this.selectedSchoolSessionDetails.push(sessionObj);
  //       this.totalPaid = this.totalPaid.toFixed(2);
  //     });
  //     console.log()
  //   });
  // }
  getAllDetails(){
    this.commonService.showLoader("Please wait");
    
    this.http.get(`${this.nestUrl}/schoolsession/getpaymentreport?parentClubKey=${this.schoolObj.ParentClubKey}&venueKey=${this.schoolObj.VenueKey}&memberKey=${this.schoolObj.MemberKey}&type=${this.schoolObj.Type}&startDate=${this.schoolObj.StartDate}&endDate=${this.schoolObj.EndDate}`).subscribe((res:any) => {
      console.log(res);
      this.commonService.hideLoader();
      this.paidMember = res.data.paidMembers;
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
  changeSchool(key,name){
    if(key == 'all'){
      this.selectedSchoolName = "All Schools";
      this.selectedSchool = key;
      this.schoolObj.VenueKey = "all";
      this.getAllDetails();
    }else{
      this.selectedSchool = key;
      this.selectedSchoolName = name;
      this.schoolObj.VenueKey = key;
      //this.getSessionDetails();
      this.getAllDetails();
    }
  }
  changeDays(day){
    this.beforeDays =  day;
    if(day!= 'dates'){
      let todaysDate = new Date();
      this.schoolObj.EndDate = new Date(todaysDate).getTime();
      let filterDate = todaysDate.setDate(todaysDate.getDate() - day);
      this.schoolObj.StartDate = new Date(filterDate).getTime();
      this.getAllDetails();
    } 
  }

  Search(){
    this.schoolObj.EndDate = new Date(this.endDate).getTime();
    this.schoolObj.StartDate = new Date(this.startDate).getTime();
    this.getAllDetails();
  }

  getDay(dt){
    return moment(dt).format('DD-MM-YYYY');
  }

  gotoPrint() {
    this.navCtrl.push("SchoolReportPrint", {
      memberList: this.paidMember,
      reportType: "paid",
      parentclubKey: this.parentClubKey,
    });
  }


}



class Session{
  sessionKey:string;
  name:string;
  totalAmountpaid:number;
  totalamountDue:number;
  totalAmountToPaid:number;
  memberInfo:any = [];
  totalActiveMember:Number = 0 ;
  sessionFee:Number;
  activeMember:any = [];
  inActiveMember:any = [];
  dueMember:any = [];
  paidMember:any = [];
}