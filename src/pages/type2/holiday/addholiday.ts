import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Platform, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
// AngularFire, 
//import {FirebaseListObservable } from 'angularfire2';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'add-holiday-page',
  templateUrl: 'addholiday.html'
})

export class Type2AddHoliday {
  themeType: number;
  pet: string = "puppies";
  financialYearKey: string;
  financialYear: string;
  holidayKey: any;
  parentClubKey: string;
  holidayObj = {
    HolidayName: "",
    HolidayStartDate: "",
    HolidayEndDate: "",
    IsForAllActivity: true,
    HolidayComments: "",
    NoOfWeeks:"",
    IsActive: true,
    IsEnable: true,
    CreatedDate:0,
    CreatedBy: 'Parent Club',
    Activity: {}
  };
  isAndroid: boolean = false;
  yearsUpto: any;
  selectedType: any;
  allParentClubDataArr: any;
  selectedParentClubKey: any;
  allClub = [];
  selectedClub: any;
  activity: any;
  activityArr = [];
  desiredActivity = [];
  constructor(public comonService: CommonService, public toastCtrl: ToastController, public navCtrl: NavController, storage: Storage, public fb: FirebaseService, public navParams: NavParams, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    this.financialYearKey = navParams.get('financialYearKey');
    this.financialYear = navParams.get('financialYear');
    this.selectedType = "Type2";

    if (this.financialYear == 'current')
      this.yearsUpto = ((new Date().getFullYear()));
    if (this.financialYear == 'next')
      this.yearsUpto = ((new Date().getFullYear()) + 1);
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.selectedParentClubKey = club.ParentClubKey;
          this.parentClubKey = club.ParentClubKey;
          // this.getClubList();
          this.getAllActivity();
          this.getClubList();
        }
    })
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  getParentClub() {
    this.fb.getAll("/ParentClub/" + this.selectedType).subscribe((data) => {
      this.allParentClubDataArr = data;
    });
  }

  getClubList() {
    let clubSubscriber = this.fb.getAll("/Club/Type2/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {


        for (let i = 0; i < data.length; i++) {
          if (data[i].IsEnable) {
            this.allClub.push(data[i]);
          }
        }


        this.selectedClub = "All";
      }
      clubSubscriber.unsubscribe();
    });
  }

  getAllActivity() {
    let activitySubscriber = this.fb.getAll("/Activity/" + this.selectedParentClubKey).subscribe((response) => {
      this.activity = response;
      for (let i = 0; i < this.activity.length; i++) {
        let clubKey = this.activity[i].$key;

        this.activity[i] = this.comonService.convertFbObjectToArray(this.activity[i]);
        for (let j = 0; j < this.activity[i].length; j++) {

          this.activity[i][j]["ClubKey"] = clubKey;
          let isPresent = false;
          for (let k = 0; k < this.desiredActivity.length; k++) {
            if (this.activity[i][j].Key == this.desiredActivity[k].Key) {
              isPresent = true;
              break;
            }
          }
          if (!isPresent) {
            this.desiredActivity.push(this.activity[i][j]);
            this.desiredActivity[this.desiredActivity.length - 1]["IsSelected"] = true;
          }
        }
      }
      activitySubscriber.unsubscribe();

    });
  }

  onChangeClub() {
    this.desiredActivity = [];
    if (this.selectedClub == "All") {
      for (let i = 0; i < this.activity.length; i++) {
        for (let j = 0; j < this.activity[i].length; j++) {
          let isPresent = false;
          for (let k = 0; k < this.desiredActivity.length; k++) {
            if (this.activity[i][j].Key == this.desiredActivity[k].Key) {
              isPresent = true;
              break;
            }
          }
          if (!isPresent) {
            this.desiredActivity.push(this.activity[i][j]);
            this.desiredActivity[this.desiredActivity.length - 1]["IsSelected"] = true;
          }
        }
      }
    } else {




      for (let i = 0; i < this.activity.length; i++) {
        for (let j = 0; j < this.activity[i].length; j++) {
          if (this.activity[i][j]["ClubKey"] == this.selectedClub) {
            this.desiredActivity.push(this.activity[i][j]);
          }
        }
      }

    }


  }

  allActivityChange() {
    for (let i = 0; i < this.desiredActivity.length; i++) {
      this.desiredActivity[i].IsSelected = this.holidayObj.IsForAllActivity;
    }

  }
  // getClubList() {
  //   this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
  //     if (data.length > 0) {
  //       this.allClub = data;
  //       this.selectedClub = data[0].$key;
  //       this.getAllActivity();
  //     }
  //   })
  // }

  // getAllActivity() {
  //   this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
  //     this.activity = data;
  //     if (this.activity.length != undefined) {
  //       for (let i = 0; i < this.activity.length; i++) {
  //         this.activity[i].isSelect = false;
  //       }
  //     }
  //   })

  // }

  toggolSelectionActivity() {
    for(let i=0;i<this.desiredActivity.length;i++){
      this.desiredActivity[i].IsSelected=this.holidayObj.IsForAllActivity;
    }
    // if (item.IsSelected) {
    //   this.activityArr.push(item);
    // }
    // else {
    //   for (let index = 0; index < this.activityArr.length; index++) {
    //     if (item.$key == this.activityArr[index].$key) {
    //       this.activityArr.splice(index, 1);
    //       break;
    //     }

    //   }
    // }
  }




  saveHoliday() {
    if (this.validateHoliday()) {
      if (this.selectedClub == "All") {




        let holidayObjForAll = {
          HolidayName: this.holidayObj.HolidayName,
          HolidayStartDate: this.holidayObj.HolidayStartDate,
          HolidayEndDate:this.holidayObj.HolidayEndDate,
          IsForAllActivity: this.holidayObj.IsForAllActivity,
          HolidayComments: this.holidayObj.HolidayComments,
          NoOfWeeks:"",
          IsActive: true,
          IsEnable: true,
          CreatedDate:new Date().getTime(),
          CreatedBy: 'Parent Club',
          Activity: {}
        }



        for (let i = 0; i < this.activity.length; i++) {
          holidayObjForAll.Activity = {};
          let clubKey = "";
          for (let j = 0; j < this.activity[i].length; j++) {
            if (clubKey == "") {
              clubKey = this.activity[i][j].ClubKey;
            }
            holidayObjForAll.Activity[this.activity[i][j].Key] = {};
            holidayObjForAll.Activity[this.activity[i][j].Key]["ActivityCode"] = this.activity[i][j].ActivityCode;
            holidayObjForAll.Activity[this.activity[i][j].Key]["ActivityName"] = this.activity[i][j].ActivityName;
            holidayObjForAll.Activity[this.activity[i][j].Key]["AliasName"] = this.activity[i][j].AliasName;
            holidayObjForAll.Activity[this.activity[i][j].Key]["BaseFees"] = this.activity[i][j].BaseFees;
            holidayObjForAll.Activity[this.activity[i][j].Key]["IsActive"] = false;
            holidayObjForAll.Activity[this.activity[i][j].Key]["IsEnable"] = this.activity[i][j].IsEnable;
            holidayObjForAll.Activity[this.activity[i][j].Key]["IsExistActivityCategory"] = this.activity[i][j].IsExistActivityCategory;
            if (this.activity[i][j].IsExistActivityCategory) {
              holidayObjForAll.Activity[this.activity[i][j].Key]["ActivityCategory"] = this.activity[i][j].ActivityCategory;
            }
            for (let k = 0; k < this.desiredActivity.length; k++) {
              if ((this.desiredActivity[k].Key == this.activity[i][j].Key) && (this.desiredActivity[k].IsSelected)) {
                holidayObjForAll.Activity[this.activity[i][j].Key]["IsActive"] = true;
              }
            }
          }

          //console.log(this.activity);
          //console.log(this.allClub);
          //console.log("/Term/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + clubKey + "/" + this.financialYearKey + "/");
          // this.fb.saveReturningKey("/Term/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + clubKey + "/" + this.financialYearKey + "/", termObjforAll);
          this.fb.saveReturningKey("/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" +clubKey + "/" + this.financialYearKey + "/", holidayObjForAll);
        }




      } else {
        let holidayObjForAll = {
          HolidayName: this.holidayObj.HolidayName,
          HolidayStartDate: this.holidayObj.HolidayStartDate,
          HolidayEndDate:this.holidayObj.HolidayEndDate,
          IsForAllActivity: this.holidayObj.IsForAllActivity,
          HolidayComments: this.holidayObj.HolidayComments,
          NoOfWeeks:"",
          IsActive: true,
          IsEnable: true,
          CreatedDate:new Date().getTime(),
          CreatedBy: 'Parent Club',
          Activity: {}
        }

        for (let j = 0; j < this.desiredActivity.length; j++) {
          holidayObjForAll.Activity[this.desiredActivity[j].Key] = {};
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["ActivityCode"] = this.desiredActivity[j].ActivityCode;
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["ActivityName"] = this.desiredActivity[j].ActivityName;
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["AliasName"] = this.desiredActivity[j].AliasName;
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["BaseFees"] = this.desiredActivity[j].BaseFees;
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["IsActive"] = this.desiredActivity[j].IsSelected;
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["IsEnable"] = this.desiredActivity[j].IsEnable;
          holidayObjForAll.Activity[this.desiredActivity[j].Key]["IsExistActivityCategory"] = this.desiredActivity[j].IsExistActivityCategory;
          if (this.desiredActivity[j].IsExistActivityCategory) {
            holidayObjForAll.Activity[this.desiredActivity[j].Key]["ActivityCategory"] = this.desiredActivity[j].ActivityCategory;
          }

        }

        // this.fb.saveReturningKey("/Term/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.desiredActivity[0].ClubKey + "/" + this.financialYearKey + "/", termObjforAll);
        this.fb.saveReturningKey("/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.selectedClub + "/" + this.financialYearKey + "/", holidayObjForAll);
      }

      this.showToast("Holiday created successfully.", 2000);
      this.navCtrl.pop();
    }
    // if (this.validateHoliday()) {

    //   let activityObj = { ActivityCode: '', ActivityName: '', AliasName: '', IsActive: '', IsEnable: '', IsExistActivityCategory: '', BaseFees: 0 };
    //   let activityCategoryObj = { ActivityCategoryCode: '', ActivityCategoryName: '', IsActive: '', IsEnable: '', IsExistActivitySubCategory: '' }
    //   this.holidayKey = this.fb.saveReturningKey("/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.selectedClub + "/" + this.financialYearKey + "/", this.holidayObj);
    //   if (this.holidayObj.IsForAllActivity == true) {
    //     if (this.activity.length != undefined) {

    //       for (let i = 0; i < this.activity.length; i++) {

    //         activityObj.ActivityCode = this.activity[i].ActivityCode;
    //         activityObj.ActivityName = this.activity[i].ActivityName;
    //         activityObj.AliasName = this.activity[i].AliasName;
    //         activityObj.BaseFees = this.activity[i].BaseFees;
    //         activityObj.IsActive = this.activity[i].IsActive;
    //         activityObj.IsEnable = this.activity[i].IsEnable;
    //         activityObj.IsExistActivityCategory = this.activity[i].IsExistActivityCategory;
    //         this.fb.update(this.activity[i].$key, "/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.selectedClub + "/" + this.financialYearKey + "/" + this.holidayKey + "/Activity/", activityObj);

    //         if (this.activity[i].IsExistActivityCategory) {
    //           let ActivityCategory = this.comonService.convertFbObjectToArray(this.activity[i].ActivityCategory);

    //           for (let ActivityCategoryIndex = 0; ActivityCategoryIndex < ActivityCategory.length; ActivityCategoryIndex++) {
    //             activityCategoryObj.ActivityCategoryCode = ActivityCategory[ActivityCategoryIndex].ActivityCategoryCode;
    //             activityCategoryObj.ActivityCategoryName = ActivityCategory[ActivityCategoryIndex].ActivityCategoryName;
    //             activityCategoryObj.IsActive = ActivityCategory[ActivityCategoryIndex].IsActive;
    //             activityCategoryObj.IsEnable = ActivityCategory[ActivityCategoryIndex].IsEnable;
    //             activityCategoryObj.IsExistActivitySubCategory = ActivityCategory[ActivityCategoryIndex].IsExistActivitySubCategory;

    //             this.fb.update(ActivityCategory[ActivityCategoryIndex].Key, "/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.selectedClub + "/" + this.financialYearKey + "/" + this.holidayKey + "/Activity/" + this.activity[i].$key + "/ActivityCategory/", activityCategoryObj);

    //           }
    //         }



    //       }

    //     }
    //   }
    //   else {

    //     if (this.activityArr.length != undefined) {

    //       for (let i = 0; i < this.activityArr.length; i++) {

    //         activityObj.ActivityCode = this.activityArr[i].ActivityCode;
    //         activityObj.ActivityName = this.activityArr[i].ActivityName;
    //         activityObj.AliasName = this.activityArr[i].AliasName;
    //         activityObj.BaseFees = this.activityArr[i].BaseFees;
    //         activityObj.IsActive = this.activityArr[i].IsActive;
    //         activityObj.IsEnable = this.activityArr[i].IsEnable;
    //         activityObj.IsExistActivityCategory = this.activityArr[i].IsExistActivityCategory;
    //         this.fb.update(this.activityArr[i].$key, "/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.selectedClub + "/" + this.financialYearKey + "/" + this.holidayKey + "/Activity/", activityObj);

    //         if (this.activityArr[i].IsExistActivityCategory) {
    //           let ActivityCategory = this.comonService.convertFbObjectToArray(this.activityArr[i].ActivityCategory);

    //           for (let ActivityCategoryIndex = 0; ActivityCategoryIndex < ActivityCategory.length; ActivityCategoryIndex++) {
    //             activityCategoryObj.ActivityCategoryCode = ActivityCategory[ActivityCategoryIndex].ActivityCategoryCode;
    //             activityCategoryObj.ActivityCategoryName = ActivityCategory[ActivityCategoryIndex].ActivityCategoryName;
    //             activityCategoryObj.IsActive = ActivityCategory[ActivityCategoryIndex].IsActive;
    //             activityCategoryObj.IsEnable = ActivityCategory[ActivityCategoryIndex].IsEnable;
    //             activityCategoryObj.IsExistActivitySubCategory = ActivityCategory[ActivityCategoryIndex].IsExistActivitySubCategory;

    //             this.fb.update(ActivityCategory[ActivityCategoryIndex].Key, "/Holiday/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.selectedClub + "/" + this.financialYearKey + "/" + this.holidayKey + "/Activity/" + this.activityArr[i].$key + "/ActivityCategory/", activityCategoryObj);

    //           }
    //         }
    //       }
    //     }

    //   }




    //   if (this.holidayKey != undefined) {
    //     this.holidayObj = { HolidayName: "", HolidayStartDate: "", HolidayEndDate: "", IsForAllActivity: true, HolidayComments: "" };
    //     this.holidayKey = undefined;
    //     this.selectedClub = undefined;
    //     this.navCtrl.pop();
    //   }

    // }
  }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'top'
    });
    toast.present();
  }

  validateHoliday(): boolean {

    if (this.financialYearKey == "" || this.financialYearKey == undefined) {
      //alert("Select Club");
      let toast = this.toastCtrl.create({
        message: 'Financial Year Key Could not be found.Plz contact support.',
        duration: 2000
      });
      toast.present();
      return false;
    }


    if (this.selectedClub == "" || this.selectedClub == undefined) {
      //  alert("Select Club");
      let toast = this.toastCtrl.create({
        message: 'Please select a club',
        duration: 2000
      });
      toast.present();
      return false;

    }

    else if (this.holidayObj.HolidayName == "" || this.holidayObj.HolidayName == undefined) {
      // alert("Select Holiday Name");
      let toast = this.toastCtrl.create({
        message: 'Please enter holiday name',
        duration: 2000
      });
      toast.present();
      return false;

    }

    else if (this.holidayObj.HolidayStartDate == "" || this.holidayObj.HolidayStartDate == undefined) {
      // alert("Etner Holiday StartDate");
      let toast = this.toastCtrl.create({
        message: 'Please choose holiday start date',
        duration: 2000
      });
      toast.present();
      return false;

    }

    else if (this.holidayObj.HolidayEndDate == "" || this.holidayObj.HolidayEndDate == undefined) {
      //alert("Etner Holiday EndDate");
      let toast = this.toastCtrl.create({
        message: 'Please choose holiday end date',
        duration: 2000
      });
      toast.present();
      return false;

    }

    else if (this.holidayObj.HolidayComments == "" || this.holidayObj.HolidayComments == undefined) {
      // alert("Etner Holiday Comments");
      let toast = this.toastCtrl.create({
        message: 'Please etner holiday comments',
        duration: 2000
      });
      toast.present();
      return false;

    }

    else if (this.holidayObj.IsForAllActivity == undefined) {
      // alert("Select IsForAllActivity");
      let toast = this.toastCtrl.create({
        message: 'Please select a activity',
        duration: 2000
      });
      toast.present();
      return false;
    }

    else if (this.holidayObj.IsForAllActivity == false) {

      if (this.desiredActivity.length > 0 && this.validateSelectionOfAcitivity()) {

        let toast = this.toastCtrl.create({
          message: 'Please select an activity',
          duration: 2000
        });
        toast.present();
        return false;

      }
      else if (this.desiredActivity.length == 0) {
        let toast = this.toastCtrl.create({
          message: 'It seems there is no activity in ur selected club.Please contact support.',
          duration: 2000
        });
        toast.present();
        return false;
      }

    }
    return true;
  }
  validateSelectionOfAcitivity(): boolean {
    for (let i = 0; i < this.desiredActivity.length; i++) {
      if (this.desiredActivity[i].IsSelected) {
        return false;
      }
    }
    return true;
  }
  cancelHoliday() {
    //this.holidayObj = { HolidayName: "", HolidayStartDate: "", HolidayEndDate: "", IsForAllActivity: true, HolidayComments: "" };
    // this.holidayKey = undefined;
    // this.selectedClub = undefined;
    this.navCtrl.pop();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }



}
