import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../services/common.service';
import moment from 'moment';
@IonicPage()
@Component({
    selector: 'editterm-page',
    templateUrl: 'editterm.html'
})

export class Type2EdiTterm {
    tillDate: number;
    termObj: any;
    themeType: number;
    isAndroid: boolean = false;
    financialYear: string;
    response: any;
    parentClubKey: any;
    financialYearKey: string;
    selectedClubKey: any;
    activityArr = [];
    activity: any;
    activityEditArr = [];
    selectedActivityTempArr1 = [];
    constructor(public commonService:CommonService, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public navParams: NavParams, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
        this.selectedClubKey = navParams.get('selectedClubKey');
        this.financialYear = navParams.get('financialYear');
        this.financialYearKey = navParams.get('financialYearKey');
        this.termObj = navParams.get('termDetails');
        if(!this.termObj.HalfTermStartDate){
            this.termObj.HalfTermStartDate = ''
        }
        if(!this.termObj.HalfTermEndDate){
            this.termObj.HalfTermEndDate = ''
        }
        this.activityArr = this.commonService.convertFbObjectToArray(this.termObj.Activity);

        if (this.financialYear == "current") {
            this.tillDate = new Date().getFullYear();
        }
        else if (this.financialYear == "next") {
            this.tillDate = new Date().getFullYear() + 1;
        }

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo) {
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getAllActivity();
                }
            }
        });
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

 


    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey).subscribe((data1) => {
            if (data1.length > 0) {
                this.activity = data1;
                if (this.activity.length != undefined) {
                    for (let i = 0; i < this.activity.length; i++) {
                        this.activity[i].isSelect = false;
                    }
                    this.getTermActivity();
                }
            }
        })

    }


    getTermActivity() {
        this.selectedActivityTempArr1 = [];
        if (this.activityArr.length != undefined) {
            for (let i = 0; i < this.activityArr.length; i++) {
                this.activityArr[i].isSelect = true;
                this.selectedActivityTempArr1.push(this.activityArr[i]);
            }
        }

        if (this.activity.length != undefined) {
            for (let i = 0; i < this.activity.length; i++) {
                // Reset to false first
                this.activity[i].isSelect = false;
                
                // Check if this activity is in the selected activities
                for (let j = 0; j < this.activityArr.length; j++) {
                    if (this.activityArr[j].Key == this.activity[i].$key && this.activityArr[j].IsActive == true) {
                        this.activity[i].isSelect = true;
                        this.activityEditArr.push(this.activity[i]);
                        break;
                    }
                }
            }
        }
    }

    toggolSelectionActivity(item) {
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
    }

    toggolSelectionAll() {
        if (this.termObj.isForAllActivity) {
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
    }
    updateTerm() {

        let activityObj = { ActivityCode: '', ActivityName: '', AliasName: '', IsActive: false, IsEnable: '', IsExistActivityCategory: '', BaseFees: 0 };
        let activityCategoryObj = { ActivityCategoryCode: '', ActivityCategoryName: '', IsActive: '', IsEnable: '', IsExistActivitySubCategory: '' }
        this.response = this.fb.update(this.termObj.$key, "/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey
            , {
                TermComments: this.termObj.TermComments,
                TermEndDate: this.termObj.TermEndDate,
                TermName: this.termObj.TermName,
                TermNoOfWeeks: this.termObj.TermNoOfWeeks,
                TermPayByDate: this.termObj.TermPayByDate,
                HalfTermStartDate: this.termObj.HalfTermStartDate,
                HalfTermEndDate: this.termObj.HalfTermEndDate,
                TermStartDate: this.termObj.TermStartDate,
                isForAllActivity: this.termObj.isForAllActivity,
                CreatedDate:new Date().getTime()
            });

        if (this.selectedActivityTempArr1.length != undefined) {


            for (let i = 0; i < this.selectedActivityTempArr1.length; i++) {
                this.fb.update(this.selectedActivityTempArr1[i].Key, "/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.termObj.$key + "/Activity/", { IsActive: false });
            }

            let isExccute = false;
            for (let i = 0; i < this.activityEditArr.length; i++) {
                for (let j = 0; j < this.selectedActivityTempArr1.length; j++) {
                    if (this.activityEditArr[i].$key == this.selectedActivityTempArr1[j].Key) {
                        this.fb.update(this.activityEditArr[i].$key, "/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.termObj.$key + "/Activity/", { IsActive: true });
                        isExccute = true;
                        //break; //commented by vinod
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
                    this.fb.update(this.activityEditArr[i].$key, "/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.termObj.$key + "/Activity/", activityObj);

                    if (this.activityEditArr[i].IsExistActivityCategory) {
                        let ActivityCategory = this.commonService.convertFbObjectToArray(this.activityEditArr[i].ActivityCategory);

                        for (let ActivityCategoryIndex = 0; ActivityCategoryIndex < ActivityCategory.length; ActivityCategoryIndex++) {
                            activityCategoryObj.ActivityCategoryCode = ActivityCategory[ActivityCategoryIndex].ActivityCategoryCode;
                            activityCategoryObj.ActivityCategoryName = ActivityCategory[ActivityCategoryIndex].ActivityCategoryName;
                            activityCategoryObj.IsActive = ActivityCategory[ActivityCategoryIndex].IsActive;
                            activityCategoryObj.IsEnable = ActivityCategory[ActivityCategoryIndex].IsEnable;
                            activityCategoryObj.IsExistActivitySubCategory = ActivityCategory[ActivityCategoryIndex].IsExistActivitySubCategory;

                            this.response = this.fb.update(ActivityCategory[ActivityCategoryIndex].Key, "/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYearKey + "/" + this.termObj.$key + "/Activity/" + this.activityEditArr[i].$key + "/ActivityCategory/", activityCategoryObj);


                        }
                    }




                }
                isExccute = false;
            }
            if (this.response != undefined) {
                this.commonService.toastMessage('Successfully updated...', 2500,ToastMessageType.Success);
                this.response = undefined;
                this.navCtrl.pop();
            }
            //}

        }



    }

    calculateHalfEnd(TermStartDate){
  
        this.termObj.HalfTermEndDate = moment(TermStartDate).add(6, 'days').format("YYYY-MM-DD");
        
    }     
    cancel() {
        this.termObj = {};
        this.response = undefined;
        this.navCtrl.pop();
    }
    changePayByDate(TermStartDate){
        this.termObj.TermPayByDate = moment(TermStartDate).format("YYYY-MM-DD")
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
