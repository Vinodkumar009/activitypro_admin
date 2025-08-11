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
    selector: 'addmembershipemailsetup-page',
    templateUrl: 'addmembershipemailsetup.html'
})

export class Type2AddMembershipEmailSetup {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        WebIcon:string;
        MobCloudImage: string; 
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
    promotionObj = {
        PromotionTitle: '',
        StartDate: '',
        EndDate: '',
        Description: '',
        PromotionType: '',
        SlideShowSpeed: '',
        Sequence: ''
    }
    imageArr = [];
    imageObj = {
        ImagePath: '',
        ImageToShow: true
    };
    promotionKey: any;
    toppings: any;
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
    membershipEmailSetupObj = {
        EmailSetupName: '',
        MemberRegistration: '',
        MembershipPayment: ''
    }
    emailSetupKey: any;
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



    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentclubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            if (data.length > 0) {
                this.allClub = data;
            }
        })
    }

    selectAllToggole() {
        if (this.isSelectAll) {
            this.isUnselectAll = false;
            for (let loop = 0; loop < this.allClub.length; loop++) {
                this.allClub[loop].isSelect = true;
            }
        }
        else if (!this.isSelectAll) {
            for (let loop = 0; loop < this.allClub.length; loop++) {
                this.allClub[loop].isSelect = false;
            }
        }
    }

    selectNoneToggole() {

        if (this.isUnselectAll) {
            this.isSelectAll = false;
            for (let loop = 0; loop < this.allClub.length; loop++) {
                this.allClub[loop].isSelect = false;
            }
        }
    }

    changeMembers() {
        this.isSelectAll = false;
        this.isUnselectAll = false;
        console.log(this.allClub);
    }

    cancelMembershipEmailSetup() {
        this.navCtrl.pop();
    }

    saveMembershipEmailSetup() {
        if (this.validateEmailSetup()) {
            for (let i = 0; i < this.allClub.length; i++) {
                if (this.allClub[i].isSelect == true) {
                    this.allClub[i].IsChecked = true;
                }
            }

            for (let i = 0; i < this.allClub.length; i++) {
                if (this.allClub[i].IsChecked == true) {
                    this.emailSetupKey = this.fb.saveReturningKey("/EmailSetup/Type2/" + this.selectedParentclubKey + "/" + this.allClub[i].$key + "/MembershipEmailSetup/", this.membershipEmailSetupObj);
                }
            }

            if (this.emailSetupKey != undefined) {
                let message = "Saved successfully";
                this.showToast(message, 5000);
                this.navCtrl.pop();
            }
        }
    }

    validateEmailSetup(): boolean {
        let flag = false;
        for (let i = 0; i < this.allClub.length; i++) {
            if (this.allClub[i].isSelect == true) {
                flag = true;
                break;
            }
        }
        if (flag) {
            if (this.membershipEmailSetupObj.EmailSetupName == "" || this.membershipEmailSetupObj.EmailSetupName == undefined) {
                let message = "Please enter email setup name.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.membershipEmailSetupObj.MemberRegistration == "" || this.membershipEmailSetupObj.MemberRegistration == undefined) {
                let message = "Please enter email in member registration.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.membershipEmailSetupObj.MembershipPayment == "" || this.membershipEmailSetupObj.MembershipPayment == undefined) {
                let message = "Please enter email in membership payment.";
                this.showToast(message, 3000);
                return false;
            }
            if (this.membershipEmailSetupObj.MemberRegistration != "") {
                if (!this.validateEmail(this.membershipEmailSetupObj.MemberRegistration)) {
                    let message = "Enter correct member registration email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.membershipEmailSetupObj.MembershipPayment != "") {
                if (!this.validateEmail(this.membershipEmailSetupObj.MembershipPayment)) {
                    let message = "Enter correct membership payment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
        }
        else if (!flag) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

}
