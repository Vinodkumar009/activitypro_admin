
import { NavController, LoadingController, PopoverController, ToastController, AlertController } from "ionic-angular";
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../../services/firebase.service";
// import { Dashboard } from "../../dashboard/dashboard";
// import { PopoverPage } from "../../popover/popover";
import { SharedServices } from "../../services/sharedservice";

import { IonicPage, NavParams } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";
@IonicPage()
@Component({
  selector: 'updateholidaycamp-page',
  templateUrl: 'updateholidaycamp.html'
})

export class Type2UpdateHolidayCamp {

  //Varriables
  themeType: any;
  clubs = [];
  parentClubKey = "";
  selectedClub = "";

  types = [];
  selectedActivityType: any;
  activityObj: any;
  isActivityCategoryExist = false;
  isExistActivitySubCategory = false;
  activityCategoryList = [];
  selectActivityCategory = "";
  activityCategoryObj: any;
  activitySubCategoryList = [];
  selectActivitySubCategory = "";
  allActivities = [];
  allClubCoachAccordingToActivity = [];
  coachs = [];
  selectedCoach = "";
  campList = [{ Key: 500, Value: "Half Day" }, { Key: 501, Value: "Single Day" }, { Key: 502, Value: "Multiple Day" }];
  promoType = 200;
  promoTypeList = [{ Key: 200, Value: "Slide Show" }, { Key: 201, Value: "Long Scroll" }];
  campType = 501;
  squadSizeRestrictionFlag = false;
  allowMemberEnrollment = false;
  promotionPushFlag = false;

  campMembersList = [];
  holidayCamp: any;

  //Single Day Holiday Camp Varriable

  singleHolidayCampSessionList = [];
  singleDaySession = {
    Amount: '0.00',
    CreationDate: new Date().getTime(),
    Duration: 6,
    EndTime: '',
    IsActive: true,
    SessionName: 'Session-1',
    StartTime: '',
    UpdatedDate: new Date().getTime()
  }

  selectedactivityObj = {
    ActivityCategoryKey: '',
    ActivityKey: '',
    ActivitySubCategoryKey: ''
  }
  coachDetails = [];
  allselectedMembersForSessions = [];
  allMemberHavingSession = [];
  //constructor

  constructor(public comonService:CommonService,private navParams: NavParams, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private toastCtrl: ToastController, public navCtrl: NavController, storage: Storage, public fb: FirebaseService, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    try {
      this.themeType = sharedservice.getThemeType();
      this.holidayCamp = navParams.get('CampDetails');
      this.selectedClub = this.holidayCamp.ClubKey;
      let act = this.comonService.convertFbObjectToArray(this.holidayCamp.Activity);
      this.selectedActivityType = act[0].Key;
      this.selectedCoach = this.holidayCamp.CoachKey;
      if (this.holidayCamp.IsPromotionPushFlag == 0) {
        this.promotionPushFlag = false;
      } else {
        this.promotionPushFlag = true;
      }
      if (this.holidayCamp.IsAllowMemberEnrollment == 0) {
        this.allowMemberEnrollment = false;
      } else {
        this.allowMemberEnrollment = true;
      }
      if (this.holidayCamp.IsrestrictedSquadSize == 0) {
        this.squadSizeRestrictionFlag = false;
      } else {
        this.squadSizeRestrictionFlag = true;
      }
      //get data from storage
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.getClubList();
          this.getAllActivity();
        }
      });
      let sessions = [];
      if (this.holidayCamp.Session != undefined) {
        sessions = this.comonService.convertFbObjectToArray(this.holidayCamp.Session)
      }
      for (let i in sessions) {
        if (sessions[i].IsActive) {
          this.singleHolidayCampSessionList.push(sessions[i]);
        }
      }
      // this.holidayCamp.MemberAllowmentText = "I am interested";
      // let month = "";
      // let date = "";
      // month = ((new Date().getMonth()) + 2) > 9 ? ((new Date().getMonth()) + 2).toString() : "0" + ((new Date().getMonth()) + 2).toString();
      // date = new Date().getDate() > 9 ? (new Date().getDate()).toString() : "0" + (new Date().getDate());
      // this.holidayCamp.HolidayCampOn = (new Date().getFullYear()).toString() + "-" + month + "-" + date;

      let isExistElement1 = false;
      let slist = [];
      slist = sessions;
      for (let j = 0; j < slist.length; j++) {
        let mlist = [];
        let actList = [];
        let sessionKey = "";
        let activityKey = "";
        if (slist[j].Member != undefined) {
          actList = this.comonService.convertFbObjectToArray1(slist[j].Member);
          // a = (this.convertFbObjectToArray(slist[j].Member));

        }
        sessionKey = slist[j].Key;

        for (let actIndex = 0; actIndex < actList.length; actIndex++) {
          activityKey = act[actIndex].ActivityKey;
          let memberAccordingToAct = this.comonService.convertFbObjectToArray(actList[actIndex]);
          for (let memInd = 0; memInd < memberAccordingToAct.length; memInd++) {
            if (memberAccordingToAct[memInd].IsActive) {
              mlist.push(memberAccordingToAct[memInd]);
              this.allMemberHavingSession.push(memberAccordingToAct[memInd]);
              this.allMemberHavingSession[this.allMemberHavingSession.length - 1].SessionKey = sessionKey;
              this.allMemberHavingSession[this.allMemberHavingSession.length - 1].ActivityKey = activityKey;
            }
          }
        }

        for (let k = 0; k < mlist.length; k++) {
          isExistElement1 = false;
          for (let i = 0; i < this.allselectedMembersForSessions.length; i++) {
            if (this.allselectedMembersForSessions[i].Key == mlist[k].Key) {
              isExistElement1 = true;
              break;
            }
          }
          if (!isExistElement1) {
            isExistElement1 = false;
            this.allselectedMembersForSessions.push(mlist[k]);
          }
        }
      }
    } catch (ex) {
      this.showToast("Error:=  " + ex.message, 10000);
    }


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


  getClubList() {
    const clubs$Obs = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      clubs$Obs.unsubscribe();
      this.clubs = data;
    });
  }

  //Pending
  getAllActivity() {
    const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey + "/").subscribe((data) => {
      activity$Obs.unsubscribe()
      this.allActivities = data;
      if (data.length > 0) {
        for (let i = 0; i < this.allActivities.length; i++) {
          if (this.selectedClub == this.allActivities[i].$key) {
            this.types = this.comonService.convertFbObjectToArray(data[i]);
          }
        }
        // for (let i = 0; i < this.types.length; i++) {
        //   this.types[i].$key = this.types[i].Key;
        // }
        // if (this.types.length != 0) {

        //   // this.selectedActivityType = this.types[0].Key;
        //   this.activityObj = this.types[0];

        //   if (!this.activityObj.IsExistActivityCategory) {
        //     this.isActivityCategoryExist = false;
        //     this.isExistActivitySubCategory = false;
        //   }

        //   if (this.activityObj.IsExistActivityCategory) {
        //     this.isActivityCategoryExist = true;
        //     this.getActivityCategoryList();
        //   }
        // }

        this.getCoachList();
      }
    });
  }

  getCoachList() {
    for (let i = 0; i < this.allActivities.length; i++) {
      let activityClubkey = this.allActivities[i].$key;
      this.allActivities[i] = this.comonService.convertFbObjectToArray(this.allActivities[i]);

      for (let j = 0; j < this.allActivities[i].length; j++) {
        this.allActivities[i][j].ClubKey = activityClubkey;
        if (this.selectedActivityType == this.allActivities[i][j].Key) {
          let coachList = this.comonService.convertFbObjectToArray(this.allActivities[i][j].Coach);
          for (let k = 0; k < coachList.length; k++) {
            let isPresentCoach = false;
            for (let index = 0; index < this.coachs.length; index++) {
              if (this.coachs[index].Key == coachList[k].Key) {
                isPresentCoach = true;
                break;
              }
            }
            if (!isPresentCoach) {
              this.coachs.push(coachList[k]);
              isPresentCoach = false;
            }
          }
        }
      }
    }
    // if (this.coachs.length > 0) {
    //   this.selectedCoach = this.coachs[0].CoachKey;
    // }
  }

  //get activity category according to activity list
  //calling from getActivityList method
  //Done
  getActivityCategoryList() {
    this.activityCategoryList = [];
    if (this.activityObj.ActivityCategory != undefined) {
      this.activityCategoryList = this.comonService.convertFbObjectToArray(this.activityObj.ActivityCategory);
      // this.selectActivityCategory = this.activityCategoryList[0].Key;
      this.activityCategoryObj = this.activityCategoryList[0];
      this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
      if (this.activityCategoryObj.IsExistActivitySubCategory) {
        this.activitySubCategoryList = this.comonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
        //this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
      }
    }



  }


  onChangeOfCampType() {
  }

  onChangeOfClub() {
    let breakFlag = false;
    this.selectedActivityType = "";
    this.types = [];
    this.coachs = [];
    this.selectedCoach = "";
    for (let i = 0; i < this.allActivities.length; i++) {
      for (let j = 0; j < this.allActivities[i].length; j++) {
        if (this.allActivities[i][j].ClubKey == this.selectedClub) {
          this.types = this.allActivities[i];
          if (this.types.length != 0) {
            this.selectedActivityType = this.types[0].Key;
            this.activityObj = this.types[0];
            if (!this.activityObj.IsExistActivityCategory) {
              this.isActivityCategoryExist = false;
              this.isExistActivitySubCategory = false;
            }

            if (this.activityObj.IsExistActivityCategory) {
              this.isActivityCategoryExist = true;
              this.getActivityCategoryList();
            }
          }
          breakFlag = true;
          break;
        }
        else {
          break;
        }
      }
      if (breakFlag) {
        breakFlag = false;
        break;
      }

    }
    for (let i = 0; i < this.allActivities.length; i++) {
      for (let j = 0; j < this.allActivities[i].length; j++) {
        if (this.allActivities[i][j].ClubKey == this.selectedClub) {
          let coachList = this.comonService.convertFbObjectToArray(this.allActivities[i][j].Coach);
          for (let k = 0; k < coachList.length; k++) {
            let isPresentCoach = false;
            for (let index = 0; index < this.coachs.length; index++) {
              if (this.coachs[index].Key == coachList[k].Key) {
                isPresentCoach = true;
                break;
              }
            }
            if (!isPresentCoach) {
              this.coachs.push(coachList[k]);
              this.selectedCoach = this.coachs[0].Key;
              isPresentCoach = false;
            }
          }


          breakFlag = true;
          break;
        }
        else {
          break;
        }
      }


    }
  }

  //onchange of activity type this method will call
  //Done
  onChangeActivity() {
    this.activitySubCategoryList = [];
    this.activityCategoryList = [];
    this.coachs = [];
    this.selectActivityCategory = "";
    this.selectActivitySubCategory = "";
    this.selectedCoach = "";
    this.types.forEach(element => {
      if (element.$key == this.selectedActivityType) {
        this.activityObj = element;

        if (!this.activityObj.IsExistActivityCategory) {
          this.isActivityCategoryExist = false;
          this.isExistActivitySubCategory = false;
        }

        if (this.activityObj.IsExistActivityCategory) {
          this.isActivityCategoryExist = true;
          this.getActivityCategoryList();
        }
      }
    });



    for (let i = 0; i < this.allActivities.length; i++) {
      for (let j = 0; j < this.allActivities[i].length; j++) {
        if (this.selectedActivityType == this.allActivities[i][j].Key) {
          let coachList = this.comonService.convertFbObjectToArray(this.allActivities[i][j].Coach);
          for (let k = 0; k < coachList.length; k++) {
            let isPresentCoach = false;
            for (let index = 0; index < this.coachs.length; index++) {
              if (this.coachs[index].Key == coachList[k].Key) {
                isPresentCoach = true;
                break;
              }
            }
            if (!isPresentCoach) {
              this.coachs.push(coachList[k]);
              isPresentCoach = false;
            }
          }
        }
      }
    }
    if (this.coachs.length > 0) {
      this.selectedCoach = this.coachs[0].CoachKey;
    }
    // this.coachs = [];
    // for (let i = 0; i < allcoaches.length; i++) {
    //   for (let j = 0; j < this.coachDetails.length; j++) {
    //     if (allcoaches[i].Key == this.coachDetails[j].$key) {
    //       for (let k = 0; k < this.coachDetails[j].Activities.length; k++) {
    //         if (this.selectedActivityType == this.coachDetails[j].Activities[k].Key) {
    //           this.coachs.push(allcoaches[i]);
    //           break;
    //         }
    //       }
    //       break;
    //     }
    //   }
    // }

  }

  onChangeActivityCategory() {
    this.selectActivitySubCategory = "";
    this.activityCategoryList.forEach(element => {
      if (element.Key == this.selectActivityCategory) {
        this.activityCategoryObj = element;
        this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
        if (this.activityCategoryObj.IsExistActivitySubCategory) {
          this.activitySubCategoryList = this.comonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
        }
      }
    });
  }

  onChangeCoach() {

  }

  ageGroupHint() {
    let message = "Input age gourp separte by comma (,) Example:- 14U,16U";
    this.showToast(message, 5000);
  }

  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }

  addSingleDayHolidayCampSession() {
    this.singleDaySession = {
      CreationDate: new Date().getTime(),
      UpdatedDate: new Date().getTime(),
      SessionName: 'Session-' + (this.singleHolidayCampSessionList.length + 1),
      Duration: 0,
      EndTime: '',
      StartTime: '',
      Amount: '0.00',
      IsActive: true
    };
    // this.singleHolidayCampSessionList.forEach(element => {
    //   this.singleDaySession.Duration = this.holidayCamp.TotalDuration - element.Duration;
    // });

    this.singleHolidayCampSessionList.push(this.singleDaySession);

  }
  removeSingleDaySession(index) {
    this.singleHolidayCampSessionList.splice(index, 1);
    this.showToast("Session removed successfully", 3000);
  }
  onChangeAllowMemberEnrollment() {
    if (this.allowMemberEnrollment) {
      this.holidayCamp.MemberAllowmentText = "Enrol Now"
    } else {
      this.holidayCamp.MemberAllowmentText = "I am interested";
    }
  }



  validateHolidayCamp() {
    if (this.selectedClub == "") {
      let msg = "Select a venue";
      this.showToast(msg, 3000);
      return false;
    }
    else if (this.selectedActivityType == "") {
      let msg = "Select an activity";
      this.showToast(msg, 3000);
      return false;
    }
    else if (this.selectedCoach == "") {
      let msg = "Select a coach";
      this.showToast(msg, 3000);
      return false;
    }
    else if (this.holidayCamp.AgeGroup.trim() == "") {
      let msg = "Enter age group";
      this.showToast(msg, 3000);
      return false;
    }
    else if (this.holidayCamp.CampName.trim() == "") {
      let msg = "Enter camp name";
      this.showToast(msg, 3000);
      return false;
    }
    else if (this.holidayCamp.SquadSize.trim() == "") {
      let msg = "Enter squad size";
      this.showToast(msg, 3000);
      return false;
    }

    return true;
  }

  validateSingleDayHolidayCamp() {
    let totalDuarion = 0;
    for (let i = 0; i < this.singleHolidayCampSessionList.length; i++) {
      totalDuarion += parseInt(this.singleHolidayCampSessionList[i].Duration);
      if ((this.singleHolidayCampSessionList[i].SessionName).trim() == "") {
        let msg = "Enter session name";
        this.showToast(msg, 3000);
        return true;
      }
      else if ((this.singleHolidayCampSessionList[i].Duration).toString() == "") {
        let msg = "Enter duration for " + this.singleHolidayCampSessionList[i].SessionName;
        this.showToast(msg, 3000);
        return true;
      }
      else if ((this.singleHolidayCampSessionList[i].StartTime).trim() == "") {
        let msg = "Enter start time for " + this.singleHolidayCampSessionList[i].SessionName;
        this.showToast(msg, 3000);
        return true;
      }
      else if ((this.singleHolidayCampSessionList[i].Amount).trim() == "") {
        let msg = "Enter amount for " + this.singleHolidayCampSessionList[i].SessionName;
        this.showToast(msg, 3000);
        return true;
      }
      else if (parseInt(this.singleHolidayCampSessionList[i].Amount) == 0) {
        let msg = "Enter amount for " + this.singleHolidayCampSessionList[i].SessionName;
        this.showToast(msg, 3000);
        return true;
      }
      if ((this.singleHolidayCampSessionList[i].Amount).trim() != "") {
        this.singleHolidayCampSessionList[i].Amount = parseFloat(this.singleHolidayCampSessionList[i].Amount).toFixed(2);
      }
    }
    if (totalDuarion != this.holidayCamp.TotalDuration) {
      let msg = "Sum of total duration in session should be equal with holiday camp total duration";
      this.showToast(msg, 5000);
      return true;
    }
    if ((this.singleHolidayCampSessionList.length > 1) && (parseInt(this.holidayCamp.WholeAmount) == 0)) {
      let msg = "Enter whole day amount";
      this.showToast(msg, 3000);
      return true;
    }
    else if (this.holidayCamp.WholeAmount.trim() == "") {
      let msg = "Enter whole day amount";
      this.showToast(msg, 3000);
      return true;
    }
    return false;
  }




  showPrompt() {
    let confirm = this.alertCtrl.create({
      title: 'Camp Update',
      message: 'Are you sure you want to update holiday camp?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {

          }
        }
      ]
    });
    confirm.present();

  }
  updateHolidayCamp() {
    if (this.validateHolidayCamp()) {

      this.holidayCamp.IsrestrictedSquadSize = this.squadSizeRestrictionFlag ? 1 : 0;
      this.holidayCamp.IsAllowMemberEnrollment = this.allowMemberEnrollment ? 1 : 0;
      this.holidayCamp.IsPromotionPushFlag = this.promotionPushFlag ? 1 : 0;

      this.holidayCamp.ClubKey = this.selectedClub;
      this.selectedactivityObj.ActivityCategoryKey = this.selectActivityCategory;
      this.selectedactivityObj.ActivityKey = this.selectedActivityType;
      this.selectedactivityObj.ActivitySubCategoryKey = this.selectActivitySubCategory;

      this.holidayCamp.CoachKey = this.selectedCoach;
      this.holidayCamp.UpdatedDate = new Date().getTime();
      this.holidayCamp.ParentClubKey = this.parentClubKey;
      this.coachs.forEach(element => {
        if (element.Key == this.selectedCoach) {
          this.holidayCamp.CoachName = element.FirstName + " " + element.LastName;
        }
      });
      if (this.campType == 500)
        this.holidayCamp.CampType = this.campList[0].Value;
      else if (this.campType == 501) {
        this.holidayCamp.CampType = this.campList[1].Value;
        if (this.validateSingleDayHolidayCamp()) {
          return;
        }

        let loading: any;
        let confirm = this.alertCtrl.create({
          title: 'Holiday camp',
          message: 'Are you sure you want to create holiday camp?',
          buttons: [
            {
              text: 'No',
              handler: () => {
                console.log('Disagree clicked');
              }
            },
            {
              text: 'Yes',
              handler: () => {
                try {

                  loading = this.loadingCtrl.create({
                    content: 'Please wait...'
                  });
                  loading.present();


                  this.fb.update(this.holidayCamp.$key, "HolidayCamp/" + this.parentClubKey + "/", {
                    AgeGroup: this.holidayCamp.AgeGroup,
                    CampName: this.holidayCamp.CampName,
                    CampType: this.holidayCamp.CampType, //Single day || Half day || multiple day codes
                    ClubKey: this.holidayCamp.ClubKey,
                    CoachKey: this.holidayCamp.CoachKey,
                    CoachName: this.holidayCamp.CoachName,
                    Description: this.holidayCamp.Description,
                    HolidayCampOn: this.holidayCamp.HolidayCampOn,
                    IsAllowMemberEnrollment: this.holidayCamp.IsAllowMemberEnrollment,
                    IsPromotionPushFlag: this.holidayCamp.IsPromotionPushFlag,
                    IsrestrictedSquadSize: this.holidayCamp.IsrestrictedSquadSize,
                    MemberAllowmentText: this.holidayCamp.MemberAllowmentText,
                    Moderator: this.holidayCamp.Moderator,
                    ParentClubKey: this.holidayCamp.ParentClubKey,
                    SquadSize: this.holidayCamp.SquadSize,
                    TotalDuration: this.holidayCamp.TotalDuration,
                    UpdatedDate: new Date().getTime(),
                    WholeAmount: this.holidayCamp.WholeAmount
                  });
                  for (let i = 0; i < this.allselectedMembersForSessions.length; i++) {
                    this.fb.update(this.holidayCamp.$key, "Member/" + this.parentClubKey + "/" + this.allselectedMembersForSessions[i].ClubKey + "/" + this.allselectedMembersForSessions[i].Key + "/HolidayCamp/", {
                      AgeGroup: this.holidayCamp.AgeGroup,
                      CampName: this.holidayCamp.CampName,
                      CampType: this.holidayCamp.CampType, //Single day || Half day || multiple day codes
                      ClubKey: this.holidayCamp.ClubKey,
                      CoachKey: this.holidayCamp.CoachKey,
                      CoachName: this.holidayCamp.CoachName,
                      Description: this.holidayCamp.Description,
                      HolidayCampOn: this.holidayCamp.HolidayCampOn,
                      IsAllowMemberEnrollment: this.holidayCamp.IsAllowMemberEnrollment,
                      IsPromotionPushFlag: this.holidayCamp.IsPromotionPushFlag,
                      IsrestrictedSquadSize: this.holidayCamp.IsrestrictedSquadSize,
                      MemberAllowmentText: this.holidayCamp.MemberAllowmentText,
                      Moderator: this.holidayCamp.Moderator,
                      ParentClubKey: this.holidayCamp.ParentClubKey,
                      SquadSize: this.holidayCamp.SquadSize,
                      TotalDuration: this.holidayCamp.TotalDuration,
                      UpdatedDate: new Date().getTime(),
                      WholeAmount: this.holidayCamp.WholeAmount
                    });
                  }
                  for (let i = 0; i < this.singleHolidayCampSessionList.length; i++) {
                    let arr = this.singleHolidayCampSessionList[i].StartTime.split(":");
                    let endTime = parseInt(arr[0]) + parseInt(this.singleHolidayCampSessionList[i].Duration);
                    if (endTime > 9) {
                      this.singleHolidayCampSessionList[i].EndTime = endTime.toString() + ":" + arr[1];
                    } else {
                      this.singleHolidayCampSessionList[i].EndTime = "0" + endTime.toString() + ":" + arr[1];
                    }
                    this.fb.update(this.singleHolidayCampSessionList[i].Key, "HolidayCamp/" + this.parentClubKey + "/" + this.holidayCamp.$key + "/Session/",
                      {
                        UpdatedDate: new Date().getTime(),
                        SessionName: this.singleHolidayCampSessionList[i].SessionName,
                        Duration: this.singleHolidayCampSessionList[i].Duration,
                        EndTime: this.singleHolidayCampSessionList[i].EndTime,
                        StartTime: this.singleHolidayCampSessionList[i].StartTime,
                        Amount: this.singleHolidayCampSessionList[i].Amount,
                        IsActive: this.singleHolidayCampSessionList[i].IsActive,
                      });

                    for (let j = 0; j < this.allMemberHavingSession.length; j++) {
                      if (this.singleHolidayCampSessionList[i].Key == this.allMemberHavingSession[j].SessionKey) {
                        this.fb.update(this.allMemberHavingSession[j].SessionKey, "Member/" + this.parentClubKey + "/" + this.allMemberHavingSession[j].ClubKey + "/" + this.allMemberHavingSession[j].Key + "/HolidayCamp/" + this.holidayCamp.$key + "/Session/" + this.allMemberHavingSession[j].ActivityKey + "/",
                          {
                            UpdatedDate: new Date().getTime(),
                            SessionName: this.singleHolidayCampSessionList[i].SessionName,
                            Duration: this.singleHolidayCampSessionList[i].Duration,
                            EndTime: this.singleHolidayCampSessionList[i].EndTime,
                            StartTime: this.singleHolidayCampSessionList[i].StartTime,
                            Amount: this.singleHolidayCampSessionList[i].Amount,
                            IsActive: this.singleHolidayCampSessionList[i].IsActive,
                          });
                      }
                    }




                  }
                  loading.dismiss();
                  this.showToast("Holiday camp updated successfully.", 2000);
                  this.navCtrl.pop();
                } catch (ex) {
                  this.showToast(ex.Message, 5000);
                  loading.dismiss();
                }
              }
            }
          ]
        });
        confirm.present();
      }
      else {
        this.holidayCamp.CampType = this.campList[2].Value;
      }
    }

  }
}
