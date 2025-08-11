import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Platform, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
//import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'edit-holiday-page',
    templateUrl: 'editholiday.html'
})

export class Type2EditHoliday {
    themeType: number;
    pet: string = "puppies";
    financialYearKey: string;
    financialYear: string;
    holidayKey: any;
    parentClubKey: string;
    holidayObj: {} = { HolidayName: "", HolidayStartDate: "", HolidayEndDate: "", IsForAllActivity: true, HolidayComments: "" };
    isAndroid: boolean = false;
    yearsUpto: any;
    slectedHolidayData: any;
    selectedClubKey: any;
    activity: any;
    selectedActivityTempArr1 = [];
    activityArr = [];
    activityEditArr = [];
    response: any;
    constructor(public comonService:CommonService,public toastCtrl: ToastController, public navCtrl: NavController, storage: Storage, public fb: FirebaseService, public navParams: NavParams, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();

        //console.log(this.themeType);
        this.isAndroid = platform.is('android');
        this.financialYearKey = navParams.get('financialYearKey');
        this.financialYear = navParams.get('financialYear');
        this.slectedHolidayData = navParams.get('holiday');
        this.selectedClubKey = navParams.get('selectedClubKey');
        this.activityArr = this.comonService.convertFbObjectToArray(this.slectedHolidayData.Activity);

      

        if (this.financialYear == 'current')
            this.yearsUpto = ((new Date().getFullYear()));
        if (this.financialYear == 'next')
            this.yearsUpto = ((new Date().getFullYear()) + 1);
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getAllActivity();
                }
        })
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

   
    // saveHoliday() {
    //   this.holidayKey = this.fb.saveReturningKey("/Holiday/" + this.parentClubKey + "/" + this.financialYearKey
    //     , this.holidayObj);
    //   if (this.holidayKey != undefined) {
    //     this.holidayObj = {};
    //     this.holidayKey = undefined;
    //   }
    // }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey).subscribe((data1) => {
            if (data1.length > 0) {
                this.activity = data1;
                if (this.activity.length != undefined) {
                    for (let i = 0; i < this.activity.length; i++) {
                        this.activity[i].isSelect = false;
                    }
                    this.getHolidayActivity();
                }
            }
        })

    }


    getHolidayActivity() {
        this.selectedActivityTempArr1 = [];
        if (this.activityArr.length != undefined) {
            for (let i = 0; i < this.activityArr.length; i++) {
                this.activityArr[i].isSelect = true;
                this.selectedActivityTempArr1.push(this.activityArr[i]);

            }
        }

        if (this.activity.length != undefined) {
            for (let i = 0; i < this.activity.length; i++) {
                for (let j = 0; j < this.activityArr.length; j++) {


                    if (this.activityArr[j].Key == this.activity[i].$key && this.activityArr[j].IsActive == true) {
                        this.activity[i].isSelect = true;
                        break;
                    }
                    else {
                        this.activity[i].isSelect = false;
                    }

                }
            }
        }

    }


    toggolSelectionActivity(item) {
        //console.log(item);
        if (item.isSelect) {
            this.activityEditArr.push(item);
        }
        else {
            for (let index = 0; index < this.activityEditArr.length; index++) {
                if (item.$key == this.activityEditArr[index].$key) {
                    this.activityEditArr.splice(index, 1);
                    break;
                }

            }
        }
        //console.clear();
        //console.log(this.activityEditArr);
    }


    toggolSelectionAll() {
        if (this.slectedHolidayData.IsForAllActivity) {
            if (this.activity.length != undefined) {
                for (let i = 0; i < this.activity.length; i++) {
                    this.activity[i].isSelect = true;
                }
            }
        }
        else {
            if (this.activity.length != undefined) {
                for (let i = 0; i < this.activity.length; i++) {
                    this.activity[i].isSelect = false;
                }
            }
        }
        //console.clear()
        //console.log(this.activity);

    }




    // updateHoliday() {

    //   this.holidayKey = this.fb.update(this.slectedHolidayData.$key, "/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey
    //     , { HolidayName: this.slectedHolidayData.HolidayName, HolidayStartDate: this.slectedHolidayData.HolidayStartDate, HolidayEndDate: this.slectedHolidayData.HolidayEndDate, IsForAllActivity: this.slectedHolidayData.IsForAllActivity, HolidayComments: this.slectedHolidayData.HolidayComments });

    //   if (this.holidayKey != undefined) {
    //     let toast = this.toastCtrl.create({
    //                   message: 'Successfully Updated',
    //                   duration: 2000
    //               });
    //               toast.present();
    //               this.holidayKey = undefined;
    //               this.navCtrl.pop();
    //   }
    // }



    updateHoliday() {

        let activityObj = { ActivityCode: '', ActivityName: '', AliasName: '', IsActive: false, IsEnable: '', IsExistActivityCategory: '', BaseFees: 0 };
        let activityCategoryObj = { ActivityCategoryCode: '', ActivityCategoryName: '', IsActive: '', IsEnable: '', IsExistActivitySubCategory: '' }
        this.response = this.fb.update(this.slectedHolidayData.$key, "/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey
            , {
                HolidayName: this.slectedHolidayData.HolidayName,
                HolidayStartDate: this.slectedHolidayData.HolidayStartDate,
                HolidayEndDate: this.slectedHolidayData.HolidayEndDate,
                IsForAllActivity: this.slectedHolidayData.IsForAllActivity,
                HolidayComments: this.slectedHolidayData.HolidayComments

            });

        if (this.selectedActivityTempArr1.length != undefined) {


            for (let i = 0; i < this.selectedActivityTempArr1.length; i++) {
                this.fb.update(this.selectedActivityTempArr1[i].Key, "/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.slectedHolidayData.$key + "/Activity/", { IsActive: false });
            }

            let isExccute = false;
            for (let i = 0; i < this.activityEditArr.length; i++) {
                for (let j = 0; j < this.selectedActivityTempArr1.length; j++) {
                    if (this.activityEditArr[i].$key == this.selectedActivityTempArr1[j].Key) {
                        this.fb.update(this.activityEditArr[i].$key, "/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.slectedHolidayData.$key + "/Activity/", { IsActive: true });
                        isExccute = true;
                        break;
                    }
                }
                if (!isExccute) {

                    activityObj.ActivityCode = this.activityEditArr[i].ActivityCode;
                    activityObj.ActivityName = this.activityEditArr[i].ActivityName;
                    activityObj.AliasName = this.activityEditArr[i].AliasName;
                    activityObj.BaseFees = this.activityEditArr[i].BaseFees;
                    activityObj.IsActive = true;
                    activityObj.IsEnable = this.activityEditArr[i].IsEnable;
                    activityObj.IsExistActivityCategory = this.activityEditArr[i].IsExistActivityCategory;
                    this.fb.update(this.activityEditArr[i].$key, "/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.slectedHolidayData.$key + "/Activity/", activityObj);

                    if (this.activityEditArr[i].IsExistActivityCategory) {
                        let ActivityCategory = this.comonService.convertFbObjectToArray(this.activityEditArr[i].ActivityCategory);

                        for (let ActivityCategoryIndex = 0; ActivityCategoryIndex < ActivityCategory.length; ActivityCategoryIndex++) {
                            activityCategoryObj.ActivityCategoryCode = ActivityCategory[ActivityCategoryIndex].ActivityCategoryCode;
                            activityCategoryObj.ActivityCategoryName = ActivityCategory[ActivityCategoryIndex].ActivityCategoryName;
                            activityCategoryObj.IsActive = ActivityCategory[ActivityCategoryIndex].IsActive;
                            activityCategoryObj.IsEnable = ActivityCategory[ActivityCategoryIndex].IsEnable;
                            activityCategoryObj.IsExistActivitySubCategory = ActivityCategory[ActivityCategoryIndex].IsExistActivitySubCategory;

                            this.response = this.fb.update(ActivityCategory[ActivityCategoryIndex].Key, "/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.slectedHolidayData.$key + "/Activity/" + this.activityEditArr[i].$key + "/ActivityCategory/", activityCategoryObj);


                        }
                    }




                }
                isExccute = false;
            }
            if (this.response != undefined) {
                //alert("successfully updated")
                let toast = this.toastCtrl.create({
                    message: 'Successfully Updated',
                    duration: 2000
                });
                toast.present();
                this.response = undefined;
                this.navCtrl.pop();
            }
            //}

        }



    }

    cancel() {
        this.slectedHolidayData = {};
        this.response = undefined;
        this.navCtrl.pop();
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }






}
