import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
//import { PopoverPage } from '../../popover/popover';
//import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
//import { Dashboard } from './../../dashboard/dashboard';
//import { Type2PropertyValue } from './propertyvalue';
import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';


@IonicPage()
@Component({
    selector: 'addactivityfees-page',
    templateUrl: 'addactivityfees.html'
})

export class Type2AddActivityFeesList {
    themeType: number;
    parentClubKey: string;
    allClub: any;
    selectedClub: any;
    allPromotion = [];
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
        WebIcon:string;
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    //songs: FirebaseListObservable<any>;
    promotionTab: string = "active";
    activePromotion = [];
    pastPromotion = [];

    activityfolder = [];
    activityList = [];
    selectedActivity = "";

    actFeesObj = {
        ParentClubKey: '',
        ClubKey: '',
        ActivityKey: '',
        RecordFeesName: '',
        Description:''
    }

    propertyObj = {
        PropertyName: '',
        IsShowOnline: true
    };
    propertyArr = [];
    clubArrList = [];
    allClubFromParentClub = [];
    orgClubArr = [];
    activityFeesKey: any;
    activityFeesKeyList = "";
    constructor(public commonService:CommonService,public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getActivityList();
                }
        })
    }

    goTo(obj) {

        console.log(obj);

        this.navCtrl.push(obj.component);
    }
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });
    }


    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }


    goToDashboardMenuPage() {
        this.navCtrl.setRoot('Dashboard');
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
            console.log(this.activityList);
            this.getClubList();
        });

    }

    getClubList() {
        this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
            if (data.length > 0) {
                this.clubArrList = [];
                this.allClub = data;
                if (this.activityList.length > 0) {
                    let flag = false;
                    for (let i = 0; i < this.allClub.length; i++) {
                        let clubList = this.commonService.convertFbObjectToArray(this.allClub[i]);
                        for (let j = 0; j < clubList.length; j++) {
                            //for (let k = 0; k < this.activityList.length; k++) {
                            //if (clubList[j].Key == this.activityList[k].Key) {
                            if (clubList[j].Key == this.selectedActivity) {
                                flag = true;
                                break;
                            }
                            //}
                        }
                        if (flag) {
                            this.clubArrList.push(this.allClub[i]);
                        }
                        flag = false;
                    }
                }
            }
            console.log(this.allClub);
            console.log(this.clubArrList);
            this.compareWithClub();

        })
    }

    compareWithClub() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data1) => {
            if (data1.length > 0) {
                this.allClubFromParentClub = data1;
                this.orgClubArr = [];
                if (this.clubArrList.length > 0) {
                    for (let clubIndex = 0; clubIndex < this.clubArrList.length; clubIndex++) {
                        for (let orgClubIndex = 0; orgClubIndex < this.allClubFromParentClub.length; orgClubIndex++) {
                            if (this.clubArrList[clubIndex].$key == this.allClubFromParentClub[orgClubIndex].$key) {
                                this.orgClubArr.push(this.allClubFromParentClub[orgClubIndex]);
                            }
                        }
                    }
                }
            }
            console.log(this.allClubFromParentClub);
            console.log(this.orgClubArr);
            this.selectedClub = this.orgClubArr[0].$key;
        })
    }

    onChangeActivity() {
        this.getClubList();
    }

    addProerties() {
        this.propertyArr.push(this.propertyObj);
        this.propertyObj = {
            PropertyName: '',
            IsShowOnline: true
        };
    }
    addActivityFees() {
        if (this.validateProperty()) {
            if (this.selectedClub == "All") {
                for (let index = 0; index < this.orgClubArr.length; index++) {
                    this.actFeesObj.ParentClubKey = this.parentClubKey;
                    this.actFeesObj.ClubKey = this.orgClubArr[index].$key;
                    this.actFeesObj.ActivityKey = this.selectedActivity;
                    this.activityFeesKey = this.fb.saveReturningKey("/ActivityFees/Type2/", this.actFeesObj);
                    if (this.activityFeesKey != undefined) {
                        this.activityFeesKeyList += this.activityFeesKey + ","
                    }

                    if (this.propertyArr.length > 0) {
                        let properties = "";
                        let IsShowOnline = "";
                        for (let i = 0; i < this.propertyArr.length; i++) {
                            properties += this.propertyArr[i].PropertyName + ",";
                            IsShowOnline += this.propertyArr[i].IsShowOnline + ",";
                        }
                        properties = properties.substr(0, properties.length - 1);
                        IsShowOnline = IsShowOnline.substr(0, IsShowOnline.length - 1);
                        this.fb.update(this.activityFeesKey, "/ActivityFees/Type2/", { Properties: properties, IsShowOnline: IsShowOnline });

                    }
                }
                if (this.activityFeesKey != undefined) {
                    this.activityFeesKeyList = this.activityFeesKeyList.substr(0, this.activityFeesKeyList.length - 1);
                    console.log(this.activityFeesKeyList);
                    this.navCtrl.push('Type2PropertyValue', { activityFeesKeyList: this.activityFeesKeyList });
                    //this.navCtrl.pop();
                }
            }
            else {
                this.actFeesObj.ParentClubKey = this.parentClubKey;
                this.actFeesObj.ClubKey = this.selectedClub;
                this.actFeesObj.ActivityKey = this.selectedActivity;
                this.activityFeesKey = this.fb.saveReturningKey("/ActivityFees/Type2/", this.actFeesObj);
                if (this.propertyArr.length > 0) {
                    let properties = "";
                    let IsShowOnline = "";
                    for (let i = 0; i < this.propertyArr.length; i++) {
                        properties += this.propertyArr[i].PropertyName + ",";
                        IsShowOnline += this.propertyArr[i].IsShowOnline + ",";
                    }
                    properties = properties.substr(0, properties.length - 1);
                    IsShowOnline = IsShowOnline.substr(0, IsShowOnline.length - 1);
                    this.fb.update(this.activityFeesKey, "/ActivityFees/Type2/", { Properties: properties, IsShowOnline: IsShowOnline });

                }

                if (this.activityFeesKey != undefined) {
                    // var message = "Successfully Saved";
                    // this.showToast(message, 3000);
                    this.navCtrl.push('Type2PropertyValue', { activityFeesKey: this.activityFeesKey });
                }
            }
        }
    }

    cancelActivityFees() {
        this.navCtrl.pop();
    }

    validateProperty(): boolean {

        if (!this.checkForCharachter()) {
            let message = "Property filed can not contain ' . , # , $ , [ , ] ' .";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }

    checkForCharachter() {
        let isPresent = false;
        for (let i = 0; i < this.propertyArr.length; i++) {
            if (this.propertyArr[i].PropertyName.includes(".")) {
                isPresent = true;
                break;
            }
            else if(this.propertyArr[i].PropertyName.includes("#")){
                isPresent = true;
                break;
            }
            else if(this.propertyArr[i].PropertyName.includes("$")){
                isPresent = true;
                break;
            }
            else if(this.propertyArr[i].PropertyName.includes("[")){
                isPresent = true;
                break;
            }
            else if(this.propertyArr[i].PropertyName.includes("]")){
                isPresent = true;
                break;
            }
        }
        if (isPresent) {
            return false;
        }
        else {
            return true;
        }
    }





}
