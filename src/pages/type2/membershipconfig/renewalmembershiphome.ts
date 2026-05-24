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
@IonicPage()
@Component({
    selector: 'renewalmembershiphome-page',
    templateUrl: 'renewalmembershiphome.html'
})

export class Type2RenewalMembershipHome {
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
    allClub = [];
    selectedClub: any;
    allActivityArr = [];
    selectedActivity: any;
    renewalMemberDetails = {
        SendEmailNotificationinAdvance: '',
        SendEmailNotificationinAdvanceRepeat: '',
        NotifyViaMessage: false,
        Message: '',
        RenewalPaymentInstructionDays: '',
        DueDate: ''
    }
    renmembershipKey: any;
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
                    //this.getAllDiscount();
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
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            //alert();
            if (data.length > 0) {
                this.allClub = data;
                this.selectedClub = data[0].$key;
                this.getAllActivity();

            }
        })
    }

    onClubChange() {
        this.getAllActivity();
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.allActivityArr = [];
            if (data.length > 0) {
                this.allActivityArr = data;
                this.selectedActivity = data[0].$key;
            }
        })
    }

    saveRenewalMember() {
        //this.newMemberDetails.MembershipDate = (new Date()).toString();
        if (this.validateRenewalMembershipConfig()) {
            this.renmembershipKey = this.fb.saveReturningKey("/MembershipConfig/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/RenewalMember/", this.renewalMemberDetails);
            if (this.renmembershipKey != undefined) {
                let message = "Successfully Saved";
                this.showToast(message, 3000);
                this.navCtrl.pop();
            }
        }
    }

    cancelRenewalMember() {
        this.navCtrl.pop();
    }

    validateRenewalMembershipConfig(): boolean {
        if (this.selectedClub == "" || this.selectedClub == undefined) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.selectedActivity == "" || this.selectedActivity == undefined) {
            let message = "Please select an activity.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.renewalMemberDetails.SendEmailNotificationinAdvance == "" || this.renewalMemberDetails.SendEmailNotificationinAdvance == undefined) {
            let message = "Please enter send email notification in advance.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.renewalMemberDetails.SendEmailNotificationinAdvanceRepeat == "" || this.renewalMemberDetails.SendEmailNotificationinAdvanceRepeat == undefined) {
            let message = "Please enter repeat send email notification in advance.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.renewalMemberDetails.NotifyViaMessage == false) {
            let message = "Please select notify message.";
            this.showToast(message, 3000);
            return false;
        }
        if (this.renewalMemberDetails.NotifyViaMessage == true) {
            if (this.renewalMemberDetails.Message == "" || this.renewalMemberDetails.Message == undefined) {
                let message = "Please enter notify message.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.renewalMemberDetails.RenewalPaymentInstructionDays == "" || this.renewalMemberDetails.RenewalPaymentInstructionDays == undefined) {
                let message = "Please enter renewal payment instruction days.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.renewalMemberDetails.DueDate == "" || this.renewalMemberDetails.DueDate == undefined) {
                let message = "Please enter due date.";
                this.showToast(message, 3000);
                return false;
            }
        }
        return true;
    }






}
