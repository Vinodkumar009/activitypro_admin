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
    selector: 'newmembershiphome-page',
    templateUrl: 'newmembershiphome.html'
})

export class Type2NewMembershipHome {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        WebIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
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
    membershipYearArr = [
        { "id": 1, name: "Fixed month starting" },
        { "id": 2, name: "1 Year from registration day" },
        { "id": 3, name: "Roll down to 12 months" },
        { "id": 4, name: "Roll up to 12 months" },
    ];
    monthArr = [
        { "id": 1, name: "Jan" },
        { "id": 2, name: "Feb" },
        { "id": 3, name: "Mar" },
        { "id": 4, name: "April" },
        { "id": 5, name: "May" },
        { "id": 6, name: "June" },
        { "id": 7, name: "July" },
        { "id": 8, name: "Aug" },
        { "id": 9, name: "Sep" },
        { "id": 10, name: "Oct" },
        { "id": 11, name: "Nov" },
        { "id": 12, name: "Dec" }
    ]
    selectedMembershipYear: any;
    selectedMonth: any;
    newMemberDetails = {
        PayByDate: "",
        MembershipYear: "",
        MembershipDate: ""
    };
    membershipKey: any;
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
                    console.log(this.parentClubKey);
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

    saveNewMembershipConfig() {
        if (this.validateNewMembershipConfig()) {
            this.newMemberDetails.MembershipYear = this.selectedMembershipYear;
            this.newMemberDetails.MembershipDate = (new Date()).toString();
            this.membershipKey = this.fb.saveReturningKey("/MembershipConfig/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/NewMember/", this.newMemberDetails);
            if (this.membershipKey != undefined) {
                let message = "Successfully Saved";
                this.showToast(message, 3000);
                this.navCtrl.pop();
            }
        }
    }

    cancelNewMembershipConfig() {
        this.navCtrl.pop();
    }

    validateNewMembershipConfig(): boolean {
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
        else if (this.selectedMembershipYear == "" || this.selectedMembershipYear == undefined) {
            let message = "Please select a membership year.";
            this.showToast(message, 3000);
            return false;
        }
        if (this.selectedMembershipYear == "Fixed month starting") {
            if (this.selectedMonth == "" || this.selectedMonth == undefined) {
                let message = "Please select a month.";
                this.showToast(message, 3000);
                return false;
            }
            else if(this.newMemberDetails.PayByDate == "" || this.newMemberDetails.PayByDate == undefined){
                let message = "Please select pay by date.";
                this.showToast(message, 3000);
                return false;
            }
        }
        return true;
    }








}
