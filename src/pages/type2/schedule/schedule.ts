// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController,Platform } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { LanguageService } from '../../../services/language.service';
// import { PaymentDetails } from './paymentdetails';


import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'schedule-page',
  templateUrl: 'schedule.html'
})

export class Type2Schedule {
  LangObj:any = {};//by vinod
  themeType: number;
  loading: any;
  coachKey: "";
  parentClubKey: "";
  coachList = [];
  selectedCoach = "";
  selectedClub = "All";
  clubs = [];
  sessionList = [];
  allSessionList = [];
  totalDuaration = 0;
  duration = '';
  totalMember = 0;


  platformOS:string = "";
  sessionsDayWise = [];
  sessionSummary = [];


  data: Array<{ title: string, icon: string, showDetails: boolean }> = [];
  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  constructor(public events: Events,public commonService:CommonService,public loadingCtrl: LoadingController, public platform: Platform, public storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,private langService:LanguageService) {

    this.themeType = sharedservice.getThemeType();

    this.platformOS = this.platform.is('ios') ? 'ios':'android';

    for (let i = 0; i < 7; i++) {
      this.sessionsDayWise.push([]);
      this.sessionSummary.push({ Session: 0, Member: 0, Hour: "" });
      if ((new Date().getDay()) - 1 != i) {
        this.data.push({
          title: this.days[i],
          icon: 'ios-add-circle-outline',
          showDetails: false
        });
      }
      else {
        this.data.push({
          title: this.days[i],
          icon: 'ios-remove-circle-outline',
          showDetails: true
        });
      }
    }


  }
  ionViewDidLoad() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
    this.loading.present().then(() => {
      this.storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.getCoachList();
        }

      });

    });
  }

  getLanguage(){
    this.storage.get("language").then((res)=>{
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

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  getCoachList() {
    this.fb.getAll("/Coach/Type2/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {
        this.sessionList = [];
        this.allSessionList = [];
        this.totalDuaration = 0;
        this.totalMember = 0;
        let member = [];
        this.coachList = data.filter(coach => coach.IsActive);;
        this.selectedCoach = this.coachList[0].$key;

        if (this.coachList[0].Club != undefined) {
          this.clubs = this.commonService.convertFbObjectToArray(this.coachList[0].Club);
        }
        else {
          this.clubs = [];
        }
        if (this.coachList[0].Session != undefined) {
          let x = this.commonService.convertFbObjectToArray(this.coachList[0].Session);

          for (let loop = 0; loop < x.length; loop++) {
            if (new Date(x[loop].EndDate).getTime() > new Date().getTime()) {
              this.sessionList.push(x[loop]);
            }
          }


          this.allSessionList = this.sessionList;
          this.sessionList.forEach(element => {
            this.totalDuaration += (parseInt(element.Duration));
            member = [];
            if (element.Member != undefined) {
              let allMem =  this.commonService.convertFbObjectToArray(element.Member);
              allMem.forEach((eachMem)=>{
                if(eachMem.IsActive){
                  member.push(eachMem)
                }
                
              })
            }
            this.totalMember += member.length;
          });
        } else {
          this.sessionList = [];
          this.allSessionList = [];
        }
        this.duration = (Math.floor(this.totalDuaration / 60)).toString();
        // this.duration += ":" + (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
        let x:any = (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
        if(String(x).length == 1){
          x = 0+""+x;
        }
        // this.duration += ":" + (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
        this.duration += ":" + x;
        this.getSessionDetails();
      }
      this.loading.dismiss().catch(() => { });
    });
  }




  onChangeCoach() {
    for (let i = 0; i < 7; i++) {
      this.data[i].icon = 'ios-add-circle-outline',
        this.data[i].showDetails = false;
    }
    this.clubs = [];
    this.sessionList = [];
    this.totalDuaration = 0;
    this.totalMember = 0;
    let member = [];
    this.allSessionList = [];
    this.coachList.forEach(element => {
      if (this.selectedCoach == element.$key) {
        if (element.Club != undefined) {
          this.clubs = this.commonService.convertFbObjectToArray(element.Club);
        } else {
          this.clubs = [];
        }
        if (element.Session != undefined) {
          // this.sessionList = this.convertFbObjectToArray(element.Session);
          // this.allSessionList = this.sessionList;


          let x = this.commonService.convertFbObjectToArray(element.Session);

          for (let loop = 0; loop < x.length; loop++) {
            if (new Date(x[loop].EndDate).getTime() > new Date().getTime()) {
              if (x[loop].IsActive && (x[loop].IsEnable == undefined || x[loop].IsEnable)) {
                this.sessionList.push(x[loop]);
              }
            }
          }
          this.allSessionList = this.sessionList;

          this.sessionList.forEach(element1 => {
            this.totalDuaration += (parseInt(element1.Duration));
            member = [];
            if (element1.Member != undefined) {
              let allMem =  this.commonService.convertFbObjectToArray(element1.Member);
              allMem.forEach((eachMem)=>{
                if(eachMem.IsActive){
                  member.push(eachMem)
                }
                
              })
            
            }
            this.totalMember += member.length;
          });
        } else {
          this.sessionList = [];
          this.allSessionList = [];
        }
        this.duration = (Math.floor(this.totalDuaration / 60)).toString();
        let x:any = (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
        if(String(x).length == 1){
          x = 0+""+x;
        }
        // this.duration += ":" + (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
        this.duration += ":" + x;
        this.getSessionDetails();
        this.loading.dismiss().catch(() => { });
      }
    });

  }


  onChangeOfClub() {
    for (let i = 0; i < 7; i++) {
      this.data[i].icon = 'ios-add-circle-outline',
        this.data[i].showDetails = false;
    }
    this.sessionList = [];
    this.totalDuaration = 0;
    this.totalMember = 0;
    let member = [];
    if (this.selectedClub == "All") {
      this.sessionList = this.allSessionList;
    }
    else {
      this.allSessionList.forEach(element1 => {
        if (this.selectedClub == element1.ClubKey) {
          this.sessionList.push(element1);
        }
      });
    }

    this.sessionList.forEach(element1 => {
      this.totalDuaration += (parseInt(element1.Duration));
      member = [];
      if (element1.Member != undefined) {
        let allMem =  this.commonService.convertFbObjectToArray(element1.Member);
        allMem.forEach((eachMem)=>{
          if(eachMem.IsActive){
            member.push(eachMem)
          }
          
        })
     
      }
      this.totalMember += member.length;
    });
    this.duration = (Math.floor(this.totalDuaration / 60)).toString();
    // this.duration += ":" + (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
    let x:any = (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
    if(String(x).length == 1){
      x = 0+""+x;
    }
    // this.duration += ":" + (this.totalDuaration - (60 * (Math.floor(this.totalDuaration / 60))));
    this.duration += ":" + x;
    this.getSessionDetails();
    this.loading.dismiss().catch(() => { });
  }


  getSessionDetails() {
    this.sessionsDayWise = [];
    this.sessionSummary = [];
    let Tue = [];
    let Wed = [];
    let Thu = [];
    let Fri = [];
    let Sat = [];
    let Sun = [];
    let Mon = [];

    for (let i = 0; i < 7; i++) {
      this.sessionSummary.push({ Session: 0, Member: 0, Hour: "" });
    }
    this.sessionList.forEach(item => {
      if (item.Member != undefined) {
        let mem = [];
        let tempMem = this.commonService.convertFbObjectToArray(item.Member);
        tempMem.forEach((eachMem)=>{
          if(eachMem.IsActive){
            mem.push(eachMem);
          }
        })
        item.TotalMember = mem.length;
      }
      else {
        item.TotalMember = 0;
      }
      let arr = [];
      arr = (item.Days).split(",");

      this.clubs.forEach(club => {
        if (club.Key == item.ClubKey) {
          item.ClubShortName = club.ClubShortName;
        }
      });

      arr.forEach(element => {
        switch (element) {
          case "Mon":
            Mon.push(item);
            break;
          case "Tue":
            Tue.push(item);
            break;
          case "Wed":
            Wed.push(item);
            break;
          case "Thu":
            Thu.push(item);
            break;
          case "Fri":
            Fri.push(item);
            break;
          case "Sat":
            Sat.push(item);
            break;
          case "Sun":
            Sun.push(item);
            break;
        }
      });

    });
    this.sessionsDayWise.push(Mon);
    this.sessionsDayWise.push(Tue);
    this.sessionsDayWise.push(Wed);
    this.sessionsDayWise.push(Thu);
    this.sessionsDayWise.push(Fri);
    this.sessionsDayWise.push(Sat);
    this.sessionsDayWise.push(Sun);
    for (let i = 0; i < this.sessionsDayWise.length; i++) {
      for (let j = 0; j < this.sessionsDayWise[i].length; j++) {
        this.sessionSummary[i].Session = this.sessionsDayWise[i].length;
        if (this.sessionsDayWise[i][j].Member != undefined) {
          let allMem = [];
          let tempMemb = this.commonService.convertFbObjectToArray(this.sessionsDayWise[i][j].Member);
          tempMemb.forEach((eachMemb)=>{
            if(eachMemb.IsActive){
              allMem.push(eachMemb);
            }
          })
          this.sessionSummary[i].Member += allMem.length;
        }
      }
    }
  }


  toggleDetails(data) {


    if (data.showDetails) {
      data.showDetails = false;
      data.icon = 'ios-add-circle-outline';
    } else {
      data.showDetails = true;
      data.icon = 'ios-remove-circle-outline';
    }
  }

}




