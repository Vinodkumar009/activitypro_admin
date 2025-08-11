import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { CoachAddMembershipSession } from './addmembershipsession';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastController } from 'ionic-angular';
// import { Dashboard } from './../../dashboard/dashboard';


import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'sessioncoach-page',
  templateUrl: 'sessioncoach.html'
})

export class CoachSession {
  parentClubKey: any;
  themeType: number;
  venue: string = "s";
  term: string = "t1";
  activitytype: string = "a1";
  coach: string = "a";
  ageGroup = {
    initialSlide: 0,
    loop: true
    //pager: true
  };
  category = {
    initialSlide: 0,
    loop: true
  };
  startTime: any = 10;
  duration: any = 2;
  musicAlertOpts: { title: string, subTitle: string };


  days = [];
  ////variables 

  selectedClub: any;
  types = [];
  selectedActivityType: any;
  clubs: any;
  financialYears: any;
  currentFinancialYear: any;
  terms: any;
  selectedTerm: any;
  selectedCoach: any;
  coachs: any;
  // sessionDetails = {
  //   IsActive: true,
  //   SessionName: 'Session',
  //   StartDate: '',
  //   EndDate: '',
  //   StartTime: '',
  //   Duration: '60',
  //   Days: '',
  //   GroupSize: '10',
  //   IsTerm: false,
  //   Comments: '',
  //   CoachKey: '',
  //   ClubKey: '',
  //   ParentClubKey: '',
  //   SessionFee: '7',
  //   CoachName: '',
  //   SessionType: '',
  //   ActivityKey: '',
  //   ActivityCategoryKey: '',
  //   TermKey: '',
  //   FinancialYearKey: '',
  //   IsExistActivitySubCategory: false,
  //   ActivitySubCategoryKey: '',
  //   IsExistActivityCategory: false
  // };

  sessionDetails = {
    IsActive: true,
    SessionName: 'Session',
    StartDate: '',
    EndDate: '',
    StartTime: '',
    Duration: '60',
    Days: '',
    GroupSize: '10',
    IsTerm: false,
    Comments: '',
    CoachKey: '',
    ClubKey: '',
    ParentClubKey: '',
    SessionFee: '7',
    CoachName: '',
    SessionType: '',
    ActivityKey: '',
    ActivityCategoryKey: '',
    TermKey: '',
    FinancialYearKey: '',
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: '',
    IsExistActivityCategory: false,
    PayByDate: ''
  };




  isActivityCategoryExist = false;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  isExistActivitySubCategory: boolean;
  activitySubCategoryList = [];
  acType: any;

  activityCategoryObj: any;
  selectActivityCategory: any;
  selectActivitySubCategory = "";
  selectedCoachObj = {};
  returnKey: any;
  sessionName: any;
  selectedCoachName: any;
  coachType: any;
  activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
  activityCategoryList = [];
  activityCategoryListOfExistingCoach = [];
  termForSession = { TermComments: '', TermEndDate: '', TermName: '', TermNoOfWeeks: '', TermPayByDate: '', IsActive: true, TermStartDate: '', isForAllActivity: false };
  activityListOfCoach = [];
  constructor(public commonService:CommonService,private toastCtrl: ToastController, public alertCtrl: AlertController, public navParams: NavParams, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();

    this.sessionName = navParams.get('sessionName');
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.selectedCoach = val.UserInfo[0].CoachKey;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.coachType = val.Type;
        this.selectedCoachName = val.Name;
        this.getActivityListOfCoach();
      }
    })
  }

  getActivityListOfCoach() {
    this.fb.getAll("/Coach/Type" + this.coachType + "/" + this.parentClubKey + "/" + this.selectedCoach + "/Activity/").subscribe((data) => {
      this.activityCategoryListOfExistingCoach = data;
    });
    this.getClubList();
  }
  getClubList() {
    this.fb.getAll("/Coach/Type" + this.coachType + "/" + this.parentClubKey + "/" + this.selectedCoach + "/Club/").subscribe((data) => {
      if (data.length > 0) {
        this.clubs = data;
        if (this.clubs.length != 0) {
          this.selectedClub = this.clubs[0].$key;
          this.getFinancialYearList();
        }
      }
    });
  }

  //done
  // get financial year for term
  getFinancialYearList() {
    this.fb.getAll("/FinancialYear/Type" + this.coachType + "/" + this.parentClubKey).subscribe((data) => {
      this.financialYears = data;
      if (this.financialYears.length != 0) {
        this.financialYears.forEach(element => {
          if (element.StartYear == new Date().getFullYear()) {
            this.currentFinancialYear = this.financialYears[0].$key;
            this.getTermList();
          }
        });
      }
    });
  }


  //done
  getTermList() {
    this.fb.getAll("/Term/Type" + this.coachType + "/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.currentFinancialYear + "/").subscribe((data) => {
      this.terms = data;
      if (data.length > 0) {
        this.selectedTerm = data[0].$key;
        this.sessionDetails.TermKey = data[0].$key;
        this.sessionDetails.IsTerm = true;

        this.termForSession.isForAllActivity = data[0].isForAllActivity;
        this.termForSession.TermComments = data[0].TermComments;
        this.termForSession.TermEndDate = data[0].TermEndDate;
        this.termForSession.TermName = data[0].TermName;
        this.termForSession.TermNoOfWeeks = data[0].TermNoOfWeeks;
        this.termForSession.TermPayByDate = data[0].TermPayByDate;
        this.termForSession.TermStartDate = data[0].TermStartDate;
        this.sessionDetails.StartDate = this.termForSession.TermStartDate;
        this.sessionDetails.EndDate = this.termForSession.TermEndDate;
        //this.sessionDetails.PayByDate = this.termForSession.TermPayByDate;
        this.getActivityList();
      }
    });
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }


  //called from club memthod
  //Done
  getActivityList() {
    let initialTermActivity = this.commonService.convertFbObjectToArray(this.terms[0].Activity);
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      this.acType = data;
      this.types = [];
      if (data.length > 0) {
        for (let index = 0; index < this.acType.length; index++) {
          for (let count = 0; count < initialTermActivity.length; count++) {

            if (initialTermActivity[count].Key == this.acType[index].$key) {
              for (let innerCount = 0; innerCount < this.activityCategoryListOfExistingCoach.length; innerCount++) {
                if (this.acType[index].$key == this.activityCategoryListOfExistingCoach[innerCount].$key) {
                  let coachlist = this.commonService.convertFbObjectToArray(this.acType[index].Coach);
                  for (let coachindex = 0; coachindex < coachlist.length; coachindex++) {
                    if (coachlist[coachindex].Key == this.selectedCoach) {
                      this.types.push(this.acType[index]);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (this.types.length > 0) {
        this.selectedActivityType = this.types[0].$key;
        this.activityObj = this.types[0];
        //  this.getCoachListForGroup();

        if (!this.activityObj.IsExistActivityCategory) {
          this.isActivityCategoryExist = false;
          this.isExistActivitySubCategory = false;
        }

        if (this.activityObj.IsExistActivityCategory) {
          this.isActivityCategoryExist = true;

          this.getActivityCategoryList();
        }
      }
      if (this.types.length == 0) {
        this.isActivityCategoryExist = false;
        this.isExistActivitySubCategory = false;
      }
    });
  }


  getActivityCategoryList() {
    // console.log(this.types);
    this.activityCategoryList = [];
    if (this.activityObj.ActivityCategory != undefined) {
      this.activityCategoryList = this.commonService.convertFbObjectToArray(this.activityObj.ActivityCategory);
      this.selectActivityCategory = this.activityCategoryList[0].Key;
      this.activityCategoryObj = this.activityCategoryList[0];
      this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
      if (this.activityCategoryObj.IsExistActivitySubCategory) {
        this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
        this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
      }
    }
  }




  // onChangeOfClub method calls when we changing venue
  //Done
  onChangeOfClub() {

    this.selectedTerm = "";
    this.selectedActivityType = "";
    this.selectActivityCategory = "";
    this.activitySubCategoryList = [];
    this.selectActivitySubCategory = "";
    this.terms = [];
    this.types = [];
    this.coachs = [];
    this.activityCategoryList = [];
    this.activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };

    this.getFinancialYearList();
  }



  ///on change of term
  onChangeOfTerm() {


    this.selectedActivityType = "";
    this.selectActivityCategory = "";
    this.activitySubCategoryList = [];
    this.selectActivitySubCategory = "";
    this.types = [];
    this.activityCategoryList = [];
    this.activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };

    this.getActivityList();


    let selectedIndex = 0;
    for (let i = 0; i < this.terms.length; i++) {
      if (this.terms[i].$key == this.selectedTerm) {
        selectedIndex = i;
        break;
      }
    }
    let initialTermActivity = this.commonService.convertFbObjectToArray(this.terms[selectedIndex].Activity);

    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      this.acType = data;
      this.types = [];
      if (data.length > 0) {
        for (let index = 0; index < this.acType.length; index++) {
          for (let count = 0; count < initialTermActivity.length; count++) {

            if (initialTermActivity[count].Key == this.acType[index].$key) {
              for (let innerCount = 0; innerCount < this.activityCategoryListOfExistingCoach.length; innerCount++) {
                if (this.acType[index].$key == this.activityCategoryListOfExistingCoach[innerCount].$key) {
                  let coachlist = this.commonService.convertFbObjectToArray(this.acType[index].Coach);
                  for (let coachindex = 0; coachindex < coachlist.length; coachindex++) {
                    if (coachlist[coachindex].Key == this.selectedCoach) {
                      this.types.push(this.acType[index]);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
      // //console.log(this.types);
      if (this.types.length > 0) {
        this.selectedActivityType = this.types[0].$key;
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
      if (this.types.length == 0) {
        this.isActivityCategoryExist = false;
        this.isExistActivitySubCategory = false;
      }
    });

    if (this.selectedTerm == undefined || this.selectedTerm == "") {
      this.sessionDetails.IsTerm = false;
    }
    else {
      this.sessionDetails.IsTerm = true;
      this.terms.forEach(element => {
        if (element.$key == this.selectedTerm) {
          this.sessionDetails.TermKey = element.$key;
          this.termForSession.isForAllActivity = element.isForAllActivity;
          this.termForSession.TermComments = element.TermComments;
          this.termForSession.TermEndDate = element.TermEndDate;
          this.termForSession.TermName = element.TermName;
          this.termForSession.TermNoOfWeeks = element.TermNoOfWeeks;
          this.termForSession.TermPayByDate = element.TermPayByDate;
          this.termForSession.TermStartDate = element.TermStartDate;
          this.sessionDetails.StartDate = this.termForSession.TermStartDate;
          this.sessionDetails.EndDate = this.termForSession.TermEndDate;
          //this.sessionDetails.PayByDate = this.termForSession.TermPayByDate;
        }
      });
    }

  }




  //onchange of activity type this method will call
  //Done
  onChangeActivity() {
    this.activitySubCategoryList = [];
    this.activityCategoryList = [];
    this.types.forEach(element => {
      if (element.$key == this.selectedActivityType) {
        this.activityObj = element;
        // this.getCoachListForGroup();

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
    //console.log(this.activityObj);
  }





  onChangeActivityCategory() {
    this.activityCategoryList.forEach(element => {
      if (element.Key == this.selectActivityCategory) {
        this.activityCategoryObj = element;
        this.isExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
        if (this.activityCategoryObj.IsExistActivitySubCategory) {
          this.activitySubCategoryList = this.commonService.convertFbObjectToArray(this.activityCategoryObj.ActivitySubCategory);
          this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
        }
      }
    });
  }




  selectDays(day, index) {
    let isPresent = false;

    switch (day) {
      case "Mon":
        this.isSelectMon = !this.isSelectMon;
        break;
      case "Tue":
        this.isSelectTue = !this.isSelectTue;
        break;
      case "Wed":
        this.isSelectWed = !this.isSelectWed;
        break;
      case "Thu":
        this.isSelectThu = !this.isSelectThu;
        break;
      case "Fri":
        this.isSelectFri = !this.isSelectFri;
        break;
      case "Sat":
        this.isSelectSat = !this.isSelectSat;
        break;
      case "Sun":
        this.isSelectSun = !this.isSelectSun;
        break;
    }

    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i] == index) {
        this.days.splice(i, 1);
        isPresent = true;
      }
    }
    if (!isPresent) {
      this.days.push(index);
    }
  }

  selectedDayDetails(day) {
    if (this.sessionDetails.Days == "") {
      this.sessionDetails.Days += day;
    }
    else {
      this.sessionDetails.Days += "," + day;
    }
  }



  showToast(m: string) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }


  validationForGroupSessionCreation() {

    if (this.selectedClub == "" || this.selectedClub == undefined) {
      let message = "Please select a venue.";
      this.showToast(message);
      return false;
      // alert(message);
    }
    else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
      let message = "Please select term for the session.";
      this.showToast(message);
      return false;
    }
    else if (this.activityObj.$key == "" || this.activityObj.$key == undefined) {
      let message = "Please select an activity for the session creation.";
      this.showToast(message);
      return false;
    }
    else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
      let message = "Please select a coach for the session creation.";
      this.showToast(message);
      return false;
    }
    else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.SessionName == "" || this.sessionDetails.SessionName == undefined) {
      let message = "Please enter session name.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.StartDate == "" || this.sessionDetails.StartDate == undefined) {
      let message = "Please choose session start date.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.EndDate == "" || this.sessionDetails.EndDate == undefined) {
      let message = "Please choose session end date.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.PayByDate == "" || this.sessionDetails.PayByDate == undefined) {
      let message = "Please choose session pay by date.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.StartTime == "" || this.sessionDetails.StartTime == undefined) {
      let message = "Please choose session start time.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.Duration == "" || this.sessionDetails.Duration == undefined) {
      let message = "Enter Session Duration in minutes.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.GroupSize == "" || this.sessionDetails.GroupSize == undefined) {
      let message = "Enter group size for the session.";
      this.showToast(message);
      return false;
    }
    else if (this.sessionDetails.SessionFee == "" || this.sessionDetails.SessionFee == undefined) {
      let message = "Enter session fee for the session.";
      this.showToast(message);
      return false;
    }
    else {
      return true;
    }

  }


  cancelSessionCreation() {

    let confirm = this.alertCtrl.create({
      //title: 'Use this lightsaber?',
      message: 'Are you sure, You want to cancel the session creation? ',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.navCtrl.pop();
            //console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }


  createSession() {

    let obj = { ActivityCode: '', ActivityName: '', AliasName: '', IsExistActivityCategory: false, IsActive: true };
    let coachObj = { CoachName: '', CoachKey: '', IsActive: true }
    let activityCategoryDetails = { ActivityCategoryCode: '', ActivityCategoryName: '', IsExistActivitySubCategory: false, IsActive: true };
    this.sessionDetails.ParentClubKey = this.parentClubKey;
    this.sessionDetails.ClubKey = this.selectedClub;
    this.sessionDetails.CoachKey = this.selectedCoach;
    this.sessionDetails.CoachName = this.selectedCoachName;
    this.sessionDetails.SessionType = "Group";
    this.sessionDetails.ActivityKey = this.activityObj.$key;
    this.sessionDetails.ActivityCategoryKey = this.selectActivityCategory;
    this.sessionDetails.FinancialYearKey = this.currentFinancialYear;

    //coach details
    coachObj.CoachName = this.selectedCoachName;
    coachObj.CoachKey = this.selectedCoach;
    coachObj.IsActive = true;



    //Activity details
    obj.ActivityCode = this.activityObj.ActivityCode;
    obj.ActivityName = this.activityObj.ActivityName;
    obj.AliasName = this.activityObj.AliasName;
    obj.IsExistActivityCategory = this.activityObj.IsExistActivityCategory;
    this.sessionDetails.IsExistActivityCategory = obj.IsExistActivityCategory;

    //Activity category details
    if (this.activityObj.IsExistActivityCategory) {
      activityCategoryDetails.ActivityCategoryCode = this.activityCategoryObj.ActivityCategoryCode;
      activityCategoryDetails.ActivityCategoryName = this.activityCategoryObj.ActivityCategoryName;
      activityCategoryDetails.IsExistActivitySubCategory = this.activityCategoryObj.IsExistActivitySubCategory;
      this.sessionDetails.IsExistActivitySubCategory = activityCategoryDetails.IsExistActivitySubCategory;
    }
    this.sessionDetails.Days = "";
    this.days.sort();
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      switch (this.days[daysIndex]) {
        case 1:
          this.selectedDayDetails("Mon");
          break;
        case 2:
          this.selectedDayDetails("Tue");
          break;
        case 3:
          this.selectedDayDetails("Wed");
          break;
        case 4:
          this.selectedDayDetails("Thu");
          break;
        case 5:
          this.selectedDayDetails("Fri");
          break;
        case 6:
          this.selectedDayDetails("Sat");
          break;
        case 7:
          this.selectedDayDetails("Sun");
          break;
      }
    }


    if (this.validationForGroupSessionCreation()) {

      let confirm = this.alertCtrl.create({
        //  title: 'Use this lightsaber?',
        message: 'Are you sure you want to create the session?',
        buttons: [
          {
            text: 'No',
            handler: () => {

            }
          },
          {
            text: 'Yes',
            handler: () => {

              let actSubCategoryObj = { ActivitySubCategoryCode: '', ActivitySubCategoryName: '', IsActive: true, IsEnable: '', Key: '' };
              if (this.isExistActivitySubCategory) {
                for (let acsIndex = 0; acsIndex < this.activitySubCategoryList.length; acsIndex++) {
                  if (this.activitySubCategoryList[acsIndex].Key == this.selectActivitySubCategory) {
                    actSubCategoryObj = this.activitySubCategoryList[acsIndex];
                    this.sessionDetails.ActivitySubCategoryKey = actSubCategoryObj.Key;
                  }
                }
              }


              // //session create
              this.returnKey = this.fb.saveReturningKey("/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/", this.sessionDetails);


              if (this.returnKey != undefined) {
                //keeping the activity data in session table
                this.fb.update(this.activityObj.$key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/", obj);

                //keeping the activity category in session/activity/activitycategory
                //if actvityvity category present 
                if (this.activityObj.IsExistActivityCategory) {
                  this.fb.update(this.activityCategoryObj.Key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/" + this.activityObj.$key + "/ActivityCategory/", activityCategoryDetails);
                  if (this.isExistActivitySubCategory) {
                    this.fb.update(actSubCategoryObj.Key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/" + this.activityObj.$key + "/ActivityCategory/" + this.activityCategoryObj.Key + "/ActivitySubCategory/", actSubCategoryObj);

                  }
                }

                //keep the session in coach folder
                this.fb.update(this.returnKey, "/Coach/Type2/" + this.parentClubKey + "/" + this.sessionDetails.CoachKey + "/Session/", this.sessionDetails);

              }

              if (this.returnKey != undefined && this.sessionDetails.IsTerm) {
                //push term in session
                this.fb.update(this.sessionDetails.TermKey, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Term/", this.termForSession);
              }


              //navigate to add member to session
              this.navCtrl.push("CoachAddMembershipSession", { ParentClubKey: this.parentClubKey, ClubKey: this.sessionDetails.ClubKey, CoachKey: this.sessionDetails.CoachKey, SessionKey: this.returnKey, SessionName: this.sessionName, SessionDetials: this.sessionDetails });

              let message = "Session Created successfully.Please add member to the session.";
              this.showToast(message);

              this.sessionDetails = {
                IsActive: true,
                TermKey: '',
                SessionName: 'Session',
                StartDate: '',
                EndDate: '',
                StartTime: '',
                Duration: '60',
                Days: '',
                GroupSize: '10',
                IsTerm: false,
                Comments: '',
                CoachKey: '',
                ClubKey: '',
                ParentClubKey: '',
                SessionFee: '7',
                CoachName: '',
                SessionType: '',
                ActivityKey: '',
                ActivityCategoryKey: '',
                ActivitySubCategoryKey: '',
                FinancialYearKey: '',
                IsExistActivitySubCategory: false,
                IsExistActivityCategory: false,
                PayByDate: ''
              };
              this.isExistActivitySubCategory = false;

            }
          }
        ]
      });
      confirm.present();

    }



  }


  onChangeCoach() {
    this.coachs.forEach(element => {
      if (element.CoachKey == this.selectedCoach) {
        this.selectedCoachName = element.FirstName + " " + element.MiddleName + " " + element.LastName;
      }
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }


}
