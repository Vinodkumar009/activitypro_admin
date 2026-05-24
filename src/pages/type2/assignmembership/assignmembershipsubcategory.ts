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
    selector: 'assignmembershipsubcategory-page',
    templateUrl: 'assignmembershipsubcategory.html'
})

export class Type2AssignMembershipSubCategory {
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
    memberDetails:any;
    tempDiscountArr = [];
    allMembercategory = [];
    subCategoryList = [];
    memberCategoryKey: string;
    allSubCategoryArr = [];
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
      public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        this.memberDetails = navParams.get('memberDetails');
        this.selectedClubKey = navParams.get('selectedClubKey');
        this.memberCategoryKey = this.memberDetails.$key;
     
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getMemberSubCategory();

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

    


    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }



    getMemberSubCategory(){
        this.fb.getAll("/StandardCode/MemberCategory/Default/" + this.memberCategoryKey + "/MembershipSubCategory/").subscribe((data) => {
            if (data.length > 0) {
                this.allSubCategoryArr = data;
            }
        })
    }




    saveAssignMemberSubcategory() {
       if (this.validateSubCategory()) {
        let membershipSubCategoryObj = { MembershipSubCategoryName: '', MembershipSubCategoryCode: '', AliasName: '', CreatedDate: '', IsActive: false };
        
            for (let i = 0; i < this.allSubCategoryArr.length; i++) {
                if (this.allSubCategoryArr[i].IsSelected == true) {
                    membershipSubCategoryObj.MembershipSubCategoryName = this.allSubCategoryArr[i].MembershipSubCategoryName;
                    membershipSubCategoryObj.MembershipSubCategoryCode = this.allSubCategoryArr[i].MembershipSubCategoryCode;
                    membershipSubCategoryObj.AliasName = this.allSubCategoryArr[i].Aliasname;
                    membershipSubCategoryObj.CreatedDate = this.allSubCategoryArr[i].CreatedDate;
                    membershipSubCategoryObj.IsActive = this.allSubCategoryArr[i].IsActive;

                            this.responseDetails = this.fb.update(this.allSubCategoryArr[i].$key, "/MemberCategory/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.memberCategoryKey + "/MembershipSubCategory/", membershipSubCategoryObj);
                }
            }
      

        if (this.responseDetails != undefined) {
            let message = "Successfully Saved";
            this.showToast(message, 3000);
            this.navCtrl.pop();
        }
       }
    }

    validateSubCategory(): boolean {
        let flag = false;
        for (let i = 0; i < this.allSubCategoryArr.length; i++) {
            if (this.allSubCategoryArr[i].IsSelected == true) {
                flag = true;
                break;
            }
        }
        
        if (!flag) {
            let message = "Please select a member subcategory.";
            this.showToast(message, 3000);
            return false;
        }
        for (let i = 0; i < this.allSubCategoryArr.length; i++) {
            if (this.allSubCategoryArr[i].IsSelected == true) {
                if (this.allSubCategoryArr[i].Aliasname == "") {
                    let message = "Please enter alias name.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
        }
        return true;
    }

    cancelAssignMemberSubcategory(){
        this.navCtrl.pop();
    }








}
