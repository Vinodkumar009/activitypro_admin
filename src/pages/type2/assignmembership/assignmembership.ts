import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import {ToastController } from 'ionic-angular';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'assignmembership-page',
    templateUrl: 'assignmembership.html'
})

export class Type2AssignMembership {
    themeType: number;
    parentClubKey: string;
    schools: any;
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
    allSchools: any;
    schoolArr = [];
    responseDetails: any;
    responseDetails1: any;
    selectedClub: any;
    allClub: any;
    activity = [];
    selectedActivity: any;
    allDiscount = [];
    discountArr = [];
    selectedClubKey: string;
    activitykey: string;
    allActivityDiscount = [];
    clubDetails = [];
    tempDiscountArr = [];
    allMembercategory = [];
    subCategoryList = [];
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();



        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
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


    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            //alert();
            if (data.length > 0) {
                this.allClub = data;
                //this.selectedClub = data[0].$key;
                this.getAllMembership();

            }
        })
    }


    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    getAllMembership() {
        this.fb.getAll("/StandardCode/MemberCategory/Default/").subscribe((data1) => {
            if (data1.length > 0) {
                this.allMembercategory = data1;
            }
        })
    }


    saveAssignMembership() {

        if (this.validateMembership()) {
            let membershipObj = { MemeberCategoryName: '', MemeberCategoryCode: '', AliasName: '', CreatedDate: '', IsActive: false, IsExistSubCategory: false };
            for (let i = 0; i < this.allMembercategory.length; i++) {
                if (this.allMembercategory[i].IsSelected == true) {
                    membershipObj.MemeberCategoryName = this.allMembercategory[i].MemeberCategoryName;
                    membershipObj.MemeberCategoryCode = this.allMembercategory[i].MemeberCategoryCode;
                    membershipObj.AliasName = this.allMembercategory[i].AliasName;
                    membershipObj.CreatedDate = this.allMembercategory[i].CreatedDate;
                    membershipObj.IsActive = this.allMembercategory[i].IsActive;
                    membershipObj.IsExistSubCategory = this.allMembercategory[i].IsExistSubCategory;

                    this.responseDetails = this.fb.update(this.allMembercategory[i].$key, "/MemberCategory/" + this.parentClubKey + "/" + this.selectedClub + "/", membershipObj);

                }
            }


            if (this.responseDetails != undefined) {
                let message = "Successfully Saved";
                this.showToast(message, 3000);
                this.navCtrl.pop();
            }
        }
    }


    validateMembership(): boolean {
        let flag = false;
        for (let i = 0; i < this.allMembercategory.length; i++) {
            if (this.allMembercategory[i].IsSelected == true) {
                flag = true;
                break;
            }
        }
        if (this.selectedClub == "" || this.selectedClub == undefined) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        else if (!flag) {
            let message = "Please select a member category.";
            this.showToast(message, 3000);
            return false;
        }
        for (let i = 0; i < this.allMembercategory.length; i++) {
            if (this.allMembercategory[i].IsSelected == true) {
                if (this.allMembercategory[i].AliasName == "") {
                    let message = "Please enter alias name.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
        }
        return true;
    }


    cancelAssignMembership() {
        this.navCtrl.pop();
    }






}
