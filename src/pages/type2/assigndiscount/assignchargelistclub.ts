import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { ToastController } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'assignchargelistclub-page',
    templateUrl: 'assignchargelistclub.html'
})

export class Type2AssignChargeListClub {
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
    allActivityDiscount = [];
    clubDetails = [];
    tempDiscountArr = [];
    allCharges = [];
    allClubCharges = [];
    chargeArr = [];
    clubChargeDetails = [];
    tempClubArr = [];
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
       public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        this.selectedClubKey = navParams.get('selectedClubKey');
        this.clubChargeDetails = navParams.get('clubChargeDetails');
        // console.log(this.selectedClubKey);


        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getAllCharges();
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
                //this.getAllActivity();

            }
        })
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub).subscribe((data1) => {

            this.activity = data1;
            //console.log(this.activity);
        })

    }

    getAllCharges() {
        this.fb.getAll("/StandardCode/DiscountAndChargesSetup/Default/Charges/").subscribe((data2) => {

            this.allCharges = data2;
            if (this.allCharges.length != undefined) {
                this.allClubCharges = [];
                for (let i = 0; i < this.allCharges.length; i++) {
                    this.allCharges[i].PercentageValue = "";
                    this.allCharges[i].AbsoluteValue = "";
                    this.allCharges[i].isSelect = false;
                    if (this.allCharges[i].LevelType == "ClubType") {
                        this.allClubCharges.push(this.allCharges[i]);
                    }
                }
                // console.log(this.allClubCharges);
                this.getDesireClubDiscount();
            }
        })
    }

    getDesireClubDiscount() {
        
        if (this.allClubCharges.length != undefined) {
            if (this.clubChargeDetails.length != undefined) {
                for (let i = 0; i < this.allClubCharges.length; i++) {
                    for (let j = 0; j < this.clubChargeDetails.length; j++) {
                        if (this.allClubCharges[i].$key == this.clubChargeDetails[j].Key && this.clubChargeDetails[j].IsActive == true) {
                            this.allClubCharges[i].isSelect = true;
                            this.allClubCharges[i].AbsoluteValue = this.clubChargeDetails[j].AbsoluteValue;
                            this.allClubCharges[i].PercentageValue = this.clubChargeDetails[j].PercentageValue;
                            this.tempClubArr.push(this.allClubCharges[i]);
                        }
                        else if (this.allClubCharges[i].$key == this.clubChargeDetails[j].Key && this.clubChargeDetails[j].IsActive == false) {
                            this.allClubCharges[i].isSelect = false;
                            this.allClubCharges[i].AbsoluteValue = this.clubChargeDetails[j].AbsoluteValue;
                            this.allClubCharges[i].PercentageValue = this.clubChargeDetails[j].PercentageValue;
                            this.tempClubArr.push(this.allClubCharges[i]);
                        }
                    }
                }
            }
        }
    }

    toggolSelectionCharge(item) {
        if (item.isSelect) {
            this.chargeArr.push(item);
        }
        else {
            for (let index = 0; index < this.chargeArr.length; index++) {
                if (item.$key == this.chargeArr[index].$key) {
                    this.chargeArr.splice(index, 1);
                    break;
                }

            }
        }
        // console.clear();
        // console.log(this.chargeArr);
    }

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    saveAssignDiscount() {
        //if (this.validateDiscount()) {
        let obj = {
            ChargeName: '',
            ChargeCode: '',
            LevelType: '',
            PercentageValue: '',
            AbsoluteValue: ''
        };

        for (let i = 0; i < this.tempClubArr.length; i++) {

            this.responseDetails = this.fb.update(this.tempClubArr[i].$key, "/Club/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/Charges/", { IsActive: false });
        }


        for (let index = 0; index < this.chargeArr.length; index++) {



            this.responseDetails = this.fb.update(this.chargeArr[index].$key, "/Club/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/Charges/", { IsActive: true });
            obj.ChargeName = this.chargeArr[index].ChargeName;
            obj.ChargeCode = this.chargeArr[index].ChargeCode;
            obj.LevelType = this.chargeArr[index].LevelType;
            obj.PercentageValue = this.chargeArr[index].PercentageValue;
            obj.AbsoluteValue = this.chargeArr[index].AbsoluteValue;
            // if (this.discountArr[index].LevelType == "LevelType1") {
            //     this.responseDetails = this.fb.update(this.discountArr[index].$key, "/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/Discount/", obj);
            // }

            this.responseDetails = this.fb.update(this.chargeArr[index].$key, "/Club/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/Charges/", obj);


        }
        if (this.responseDetails != undefined) {
            //alert("Successfully Saved");
            let message = "Successfully Saved";
            this.showToast(message, 3000);
            this.navCtrl.pop();
        }
        //}
    }

    validateDiscount(): boolean {
        if (this.selectedClub == "" || this.selectedClub == undefined) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.selectedActivity == "" || this.selectedActivity == undefined) {
            let message = "Please select activity.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.discountArr.length == 0) {
            let message = "Please select discount.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.discountArr[0].PercentageValue == "" || this.discountArr[0].PercentageValue == undefined) {
            let message = "Please enter percentage value.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.discountArr[0].AbsoluteValue == "" || this.discountArr[0].AbsoluteValue == undefined) {
            let message = "Please enter absolute value.";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }

    cancelAssignDiscount() {
        this.navCtrl.pop();
    }




}
