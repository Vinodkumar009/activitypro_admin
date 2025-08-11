import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
//import { Platform } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'assigndiscountlist-page',
    templateUrl: 'assigndiscountlist.html'
})

export class Type2AssignDiscountList {
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
    selectedClub: any;
    allClub: any;
    activity = [];
    selectedActivity: any;
    allDiscount = [];
    discountArr = [];
    selectedClubKey: string;
    activitykey: string;
    allClubDiscount = [];
    activityDetails: any;
    discountClubArr = [];
    tempDiscountArr = [];
    userData:any = {};
    currencyDetails: any;
    constructor(public commonService:CommonService,
        public toastCtrl: ToastController, public loadingCtrl: LoadingController, 
        storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
       public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        this.selectedClubKey = navParams.get('selectedClubKey');
        this.activitykey = navParams.get('activitykey');
        this.activityDetails = navParams.get('activityDetails');
        this.userData = this.sharedservice.getUserData();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getAllDiscount();
                }
        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
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
                //this.getAllActivity();

            }
        })
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub).subscribe((data1) => {

            this.activity = data1;
        })

    }

    getAllDiscount() {
        this.fb.getAll("/StandardCode/DiscountAndChargesSetup/Default/Discount/").subscribe((data2) => {

            this.allDiscount = data2;
            if (this.allDiscount.length != undefined) {
                this.allClubDiscount = [];
                for (let i = 0; i < this.allDiscount.length; i++) {
                    this.allDiscount[i].PercentageValue = "";
                    this.allDiscount[i].AbsoluteValue = "";
                    this.allDiscount[i].isSelect = false;
                    if (this.allDiscount[i].LevelType == "ActivityType") {
                        this.allClubDiscount.push(this.allDiscount[i]);
                    }
                }
                this.getDesireClubDiscount();
            }
        })
    }


    getDesireClubDiscount() {
        this.discountClubArr = this.commonService.convertFbObjectToArray(this.activityDetails.Discount);

        if (this.allClubDiscount.length != undefined) {

            if (this.discountClubArr.length != undefined) {

                for (let i = 0; i < this.allClubDiscount.length; i++) {
                    for (let j = 0; j < this.discountClubArr.length; j++) {
                        if (this.allClubDiscount[i].$key == this.discountClubArr[j].Key && this.discountClubArr[j].IsActive == true) {
                            this.allClubDiscount[i].isSelect = true;
                            this.allClubDiscount[i].AbsoluteValue = this.discountClubArr[j].AbsoluteValue;
                            this.allClubDiscount[i].PercentageValue = this.discountClubArr[j].PercentageValue;
                            this.tempDiscountArr.push(this.allClubDiscount[i]);
                        }
                        else if (this.allClubDiscount[i].$key == this.discountClubArr[j].Key && this.discountClubArr[j].IsActive == false) {
                            this.allClubDiscount[i].isSelect = false;
                            this.allClubDiscount[i].AbsoluteValue = this.discountClubArr[j].AbsoluteValue;
                            this.allClubDiscount[i].PercentageValue = this.discountClubArr[j].PercentageValue;
                            this.tempDiscountArr.push(this.allClubDiscount[i]);
                        }
                    }
                }
                //vinod added te below line as it's having a problem with updation when save
                this.discountArr = this.tempDiscountArr.filter(discount => discount.isSelect);
            }

        }

    }

    toggolSelectionDiscount(item) {
        if (item.isSelect) {
            this.discountArr.push(item);
        }
        else {
            for (let index = 0; index < this.discountArr.length; index++) {
                if (item.$key == this.discountArr[index].$key) {
                    this.discountArr.splice(index, 1);
                    break;
                }
            }
        }
    }

    

    saveAssignDiscount() {
        if (this.validateDiscount()) {
            let obj = {
                DiscountName: '',
                DiscountCode: '',
                LevelType: '',
                PercentageValue: '',
                AbsoluteValue: ''
            };

            //  let obj1 = {
            //     DiscountName: '',
            //     DiscountCode:'',
            //     LevelType:'',
            //     PercentageValue: '',
            //     AbsoluteValue: ''
            // };

            // for (let i = 0; i < this.tempDiscountArr.length; i++) {

            //     this.responseDetails = this.fb.update(this.tempDiscountArr[i].$key, "/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.activitykey + "/Discount/", { IsActive: false });
            // }

            this.tempDiscountArr.forEach((discount) => {
                this.responseDetails = this.fb.update(discount.$key, "/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.activitykey + "/Discount/", { IsActive: false });
            })

            for (let index = 0; index < this.discountArr.length; index++) {


                this.responseDetails = this.fb.update(this.discountArr[index].$key, "/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.activitykey + "/Discount/", { IsActive: true });
                obj.DiscountName = this.discountArr[index].DiscountName;
                obj.DiscountCode = this.discountArr[index].DiscountCode;
                obj.LevelType = this.discountArr[index].LevelType;
                obj.PercentageValue = this.discountArr[index].PercentageValue;
                obj.AbsoluteValue = this.discountArr[index].AbsoluteValue;
                //if (this.discountArr[index].LevelType == "LevelType1") {
                this.responseDetails = this.fb.update(this.discountArr[index].$key, "/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.activitykey + "/Discount/", obj);
                //}
                // else if (this.discountArr[index].LevelType == "LevelType2") {
                //     this.responseDetails = this.fb.update(this.discountArr[index].$key, "/Club/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/Discount/", obj);
                // }

            }
            if (this.responseDetails != undefined) {
                //alert("Successfully Saved");
                let message = "Successfully Saved";
                this.commonService.toastMessage(message, 2500,ToastMessageType.Success);
                this.navCtrl.pop();
            }
        }
    }

    validateDiscount(): boolean {
       
        if (this.activitykey == "" || this.activitykey == undefined) {
            let message = "Please select activity.";
            this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
            return false;
        }
        // else if (this.discountArr.length == 0) {
        //     let message = "Please select discount.";
        //     this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
        //     return false;
        // }
        else if (!this.checkForValidDiscount()) {
            this.commonService.toastMessage("Please enter valid non-negative percentage and absolute values",2500,ToastMessageType.Error);
            return false;
        }
        
        return true;
    }

    checkForValidDiscount() {
        for (let i = 0; i < this.discountArr.length; i++) {
            const discount = this.discountArr[i];

            const percent = parseFloat(discount.PercentageValue);
            const absolute = parseFloat(discount.AbsoluteValue);

            const isPercentInvalid = isNaN(percent) || percent <= 0;
            const isAbsoluteInvalid = isNaN(absolute) || absolute <= 0;

            if (this.discountArr[i].isSelect && (isPercentInvalid || isAbsoluteInvalid)) {
                return false;
            }
        }

        return true;
    }


    cancelAssignDiscountToActivity() {
        if (this.allClubDiscount.length > 0) {
            for (let i = 0; i < this.allClubDiscount.length; i++) {
                this.allClubDiscount[i].isSelect = false;
                this.allClubDiscount[i].AbsoluteValue = "";
                this.allClubDiscount[i].PercentageValue = "";
            }
        }
        this.navCtrl.pop()
    }


}
