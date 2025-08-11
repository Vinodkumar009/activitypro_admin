// import { Type2NotificationSession } from '../session/notificationsession';
// import { Dashboard } from '../../dashboard/dashboard';
// import { Type2SessionDetails } from '../session/sessiondetails';
import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
//import { Type2AttendanceDates } from './attendancedates';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()

@Component({
  selector: 'manageattendance-page',
  templateUrl: 'manageattendance.html'
})

export class Type2ManageAttendance {
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

  isShowMessage1 = false;

  MemberListsForDeviceToken = [];

  constructor(public commonService:CommonService,public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');


    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getClubList();

      }
    })
  }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  getClubList() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (this.clubs.length != 0) {
        this.selectedClub = this.clubs[0].$key;
        this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
          this.MemberListsForDeviceToken = data;
        });
        this.getCoachLists();
      }
    });
  }
  // onChangeOfClub() {
  //       this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
  //           this.MemberListsForDeviceToken = data;
  //       });
  // }
  notifyMeber(session) {
    let sendTo = [];
    if (session.Member != undefined) {
      if (session.Member.length != 0) {
        let mlist = this.commonService.convertFbObjectToArray(session.Member)
        for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
          for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
            if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
              sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
            }
          }
        }
        this.navCtrl.push("Type2NotificationSession", { UsersDeviceToken: sendTo, SessionDetails: session, MemberList: mlist });
      }
    }
  }

  //get coachlist accoridng to club list 
  //calling from getClubList method
  getCoachLists() {
    this.fb.getAll("/Club/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/Coach/").subscribe((data) => {
      this.coaches = data;
      if (this.coaches.length != 0) {
        this.selectedCoach = this.coaches[0].$key;
        this.getSessionLists();
      }
    });
  }

  // getSessionLists() {
  //   this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedCoach + "/Group/").subscribe((data) => {
  //     this.sessionObj = data;
  //     //console.log(this.sessionObj);
  //     if (data.length == 0) {
  //       this.isShowMessage1 = true;
  //     }
  //   });
  // }
  getSessionLists() {
    this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedCoach + "/Group/").subscribe((data) => {
      this.sessionObj = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].IsActive) {
          if (data[i].IsEnable == undefined || data[i].IsEnable == true) {
            if (new Date(data[i].EndDate).getTime() > new Date().getTime()) {
              this.sessionObj.push(data[i]);

            }
          }
        }
      }
      // this.sessionObj = data;
      if (this.sessionObj.length == 0) {
        this.isShowMessage1 = true;
      }
   
    });
  }


  onChangeOfClub() {
    this.isShowMessage1 = false;
    this.sessionObj = [];
    this.coaches = [];
    this.getCoachLists();
    this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      this.MemberListsForDeviceToken = data;
    });
  }
  onChangeOfCoach() {
    this.isShowMessage1 = false;
    this.sessionObj = [];
    this.getSessionLists();
  }


  sessionDetails(sessionDetailsForGroup) {
    this.navCtrl.push("Type2SessionDetails", { OldSessionDetails: sessionDetailsForGroup });
  }

  // sessionDetails(sessionDetailsForGroup) {
  //     //this.navCtrl.push(Type2AttendanceDates,{OldSessionDetails: sessionDetailsForGroup});
  // }



  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }


}
