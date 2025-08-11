// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { LanguageService } from '../../../services/language.service';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'reportsession-page',
  templateUrl: 'reportsession.html'
})

export class Type2ReportSession {
  LangObj:any = {};//by vinod
  themeType: number;
  loading: any;
  coachKey = "";
  parentClubKey = "";
  session = "Present";
  activityList = [];
  selectedActivity = "";
  clubs = [];
  selectedClub = "All";
  activityfolder = [];
  coachList = [];
  sessionList = [];
  selectedCoach = "All";
  SessionToShow = [];
  overAllDuration = "";
  overAllMember = 0;
  // selectedActivity = "All";

  sessionAllClubs = [];

  constructor(public events: Events,public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,private langService:LanguageService) {
    this.overAllMember = 0;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getActivityList();
      }
    })

  }
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
  cancel() {
    this.navCtrl.pop();
  }
  pay() {

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
  getActivityList() {
    this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {
        this.activityfolder = data;
        this.activityList = [];
        for (let j = 0; j < data.length; j++) {
          let ActivityList = this.commonService.convertFbObjectToArray(data[j]);
          for (let k = 0; k < ActivityList.length; k++) {
            let flag = true;
            for (let i = 0; i < this.activityList.length; i++) {
              if (ActivityList[k].IsEnable) {
                if (ActivityList[k].Key == this.activityList[i].Key) {
                  flag = false;
                  break;
                }
              }
            }
            if (flag) {
              this.activityList.push(ActivityList[k]);
              this.selectedActivity = this.activityList[0].Key;
              flag = false;
            }
          }

        }
      }
    });
    this.getClubList();
  }
  getClubList() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = [];
      for (let j = 0; j < data.length; j++) {
        if (data[j].IsEnable) {
          data[j].Sessions = [];
          this.clubs.push(data[j]);
          if (data[j].Coach != undefined) {
            let Coachs = this.commonService.convertFbObjectToArray(data[j].Coach);
            for (let k = 0; k < Coachs.length; k++) {
              let flag = true;
              for (let i = 0; i < this.coachList.length; i++) {

                if (Coachs[k].Key == this.coachList[i].Key) {
                  flag = false;
                  break;
                }
              }
              if (flag) {
                this.coachList.push(Coachs[k]);
                flag = false;
              }
            }
          }
        }
      }

    });

    this.getSessionList();
  }
  getSessionList() {
    this.fb.getAll("/Session/" + this.parentClubKey).subscribe((data) => {
      let totalDuration = 0;
      for (let i = 0; i < data.length; i++) {
        let sessionClubWise = this.commonService.convertFbObjectToArray(data[i]);
        for (let j = 0; j < sessionClubWise.length; j++) {
          let groupSession = this.commonService.convertFbObjectToArray(sessionClubWise[j].Group);
          for (let k = 0; k < groupSession.length; k++) {


            if (groupSession[k].IsActive) {

              if (groupSession[k].IsEnable == undefined || groupSession[k].IsEnable == true) {
                if (new Date(groupSession[k].EndDate).getTime() > new Date().getTime()) {

                  totalDuration += parseInt(groupSession[k].Duration);
                  // if (groupSession[k].Member != undefined) {
                  //   if (groupSession[k].Member != undefined) {
                  //     let Sessionmember = this.convertFbObjectToArray(groupSession[k].Member);
                  //     for (let memberI = 1; memberI < Sessionmember.length; memberI++) {
                  //       if (Sessionmember[memberI].IsActive)
                  //         this.overAllMember += memberI;
                  //     }
                  //   }
                  // }
                  this.sessionList.push(groupSession[k]);
                }
              }
            }
          }
        }
      }

      this.getAllSessionClubWise();
      this.overAllDuration = (Math.floor(totalDuration / 60)).toString();
      this.overAllDuration += ":" + (totalDuration - (60 * (Math.floor(totalDuration / 60))));
      this.loading.dismiss().catch(() => { });
    });
  }
  getAllSessionClubWise() {
    this.overAllMember = 0;
    this.sessionAllClubs = [];
    for (let i = 0; i < this.clubs.length; i++) {
      let prevColor = 0;
      let color = Math.ceil(Math.random() * 10);
      for (let i = 0; ; i++) {
        if (prevColor != color) {
          prevColor = color;
          break;
        } else {
          color = Math.ceil(Math.random() * 10);
        }
      }
      this.sessionAllClubs.push({ ClubName: this.clubs[i].ClubName, ClubKey: this.clubs[i].$key, Sessions: [], MemberCount: 0, TotalHours: "0:0 Hours", ColorIndex: color });
    }
    if ((this.selectedClub == "All") && (this.selectedCoach == "All")) {
      for (let sessionIndex = 0; sessionIndex < this.sessionList.length; sessionIndex++) {
        if (this.selectedActivity == this.sessionList[sessionIndex].ActivityKey) {
          for (let i = 0; i < this.sessionAllClubs.length; i++) {
            if (this.sessionAllClubs[i].ClubKey == this.sessionList[sessionIndex].ClubKey) {
              this.sessionAllClubs[i].Sessions.push(this.sessionList[sessionIndex]);
              if (this.sessionList[sessionIndex].Member != undefined) {
                let member = this.commonService.convertFbObjectToArray(this.sessionList[sessionIndex].Member);
                let count = 0;
                for (let j = 0; j < member.length; j++) {
                  if (member[j].IsActive) {
                    count++;
                  }
                }
                this.sessionAllClubs[i].MemberCount += count;
                this.overAllMember += count;
                break;
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < this.sessionAllClubs.length; i++) {
      this.sessionAllClubs[i].TotalHours = "0:0 Hours";
      let duration = 0;
      for (let j = 0; j < this.sessionAllClubs[i].Sessions.length; j++) {
        duration += parseInt(this.sessionAllClubs[i].Sessions[j].Duration);
      }
      this.sessionAllClubs[i].TotalHours = (Math.floor(duration / 60)).toString();
      this.sessionAllClubs[i].TotalHours += ":" + (duration - (60 * (Math.floor(duration / 60))));
    }
  }

  onChangeActivity() {

  }
  onChangeOfClub() {
    this.sessionAllClubs = [];
    this.selectedCoach = "All";
    if (this.selectedClub != "All" && this.selectedCoach == "All") {
      for (let i = 0; i < this.clubs.length; i++) {
        if (this.selectedClub == this.clubs[i].$key) {
          this.sessionAllClubs.push({ ClubName: this.clubs[i].ClubName, ClubKey: this.clubs[i].$key, Sessions: [], MemberCount: 0, TotalHours: "0:0 Hours", ColorIndex: Math.ceil(Math.random() * 10) });
        }
      }
      for (let sessionIndex = 0; sessionIndex < this.sessionList.length; sessionIndex++) {
        if (this.selectedActivity == this.sessionList[sessionIndex].ActivityKey) {
          for (let i = 0; i < this.sessionAllClubs.length; i++) {
            if (this.sessionAllClubs[i].ClubKey == this.sessionList[sessionIndex].ClubKey) {
              this.sessionAllClubs[i].Sessions.push(this.sessionList[sessionIndex]);
              if (this.sessionList[sessionIndex].Member != undefined) {
                let member = this.commonService.convertFbObjectToArray(this.sessionList[sessionIndex].Member);
                let count = 0;
                for (let j = 0; j < member.length; j++) {
                  if (member[j].IsActive) {
                    count++;
                  }
                }
                this.sessionAllClubs[i].MemberCount += count;
                break;
              }
            }
          }
        }
      }

      for (let i = 0; i < this.sessionAllClubs.length; i++) {
        this.sessionAllClubs[i].TotalHours = "0:0 Hours";
        let duration = 0;
        for (let j = 0; j < this.sessionAllClubs[i].Sessions.length; j++) {
          duration += parseInt(this.sessionAllClubs[i].Sessions[j].Duration);
        }
        this.sessionAllClubs[i].TotalHours = (Math.floor(duration / 60)).toString();
        this.sessionAllClubs[i].TotalHours += ":" + (duration - (60 * (Math.floor(duration / 60))));
      }
    }
    else {
      this.getAllSessionClubWise();
    }
  }
  onChangeCoach() {

    this.sessionAllClubs = [];
    if (this.selectedClub != "All" && this.selectedCoach != "All") {
      for (let i = 0; i < this.clubs.length; i++) {
        if (this.selectedClub == this.clubs[i].$key) {
          this.sessionAllClubs.push({ ClubName: this.clubs[i].ClubName, ClubKey: this.clubs[i].$key, Sessions: [], MemberCount: 0, TotalHours: "0:0 Hours", ColorIndex: Math.ceil(Math.random() * 10) });
        }
      }
      for (let sessionIndex = 0; sessionIndex < this.sessionList.length; sessionIndex++) {
        if (this.selectedActivity == this.sessionList[sessionIndex].ActivityKey) {
          for (let i = 0; i < this.sessionAllClubs.length; i++) {
            if (this.sessionAllClubs[i].ClubKey == this.sessionList[sessionIndex].ClubKey) {
              if (this.sessionList[sessionIndex].CoachKey == this.selectedCoach) {
                this.sessionAllClubs[i].Sessions.push(this.sessionList[sessionIndex]);
                if (this.sessionList[sessionIndex].Member != undefined) {
                  let member = this.commonService.convertFbObjectToArray(this.sessionList[sessionIndex].Member);
                  let count = 0;
                  for (let j = 0; j < member.length; j++) {
                    if (member[j].IsActive) {
                      count++;
                    }
                  }
                  this.sessionAllClubs[i].MemberCount += count;
                  break;
                }
              }
            }
          }
        }
      }

      for (let i = 0; i < this.sessionAllClubs.length; i++) {
        this.sessionAllClubs[i].TotalHours = "0:0 Hours";
        let duration = 0;
        for (let j = 0; j < this.sessionAllClubs[i].Sessions.length; j++) {
          duration += parseInt(this.sessionAllClubs[i].Sessions[j].Duration);
        }
        this.sessionAllClubs[i].TotalHours = (Math.floor(duration / 60)).toString();
        this.sessionAllClubs[i].TotalHours += ":" + (duration - (60 * (Math.floor(duration / 60))));
      }
    }
    else {
      this.onChangeOfClub();
    }
  }
}




