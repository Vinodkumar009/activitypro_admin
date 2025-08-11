
import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';


import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'manageattendanceincoach-page',
  templateUrl: 'manageattendanceincoach.html'
})

export class CoachManageAttendance {


  themeType: number;
  isAndroid: boolean = false;
  myIndex: number = -1;
  newSession = {
    IsActive: false,
    TermKey: "",
    SessionName: "",
    StartDate: "",
    EndDate: "",
    StartTime: "",
    Duration: "",
    Days: "",
    GroupSize: "",
    IsTerm: false,
    Comments: "",
    CoachKey: "",
    ClubKey: "",
    ParentClubKey: "",
    SessionFee: "",
    CoachName: "",
    SessionType: "",
    ActivityKey: "",
    ActivityCategoryKey: "",
    FinancialYearKey: "",
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: "",
    IsExistActivityCategory: false
  }


  //variable 
  sessionStrength: string = "Group";
  selectedTabValue: string = "Group";
  parentClubKey: any;
  coachList: any;
  clubs: any;
  selectedClub: any;
  coaches: any;
  selectedCoach: any;
  sessionObj = [];
  sessionMemberDetails: Array<any>;
  MemberListsForDeviceToken = [];
  isShowMessage1 = false;

  coachType: any;
  constructor(public comonService:CommonService, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');


    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.selectedCoach = val.UserInfo[0].CoachKey;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.coachType = val.Type;
        this.getClubList();
      }
    })
  }

  getClubList() {
    this.fb.getAll("/Coach/Type" + this.coachType + "/" + this.parentClubKey + "/" + this.selectedCoach + "/Club/").subscribe((data) => {
      if (data.length > 0) {
        this.clubs = data;
        if (this.clubs.length != 0) {
          this.selectedClub = this.clubs[0].$key;
          this.getSessionLists();
        }
      }
    });
  }
 
  notifyMeber(session) {

    let sendTo = [];
    if (session.Member != undefined) {
      if (session.Member.length != 0) {
        //let mlist = this.convertFbObjectToArray(session.Member)
        let a = [];
        let mlist = [];
        a = this.comonService.convertFbObjectToArray(session.Member);
        for (let i = 0; i < a.length; i++) {
          if (a[i].IsActive) {
            mlist.push(a[i]);
          }
        }
        for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
          for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
            if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
              sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
            }
          }
        }
        this.navCtrl.push("CoachNotificationSession", { UsersDeviceToken: sendTo, SessionDetails: session, MemberList: mlist });
      }
    }

  }
  getSessionLists() {
    this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedCoach + "/Group/").subscribe((data) => {
      this.sessionObj = data;
      if (data.length == 0) {
        this.isShowMessage1 = true;
      }
    });
  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  onChangeOfClub() {
    this.isShowMessage1 = false;
    this.sessionObj = [];
    //this.coaches = [];
    this.getSessionLists();
  }


  sessionDetails(sessionDetailsForGroup) {
    this.navCtrl.push("CoachSessionDetails", { OldSessionDetails: sessionDetailsForGroup });
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }


}
