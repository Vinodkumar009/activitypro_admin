//not changed

import { Component } from "@angular/core";
import {
  ToastController,
  NavController,
  NavParams,
  AlertController,
} from "ionic-angular";
import { PopoverController } from "ionic-angular";
import { SharedServices } from "../../services/sharedservice";
// import { PopoverPage } from '../../popover/popover';
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../../services/firebase.service";
// import { Dashboard } from './../../dashboard/dashboard';

import { IonicPage } from "ionic-angular";
import { CommonService } from "../../../services/common.service";
@IonicPage()
@Component({
  selector: "editgroupsessioncoach-page",
  templateUrl: "editgroupsessioncoach.html",
})
export class CoachEditGroupSession {
  parentClubKey: any;
  themeType: number;
  venue: string = "s";
  term: string = "t1";
  activitytype: string = "a1";
  coach: string = "a";
  ageGroup = {
    initialSlide: 0,
    loop: true,
    //pager: true
  };
  category = {
    initialSlide: 0,
    loop: true,
  };
  startTime: any = 10;
  duration: any = 2;
  musicAlertOpts: { title: string; subTitle: string };

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

  sessionDetails = {
    IsActive: true,
    TermKey: "",
    SessionName: "Session",
    StartDate: "",
    EndDate: "",
    StartTime: "",
    Duration: "60",
    Days: "",
    GroupSize: "10",
    IsTerm: false,
    Comments: "",
    CoachKey: "",
    ClubKey: "",
    ParentClubKey: "",
    SessionFee: "7",
    CoachName: "",
    SessionType: "",
    ActivityKey: "",
    ActivityCategoryKey: "",
    FinancialYearKey: "",
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: "",
    IsExistActivityCategory: false,
    PayByDate: "",
  };

  editsessionDetails = {
    IsActive: true,
    $key: "",
    TermKey: "",
    SessionName: "Session",
    StartDate: "",
    EndDate: "",
    StartTime: "",
    Duration: "60",
    Days: "",
    GroupSize: "10",
    IsTerm: false,
    Comments: "",
    CoachKey: "",
    ClubKey: "",
    ParentClubKey: "",
    SessionFee: "7",
    CoachName: "",
    SessionType: "",
    ActivityKey: "",
    ActivityCategoryKey: "",
    FinancialYearKey: "",
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: "",
    IsExistActivityCategory: false,
    Member: [],
    PayByDate: "",
  };

  selectActivitySubCategory: any;

  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;

  acType: any;
  //selectedActivityObject = { ActivityCode: '', ActivityName: '', AliasName: '', IsActive: false, IsEnable: false, IsExistActivityCategory: false };

  activityCategoryObj: any;
  selectActivityCategory: any;

  isExistActivityCategory = false;
  isExistActivitySubCategory = false;

  activitySubCategoryList = [];

  selectedCoachObj = {};
  returnKey: any;
  sessionName: any;
  selectedCoachName: any;
  activityObj = {
    $key: "",
    ActivityName: "",
    ActivityCode: "",
    AliasName: "",
    Coach: [],
    ActivityCategory: "",
    IsActive: false,
    IsEnable: false,
    IsExistActivityCategory: false,
  };
  activityCategoryList = [];
  termForSession = {
    IsActive: false,
    TermComments: "",
    TermEndDate: "",
    TermName: "",
    TermNoOfWeeks: "",
    TermPayByDate: "",
    TermStartDate: "",
    isForAllActivity: false,
  };

  constructor(
    public commonService: CommonService,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    storage: Storage,
    public fb: FirebaseService,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController
  ) {
    this.themeType = sharedservice.getThemeType();

    this.editsessionDetails = navParams.get("SessionDetails");
    this.sessionName = "Group";
    this.selectedClub = this.editsessionDetails.ClubKey;
    this.parentClubKey = this.editsessionDetails.ParentClubKey;
    this.selectActivityCategory = this.editsessionDetails.ActivityCategoryKey;
    this.selectedActivityType = this.editsessionDetails.ActivityKey;
    this.selectedTerm = this.editsessionDetails.TermKey;

    //session detials comming from manage session page
    this.sessionDetails.ActivitySubCategoryKey =
      this.editsessionDetails.ActivitySubCategoryKey;
    this.sessionDetails.ActivityCategoryKey =
      this.editsessionDetails.ActivityCategoryKey;
    this.sessionDetails.TermKey = this.editsessionDetails.TermKey;
    this.sessionDetails.SessionName = this.editsessionDetails.SessionName;
    this.sessionDetails.StartDate = this.editsessionDetails.StartDate;
    this.sessionDetails.EndDate = this.editsessionDetails.EndDate;
    this.sessionDetails.StartTime = this.editsessionDetails.StartTime;
    this.sessionDetails.Duration = this.editsessionDetails.Duration;
    this.sessionDetails.Days = this.editsessionDetails.Days;
    this.sessionDetails.GroupSize = this.editsessionDetails.GroupSize;
    this.sessionDetails.IsTerm = this.editsessionDetails.IsTerm;
    this.sessionDetails.Comments = this.editsessionDetails.Comments;
    this.sessionDetails.CoachKey = this.editsessionDetails.CoachKey;
    this.sessionDetails.ClubKey = this.editsessionDetails.ClubKey;
    this.sessionDetails.ParentClubKey = this.editsessionDetails.ParentClubKey;
    this.sessionDetails.SessionFee = this.editsessionDetails.SessionFee;
    this.selectedCoachName = this.sessionDetails.CoachName =
      this.editsessionDetails.CoachName;
    this.sessionDetails.SessionType = this.editsessionDetails.SessionType;
    this.sessionDetails.ActivityKey = this.editsessionDetails.ActivityKey;
    this.sessionDetails.ActivityCategoryKey =
      this.editsessionDetails.ActivityCategoryKey;
    this.isExistActivityCategory = this.sessionDetails.IsExistActivityCategory =
      this.editsessionDetails.IsExistActivityCategory;
    this.isExistActivitySubCategory =
      this.sessionDetails.IsExistActivitySubCategory =
        this.editsessionDetails.IsExistActivitySubCategory;
    this.sessionDetails.FinancialYearKey =
      this.editsessionDetails.FinancialYearKey;
    this.sessionDetails.PayByDate = this.editsessionDetails.PayByDate;
    let x = this.sessionDetails.Days.split(",");

    for (let i = 0; i < x.length; i++) {
      switch (x[i]) {
        case "Mon":
          this.days.push(1);
          this.isSelectMon = true;
          break;
        case "Tue":
          this.isSelectTue = true;
          this.days.push(2);
          break;
        case "Wed":
          this.isSelectWed = true;
          this.days.push(3);
          break;
        case "Thu":
          this.isSelectThu = true;
          this.days.push(4);
          break;
        case "Fri":
          this.isSelectFri = true;
          this.days.push(5);
          break;
        case "Sat":
          this.isSelectSat = true;
          this.days.push(6);
          break;
        case "Sun":
          this.isSelectSun = true;
          this.days.push(7);
          break;
      }
    }

    this.themeType = sharedservice.getThemeType();
    this.getClubList();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }

  //initially call to get club list
  //initial call
  getClubList() {
    this.fb
      .getAllWithQuery("/Club/Type2/" + this.parentClubKey, {
        orderByChild: "IsEnable",
        equalTo: true,
      })
      .subscribe((data) => {
        this.clubs = data;
        if (data.length > 0) {
          this.getFinancialYearList();
        }
      });
  }

  //done
  // get financial year for term
  getFinancialYearList() {
    this.fb
      .getAll("/FinancialYear/Type2/" + this.parentClubKey)
      .subscribe((data) => {
        this.financialYears = data;
        if (this.financialYears.length != 0) {
          this.financialYears.forEach((element) => {
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
    this.fb
      .getAll(
        "/Term/Type2/" +
          this.parentClubKey +
          "/" +
          this.selectedClub +
          "/" +
          this.currentFinancialYear +
          "/"
      )
      .subscribe((data) => {
        this.terms = data;
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].$key == this.sessionDetails.TermKey) {
              this.sessionDetails.IsTerm = true;
              this.termForSession.isForAllActivity = data[i].isForAllActivity;
              this.termForSession.TermComments = data[i].TermComments;
              this.termForSession.TermEndDate = data[i].TermEndDate;
              this.termForSession.TermName = data[i].TermName;
              this.termForSession.TermNoOfWeeks = data[i].TermNoOfWeeks;
              this.termForSession.TermPayByDate = data[i].TermPayByDate;
              this.termForSession.TermStartDate = data[i].TermStartDate;
            }
          }

          this.getActivityListForGroup();
        }
      });
  }

  //get activities according to term
  //initial call
  getActivityListForGroup() {
    for (let i = 0; i < this.terms.length; i++) {
      if (this.editsessionDetails.TermKey == this.terms[i].$key) {
        let initialTermActivity = this.commonService.convertFbObjectToArray(
          this.terms[i].Activity
        );
        this.fb
          .getAll(
            "/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/"
          )
          .subscribe((data) => {
            this.acType = data;
            this.types = [];
            if (data.length > 0) {
              for (let index = 0; index < this.acType.length; index++) {
                for (
                  let count = 0;
                  count < initialTermActivity.length;
                  count++
                ) {
                  if (
                    initialTermActivity[count].Key == this.acType[index].$key
                  ) {
                    this.types.push(this.acType[index]);
                    this.getCoachListForGroup();
                    if (this.isExistActivityCategory) {
                      this.getActivityCategoryListGroup();
                    }
                    //
                    break;
                  }
                }
              }
            }
          });
      }
    }
  }

  //get activity category according to activity list
  //calling from getActivityList method
  //Done
  getActivityCategoryListGroup() {
    this.activityCategoryList = [];
    this.activityCategoryList = this.commonService.convertFbObjectToArray(
      this.activityObj.ActivityCategory
    );

    for (let index = 0; index < this.activityCategoryList.length; index++) {
      if (
        this.sessionDetails.ActivityCategoryKey ==
        this.activityCategoryList[index].Key
      ) {
        this.activityCategoryObj = this.activityCategoryList[index];
      }
    }
    if (this.activityCategoryObj != undefined) {
      if (this.isExistActivitySubCategory) {
        this.activitySubCategoryList =
          this.commonService.convertFbObjectToArray(
            this.activityCategoryObj.ActivitySubCategory
          );
        for (let loop = 0; loop < this.activitySubCategoryList.length; loop++) {
          if (
            this.editsessionDetails.ActivitySubCategoryKey ==
            this.activitySubCategoryList[loop].Key
          ) {
            this.selectActivitySubCategory =
              this.activitySubCategoryList[loop].Key;
          }
        }
      }
    }
  }

  //called from getActivityList
  //comming data according to the activity selected of a venue
  //showing coach accroding to the activity table
  //Done
  getCoachListForGroup() {
    //let coach = [];
    for (let i = 0; i < this.types.length; i++) {
      if (this.types[i].$key == this.selectedActivityType) {
        this.activityObj = this.types[i];
        if (this.activityObj.Coach != undefined) {
          this.coachs = this.commonService.convertFbObjectToArray(
            this.activityObj.Coach
          );
        }
        this.selectedCoach = this.editsessionDetails.CoachKey;
      }
    }
  }

  //
  //  term change
  //

  onChangeOfTerm() {
    this.selectedActivityType = "";
    this.types = [];
    this.selectedCoach = [];
    this.coachs = [];
    this.selectedCoach = "";
    this.selectedCoachName = "";
    this.activityCategoryList = [];
    this.selectActivityCategory = "";
    this.selectActivitySubCategory = "";
    this.activitySubCategoryList = [];

    let selectedIndex = 0;
    for (let i = 0; i < this.terms.length; i++) {
      if (this.terms[i].$key == this.selectedTerm) {
        selectedIndex = i;
        break;
      }
    }
    let initialTermActivity = this.commonService.convertFbObjectToArray(
      this.terms[selectedIndex].Activity
    );

    this.fb
      .getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/")
      .subscribe((data) => {
        this.acType = data;
        this.types = [];
        if (data.length > 0) {
          for (let index = 0; index < this.acType.length; index++) {
            for (let count = 0; count < initialTermActivity.length; count++) {
              if (initialTermActivity[count].Key == this.acType[index].$key) {
                this.types.push(this.acType[index]);
                break;
              }
            }
          }
        }
        if (this.types.length > 0) {
          this.selectedActivityType = this.acType[0].$key;
          this.activityObj = this.types[0];

          //onchange of term change coach
          this.coachs = this.commonService.convertFbObjectToArray(
            this.activityObj.Coach
          );
          this.selectedCoach = this.coachs[0].Key;
          this.selectedCoachName =
            this.coachs[0].FirstName +
            " " +
            this.coachs[0].MiddleName +
            " " +
            this.coachs[0].LastName;

          //if term change activity will change

          if (!this.activityObj.IsExistActivityCategory) {
            this.isExistActivityCategory = false;
            this.isExistActivitySubCategory = false;
          }
          if (this.activityObj.IsExistActivityCategory) {
            this.isExistActivityCategory = true;
            this.activityCategoryList = [];
            this.activityCategoryList =
              this.commonService.convertFbObjectToArray(
                this.activityObj.ActivityCategory
              );
            this.activityCategoryObj = this.activityCategoryList[0];
            this.selectActivityCategory = this.activityCategoryList[0].Key;
            //if activity subcategory present
            this.isExistActivitySubCategory =
              this.activityCategoryObj.IsExistActivitySubCategory;
            if (this.activityCategoryObj.IsExistActivitySubCategory) {
              this.activitySubCategoryList =
                this.commonService.convertFbObjectToArray(
                  this.activityCategoryObj.ActivitySubCategory
                );
              this.selectActivitySubCategory =
                this.activitySubCategoryList[0].Key;
            }
          }
        }
      });
    if (this.selectedTerm == undefined || this.selectedTerm == "") {
      this.sessionDetails.IsTerm = false;
    } else {
      this.sessionDetails.IsTerm = true;
      this.terms.forEach((element) => {
        if (element.$key == this.selectedTerm) {
          this.sessionDetails.TermKey = element.$key;
          this.termForSession.isForAllActivity = element.isForAllActivity;
          this.termForSession.TermComments = element.TermComments;
          this.termForSession.TermEndDate = element.TermEndDate;
          this.termForSession.TermName = element.TermName;
          this.termForSession.TermNoOfWeeks = element.TermNoOfWeeks;
          this.termForSession.TermPayByDate = element.TermPayByDate;
          this.termForSession.TermStartDate = element.TermStartDate;
        }
      });
    }
  }

  //onchange of activity type this method will call
  //Done
  onChangeActivity() {
    this.types.forEach((element) => {
      if (element.$key == this.selectedActivityType) {
        this.activityObj = element;
        this.getCoachListForGroupOnChange();

        if (!this.activityObj.IsExistActivityCategory) {
          this.isExistActivityCategory = false;
          this.isExistActivitySubCategory = false;
        }
        if (this.activityObj.IsExistActivityCategory) {
          this.isExistActivityCategory = true;
          this.activityCategoryList = [];
          this.activityCategoryList = this.commonService.convertFbObjectToArray(
            this.activityObj.ActivityCategory
          );
          this.activityCategoryObj = this.activityCategoryList[0];
          this.selectActivityCategory = this.activityCategoryList[0].Key;
          //if activity subcategory present
          this.isExistActivitySubCategory =
            this.activityCategoryObj.IsExistActivitySubCategory;
          if (this.activityCategoryObj.IsExistActivitySubCategory) {
            this.activitySubCategoryList =
              this.commonService.convertFbObjectToArray(
                this.activityCategoryObj.ActivitySubCategory
              );
            this.selectActivitySubCategory =
              this.activitySubCategoryList[0].Key;
          }
        }
      }
    });
  }

  onChangeActivityCategory() {
    this.activityCategoryList.forEach((element) => {
      if (element.Key == this.selectActivityCategory) {
        this.activityCategoryObj = element;
        //if activity subcategory present
        this.isExistActivitySubCategory =
          this.activityCategoryObj.IsExistActivitySubCategory;
        if (this.activityCategoryObj.IsExistActivitySubCategory) {
          this.activitySubCategoryList =
            this.commonService.convertFbObjectToArray(
              this.activityCategoryObj.ActivitySubCategory
            );
          this.selectActivitySubCategory = this.activitySubCategoryList[0].Key;
        }
      }
    });
  }

  //called from onChangeActivity
  //comming data according to the activity selected of a venue
  //showing coach accroding to the activity table
  //Done
  getCoachListForGroupOnChange() {
    this.coachs = [];
    if (this.activityObj.Coach != undefined) {
      this.coachs = this.commonService.convertFbObjectToArray(
        this.activityObj.Coach
      );
      this.selectedCoach = this.coachs[0].CoachKey;
      this.selectedCoachName =
        this.coachs[0].FirstName +
        " " +
        this.coachs[0].MiddleName +
        " " +
        this.coachs[0].LastName;
    } else {
      this.selectedCoach = "";
      this.selectedCoachName = "";
      this.coachs = [];
    }
  }

  onChangeCoach() {
    this.coachs.forEach((element) => {
      if (element.CoachKey == this.selectedCoach) {
        this.selectedCoachName =
          element.FirstName + " " + element.MiddleName + " " + element.LastName;
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

  validationForGroupSessionCreation() {
    if (this.selectedClub == "" || this.selectedClub == undefined) {
      let message = "Please select a venue.";
      this.showToast(message, 3000);
      return false;
      // alert(message);
    } else if (this.selectedTerm == "" || this.selectedTerm == undefined) {
      let message = "Please select term for the session.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.activityObj.$key == "" ||
      this.activityObj.$key == undefined
    ) {
      let message = "Please select an activity for the session creation.";
      this.showToast(message, 3000);
      return false;
    } else if (this.selectedCoach == "" || this.selectedCoach == undefined) {
      let message = "Please select a coach for the session creation.";
      this.showToast(message, 3000);
      return false;
    } else if (this.days.length == 0) {
      let message = "Please select a day for the session.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.SessionName == "" ||
      this.sessionDetails.SessionName == undefined
    ) {
      let message = "Please enter session name.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.StartDate == "" ||
      this.sessionDetails.StartDate == undefined
    ) {
      let message = "Please choose session start date.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.EndDate == "" ||
      this.sessionDetails.EndDate == undefined
    ) {
      let message = "Please choose session end date.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.StartTime == "" ||
      this.sessionDetails.StartTime == undefined
    ) {
      let message = "Please choose session start time.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.Duration == "" ||
      this.sessionDetails.Duration == undefined
    ) {
      let message = "Enter Session Duration in minutes.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.GroupSize == "" ||
      this.sessionDetails.GroupSize == undefined
    ) {
      let message = "Enter group size for the session.";
      this.showToast(message, 3000);
      return false;
    } else if (
      this.sessionDetails.SessionFee == "" ||
      this.sessionDetails.SessionFee == undefined
    ) {
      let message = "Enter session fee for the session.";
      this.showToast(message, 3000);
      return false;
    } else {
      return true;
    }
  }

  selectedDayDetails(day) {
    if (this.sessionDetails.Days == "") {
      this.sessionDetails.Days += day;
    } else {
      this.sessionDetails.Days += "," + day;
    }
  }

  cancelSessionCreation() {
    let confirm = this.alertCtrl.create({
      //title: 'Use this lightsaber?',
      message: "Are you sure, You want to cancel the session creation? ",
      buttons: [
        {
          text: "No",
          handler: () => {
            //console.log('Disagree clicked');
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.navCtrl.pop();
            //console.log('Agree clicked');
          },
        },
      ],
    });
    confirm.present();
  }

  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: "bottom",
    });
    toast.present();
  }

  //session creation method
  createSession() {
    let obj = {
      ActivityCode: "",
      ActivityName: "",
      AliasName: "",
      IsExistActivityCategory: false,
      IsActive: true,
    };
    let activityCategoryDetails = {
      ActivityCategoryCode: "",
      ActivityCategoryName: "",
      IsExistActivitySubCategory: false,
      IsActive: false,
    };
    this.sessionDetails.ParentClubKey = this.parentClubKey;
    this.sessionDetails.ClubKey = this.selectedClub;
    this.sessionDetails.CoachKey = this.selectedCoach;
    this.sessionDetails.CoachName = this.selectedCoachName;
    this.sessionDetails.SessionType = "Group";
    this.sessionDetails.ActivityKey = this.activityObj.$key;
    this.sessionDetails.ActivityCategoryKey = this.selectActivityCategory;
    this.sessionDetails.FinancialYearKey = this.currentFinancialYear;

    //Activity details
    obj.ActivityCode = this.activityObj.ActivityCode;
    obj.ActivityName = this.activityObj.ActivityName;
    obj.AliasName = this.activityObj.AliasName;
    obj.IsExistActivityCategory = this.activityObj.IsExistActivityCategory;
    obj.IsActive = true;
    this.sessionDetails.IsExistActivityCategory = obj.IsExistActivityCategory;

    //Activity category details
    if (this.activityObj.IsExistActivityCategory) {
      activityCategoryDetails.ActivityCategoryCode =
        this.activityCategoryObj.ActivityCategoryCode;
      activityCategoryDetails.ActivityCategoryName =
        this.activityCategoryObj.ActivityCategoryName;
      activityCategoryDetails.IsExistActivitySubCategory =
        this.activityCategoryObj.IsExistActivitySubCategory;
      activityCategoryDetails.IsActive = true;
      this.sessionDetails.IsExistActivitySubCategory =
        activityCategoryDetails.IsExistActivitySubCategory;
      this.editsessionDetails.ActivityCategoryKey =
        this.activityCategoryObj.Key;
    } else {
      this.sessionDetails.IsExistActivityCategory = false;
      this.editsessionDetails.ActivityCategoryKey = "";
    }
    this.sessionDetails.Days = "";
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {
      this.days.sort();
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
        message: "Are you sure, You want to edit the session?",
        buttons: [
          {
            text: "No",
            handler: () => {},
          },
          {
            text: "Yes",
            handler: () => {
              let actSubCategoryObj = {
                ActivitySubCategoryCode: "",
                ActivitySubCategoryName: "",
                IsActive: false,
                IsEnable: "",
                Key: "",
              };
              if (this.isExistActivitySubCategory) {
                for (
                  let acsIndex = 0;
                  acsIndex < this.activitySubCategoryList.length;
                  acsIndex++
                ) {
                  if (
                    this.activitySubCategoryList[acsIndex].Key ==
                    this.selectActivitySubCategory
                  ) {
                    actSubCategoryObj = this.activitySubCategoryList[acsIndex];
                    this.sessionDetails.ActivitySubCategoryKey =
                      actSubCategoryObj.Key;
                    this.sessionDetails.IsExistActivitySubCategory = true;
                    actSubCategoryObj.IsActive = true;
                  }
                }
              } else {
                this.sessionDetails.IsExistActivitySubCategory = false;
                this.sessionDetails.ActivitySubCategoryKey = "";
              }

              //make termForSession is active true here
              this.termForSession.IsActive = true;

              let memberArray = this.commonService.convertFbObjectToArray(
                this.editsessionDetails.Member
              );

              //if coach will change
              if (
                this.sessionDetails.CoachKey != this.editsessionDetails.CoachKey
              ) {
                //keep IsActive false of session folder
                this.fb.update(
                  this.editsessionDetails.$key,
                  "/Session/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.ClubKey +
                    "/" +
                    this.editsessionDetails.CoachKey +
                    "/" +
                    this.sessionDetails.SessionType +
                    "/",
                  { IsActive: false }
                );
                //keep session in new coach
                this.fb.update(
                  this.editsessionDetails.$key,
                  "/Session/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.ClubKey +
                    "/" +
                    this.sessionDetails.CoachKey +
                    "/" +
                    this.sessionDetails.SessionType +
                    "/",
                  this.sessionDetails
                );

                //updating session details in coach folder
                this.fb.update(
                  this.editsessionDetails.$key,
                  "/Coach/Type2/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.CoachKey +
                    "/Session/",
                  this.sessionDetails
                );

                //update session detials in coach folder is activie false
                this.fb.update(
                  this.editsessionDetails.$key,
                  "/Coach/Type2/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.editsessionDetails.CoachKey +
                    "/Session/",
                  { IsActive: false }
                );

                //push term in session
                this.fb.update(
                  this.sessionDetails.TermKey,
                  "/Session/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.ClubKey +
                    "/" +
                    this.sessionDetails.CoachKey +
                    "/" +
                    this.sessionDetails.SessionType +
                    "/" +
                    this.editsessionDetails.$key +
                    "/Term/",
                  this.termForSession
                );

                //push activity in sessin
                this.fb.update(
                  this.activityObj.$key,
                  "/Session/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.ClubKey +
                    "/" +
                    this.sessionDetails.CoachKey +
                    "/" +
                    this.sessionDetails.SessionType +
                    "/" +
                    this.editsessionDetails.$key +
                    "/Activity/",
                  obj
                );

                //keeping the activity category in session/activity/activitycategory
                //if actvityvity category present

                if (this.activityObj.IsExistActivityCategory) {
                  this.fb.update(
                    this.activityCategoryObj.Key,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Activity/" +
                      this.activityObj.$key +
                      "/ActivityCategory/",
                    activityCategoryDetails
                  );
                  if (activityCategoryDetails.IsExistActivitySubCategory) {
                    this.fb.update(
                      actSubCategoryObj.Key,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Activity/" +
                        this.activityObj.$key +
                        "/ActivityCategory/" +
                        this.activityCategoryObj.Key +
                        "/ActivitySubCategory/",
                      actSubCategoryObj
                    );
                  }
                }

                //not needed as of now
                //update session details in member folder
                for (let i = 0; i < memberArray.length; i++) {
                  //updating session detials in member folder
                  this.fb.update(
                    memberArray[i].Key,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Member/",
                    memberArray[i]
                  );

                  //keeping the session details in member folder
                  this.fb.update(
                    this.editsessionDetails.$key,
                    "/Member/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      memberArray[i].Key +
                      "/Session/",
                    this.sessionDetails
                  );

                  //keeping member details in coach folder
                  this.fb.update(
                    memberArray[i].Key,
                    "/Coach/Type2/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/Session/" +
                      this.editsessionDetails.$key +
                      "/Member/",
                    memberArray[i]
                  );
                }
                if (
                  this.editsessionDetails.SessionFee !=
                  this.sessionDetails.SessionFee
                ) {
                  //update session details in member folder
                  for (let i = 0; i < memberArray.length; i++) {
                    let x = (
                      parseFloat(this.sessionDetails.SessionFee) -
                      parseFloat(memberArray[i].AmountPaid)
                    ).toString();
                    let status = "Due";
                    //push Members in session folder what already added to the previous coach
                    this.fb.update(
                      memberArray[i].Key,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Member/",
                      {
                        TotalFeesAmount: this.sessionDetails.SessionFee,
                        AmountDue: x,
                      }
                    );
                    if (x == "0") {
                      status = "Paid";
                    }
                    this.fb.update(
                      memberArray[i].Key,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Member/",
                      { AmountPayStatus: status }
                    );

                    //updating in member folder
                    this.fb.update(
                      this.editsessionDetails.$key,
                      "/Member/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.editsessionDetails.ClubKey +
                        "/" +
                        memberArray[i].Key +
                        "/Session/",
                      {
                        TotalFeesAmount: this.sessionDetails.SessionFee,
                        AmountDue: x,
                        AmountPayStatus: status,
                      }
                    );

                    //keeping session fees detials in coach folder
                    this.fb.update(
                      memberArray[i].Key,
                      "/Coach/Type2/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/Session/" +
                        this.editsessionDetails.$key +
                        "/Member/",
                      {
                        TotalFeesAmount: this.sessionDetails.SessionFee,
                        AmountDue: x,
                        AmountPayStatus: status,
                      }
                    );
                  }
                }

                let message =
                  "Session edited successfully. We added Members who are alerady added to the previous coach.";
                this.showToast(message, 8000);
              } else if (
                this.sessionDetails.CoachKey == this.editsessionDetails.CoachKey
              ) {
                //if some changes happend in session keep the session detials in session folder
                this.fb.update(
                  this.editsessionDetails.$key,
                  "/Session/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.ClubKey +
                    "/" +
                    this.sessionDetails.CoachKey +
                    "/" +
                    this.sessionDetails.SessionType +
                    "/",
                  this.sessionDetails
                );

                //update session detials in member folder  and coach folder
                this.fb.update(
                  this.editsessionDetails.$key,
                  "/Coach/Type2/" +
                    this.sessionDetails.ParentClubKey +
                    "/" +
                    this.sessionDetails.CoachKey +
                    "/Session/",
                  this.sessionDetails
                );

                //update session folder by sending session details to the next screen adding memmber
                for (let i = 0; i < memberArray.length; i++) {
                  //keeping the session details in member folder
                  this.fb.update(
                    this.editsessionDetails.$key,
                    "/Member/" +
                      this.editsessionDetails.ParentClubKey +
                      "/" +
                      this.editsessionDetails.ClubKey +
                      "/" +
                      memberArray[i].Key +
                      "/Session/",
                    this.sessionDetails
                  );
                }

                //if term will change
                if (
                  this.sessionDetails.TermKey != this.editsessionDetails.TermKey
                ) {
                  //make previously captured term in session folder IsActive flag to false
                  this.fb.update(
                    this.editsessionDetails.TermKey,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Term/",
                    { IsActive: false }
                  );
                  //push term in session
                  this.fb.update(
                    this.sessionDetails.TermKey,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Term/",
                    this.termForSession
                  );
                }

                //if activity has changed

                if (
                  this.editsessionDetails.ActivityKey != this.activityObj.$key
                ) {
                  //1st step updating isactive to false of activity
                  this.fb.update(
                    this.editsessionDetails.ActivityKey,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Activity/",
                    { IsActive: false }
                  );

                  //2nd step
                  this.fb.update(
                    this.activityObj.$key,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Activity/",
                    obj
                  );

                  //keeping the activity category in session/activity/activitycategory
                  //if actvityvity category present

                  if (this.activityObj.IsExistActivityCategory) {
                    this.fb.update(
                      this.activityCategoryObj.Key,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Activity/" +
                        this.activityObj.$key +
                        "/ActivityCategory/",
                      activityCategoryDetails
                    );
                    if (activityCategoryDetails.IsExistActivitySubCategory) {
                      this.fb.update(
                        actSubCategoryObj.Key,
                        "/Session/" +
                          this.sessionDetails.ParentClubKey +
                          "/" +
                          this.sessionDetails.ClubKey +
                          "/" +
                          this.sessionDetails.CoachKey +
                          "/" +
                          this.sessionDetails.SessionType +
                          "/" +
                          this.editsessionDetails.$key +
                          "/Activity/" +
                          this.activityObj.$key +
                          "/ActivityCategory/" +
                          this.activityCategoryObj.Key +
                          "/ActivitySubCategory/",
                        actSubCategoryObj
                      );
                    }
                  }
                } else if (
                  this.sessionDetails.ActivityCategoryKey !=
                  this.editsessionDetails.ActivityCategoryKey
                ) {
                  //if (this.activityObj.IsExistActivityCategory) {
                  ///updating IsActive flag of activity category to false
                  if (this.editsessionDetails.ActivityCategoryKey != "") {
                    this.fb.update(
                      this.editsessionDetails.ActivityCategoryKey,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Activity/" +
                        this.editsessionDetails.ActivityKey +
                        "/ActivityCategory/",
                      { IsActive: false }
                    );
                  }
                  //keeping new data to activity folder
                  this.fb.update(
                    this.sessionDetails.ActivityCategoryKey,
                    "/Session/" +
                      this.sessionDetails.ParentClubKey +
                      "/" +
                      this.sessionDetails.ClubKey +
                      "/" +
                      this.sessionDetails.CoachKey +
                      "/" +
                      this.sessionDetails.SessionType +
                      "/" +
                      this.editsessionDetails.$key +
                      "/Activity/" +
                      this.editsessionDetails.ActivityKey +
                      "/ActivityCategory/",
                    activityCategoryDetails
                  );

                  //if activity sub category is present
                  if (activityCategoryDetails.IsExistActivitySubCategory) {
                    this.fb.update(
                      this.sessionDetails.ActivitySubCategoryKey,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Activity/" +
                        this.editsessionDetails.ActivityKey +
                        "/ActivityCategory/" +
                        this.sessionDetails.ActivityCategoryKey,
                      actSubCategoryObj
                    );
                  }
                } else if (
                  this.sessionDetails.ActivitySubCategoryKey !=
                  this.editsessionDetails.ActivitySubCategoryKey
                ) {
                  //if activity sub category is present
                  if (this.editsessionDetails.ActivitySubCategoryKey != "") {
                    this.fb.update(
                      this.editsessionDetails.ActivitySubCategoryKey,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Activity/" +
                        this.editsessionDetails.ActivityKey +
                        "/ActivityCategory/" +
                        this.editsessionDetails.ActivityCategoryKey +
                        "/ActivitySubCategory/",
                      { IsActive: false }
                    );
                  }
                  //keep new data in activity subcategory
                  if (
                    this.selectActivitySubCategory != "" ||
                    this.selectActivitySubCategory != undefined
                  ) {
                    this.fb.update(
                      this.selectActivitySubCategory,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Activity/" +
                        this.editsessionDetails.ActivityKey +
                        "/ActivityCategory/" +
                        this.editsessionDetails.ActivityCategoryKey +
                        "/ActivitySubCategory/",
                      actSubCategoryObj
                    );
                  }
                }

                if (
                  this.editsessionDetails.SessionFee !=
                  this.sessionDetails.SessionFee
                ) {
                  //update session details in member folder
                  for (let i = 0; i < memberArray.length; i++) {
                    let x = (
                      parseFloat(this.sessionDetails.SessionFee) -
                      parseFloat(memberArray[i].AmountPaid)
                    ).toString();
                    let status = "Due";
                    //push Members in session folder what already added to the previous coach
                    this.fb.update(
                      memberArray[i].Key,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Member/",
                      {
                        TotalFeesAmount: this.sessionDetails.SessionFee,
                        AmountDue: x,
                      }
                    );
                    if (x == "0") {
                      status = "Paid";
                    }
                    this.fb.update(
                      memberArray[i].Key,
                      "/Session/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.ClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/" +
                        this.sessionDetails.SessionType +
                        "/" +
                        this.editsessionDetails.$key +
                        "/Member/",
                      { AmountPayStatus: status }
                    );

                    //updating in member folder
                    this.fb.update(
                      this.editsessionDetails.$key,
                      "/Member/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.editsessionDetails.ClubKey +
                        "/" +
                        memberArray[i].Key +
                        "/Session/",
                      {
                        TotalFeesAmount: this.sessionDetails.SessionFee,
                        AmountDue: x,
                        AmountPayStatus: status,
                      }
                    );

                    //keeping session fees detials in coach folder
                    this.fb.update(
                      memberArray[i].Key,
                      "/Coach/Type2/" +
                        this.sessionDetails.ParentClubKey +
                        "/" +
                        this.sessionDetails.CoachKey +
                        "/Session/" +
                        this.editsessionDetails.$key +
                        "/Member/",
                      {
                        TotalFeesAmount: this.sessionDetails.SessionFee,
                        AmountDue: x,
                        AmountPayStatus: status,
                      }
                    );
                  }
                }

                let message = "Session edited successfully.";
                this.showToast(message, 8000);
              }

              //navigate to add member to session
              //this.navCtrl.push(Type2EditMembershipSession, { OldSessionDetails: this.editsessionDetails, NewSessionDetials: this.sessionDetails });
              this.navCtrl.pop();

              this.sessionDetails = {
                IsActive: false,
                TermKey: "",
                SessionName: "Session",
                StartDate: "",
                EndDate: "",
                StartTime: "",
                Duration: "60",
                Days: "",
                GroupSize: "10",
                IsTerm: false,
                Comments: "",
                CoachKey: "",
                ClubKey: "",
                ParentClubKey: "",
                SessionFee: "7",
                CoachName: "",
                SessionType: "",
                ActivityKey: "",
                ActivityCategoryKey: "",
                FinancialYearKey: "",
                ActivitySubCategoryKey: "",
                IsExistActivitySubCategory: false,
                IsExistActivityCategory: false,
                PayByDate: "",
              };
            },
          },
        ],
      });
      confirm.present();
    }
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
}
