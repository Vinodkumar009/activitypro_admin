import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { ToastController } from 'ionic-angular';
//import { Platform } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'addmembershipbankdetails-page',
    templateUrl: 'addmembershipbankdetails.html'
})

export class Type2AddMembershipBankDetails {
    themeType: number;
    parentClubKey: string;
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
    responseDetails: any;
    selectedClub: any;
    allClub = [];
    isSelectAll = false;
    isUnselectAll = false;
    selectedClubArr = [];
    selectdClubActivity = [];
    selectdClubActivityArr = [];
    selectedActivityArr = [];
    isSelectActivityAll = false;
    selectedParentclubKey: any;
    clubcall: any;
    clubs: any;
    selectedclub: any;
    selectedClubKey: any;
    act: any;
    activities: any;
    selectedActivities: any;
    bankDetailsObj = {
        BankName: '',
        BankAddress: '',
        SortCode: '',
        AccountNumber: '',
        InstructionForMembers: ''
    }
    bankDetailsKey: any;
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
         public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();



        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.selectedParentclubKey = club.ParentClubKey;
                    this.clubcall = this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentclubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
                        this.clubs = data;
                        if (data.length > 0) {
                            this.selectedclub = data[0];
                            this.selectedClubKey = data[0].$key;

                            for (let i = 0; i < this.clubs.length; i++) {
                                this.act = this.fb.getAll("/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key).subscribe((data) => {


                                    this.activities = data;
                                    if (data.length > 0) {
                                        this.clubs[i].IsSelected = false;
                                        this.clubs[i].Activities = data;
                                        this.selectedActivities = data[0];
                                        if (this.clubs[i].Activities.length != undefined) {
                                            for (let j = 0; j < this.clubs[i].Activities.length; j++) {
                                                this.clubs[i].Activities[j].IsSelected = false;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
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

    cancelBankDetails() {
        this.navCtrl.pop();
    }

    saveBankDetails() {
        if (this.validateBankDetails()) {
            for (let i = 0; i < this.clubs.length; i++) {
                if (this.clubs[i].IsSelected == true) {
                    this.clubs[i].IsChecked = true;
                    for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                        if (this.clubs[i].Activities[k].IsSelected == true) {
                            this.clubs[i].Activities[k].IsChecked = true;
                        }

                    }
                }
            }

            for (let i = 0; i < this.clubs.length; i++) {
                if (this.clubs[i].IsChecked == true) {
                    if (this.clubs[i].Activities != undefined) {
                        for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                            if (this.clubs[i].Activities[k].IsChecked == true) {
                                this.bankDetailsKey = this.fb.saveReturningKey("/BankDetails/Type2/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/MembershipBankDetails/" + this.clubs[i].Activities[k].$key + "/", this.bankDetailsObj);

                            }

                        }
                    }

                }
            }
            if (this.bankDetailsKey != undefined) {
                let message = "Saved successfully";
                this.showToast(message, 5000);
                this.navCtrl.pop();
            }
        }
    }

     validateBankDetails(): boolean {
        let flag = false;
        let flag1 = false;
        for (let i = 0; i < this.clubs.length; i++) {
            if (this.clubs[i].IsSelected == true) {
                flag = true;
                break;
            }
        }
        if (flag) {
            if (this.bankDetailsObj.BankName == "" || this.bankDetailsObj.BankName == undefined) {
                let message = "Please enter bank name.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.bankDetailsObj.BankAddress == "" || this.bankDetailsObj.BankAddress == undefined) {
                let message = "Please enter bank address.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.bankDetailsObj.SortCode == "" || this.bankDetailsObj.SortCode == undefined) {
                let message = "Please enter sort code.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.bankDetailsObj.AccountNumber == "" || this.bankDetailsObj.AccountNumber == undefined) {
                let message = "Please enter account number.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.bankDetailsObj.InstructionForMembers == "" || this.bankDetailsObj.InstructionForMembers == undefined) {
                let message = "Please enter instruction for members.";
                this.showToast(message, 3000);
                return false;
            }
        }
        else if (!flag) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        for (let j = 0; j < this.clubs.length; j++) {
                if (this.clubs[j].IsSelected == true) {
                    if (this.clubs[j].Activities != undefined) {
                        for (let k = 0; k < this.clubs[j].Activities.length; k++) {
                            if (this.clubs[j].Activities[k].IsSelected == true) {
                                flag1 = true;
                                break;
                            }
                        }
                    }
                }
        }
        if (!flag1) {
            let message = "Please select activity.";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }


}
