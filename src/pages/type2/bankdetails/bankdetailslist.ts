import { Component } from '@angular/core';
import { ToastController, NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddActivityBankDetails } from './addactivitybankdetails';
// import { Type2AddMembershipBankDetails } from './addmembershipbankdetails';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'bankdetailslist-page',
    templateUrl: 'bankdetailslist.html'
})

export class Type2BankDetailsList {
    themeType: number;
    parentClubKey: string;
    allClub = [];
    Addbankdetails = "Add Bank Account";
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
    bankDetailsTab: string = "activity";
    activePromotion = [];
    pastPromotion = [];
    selectedActivity: any;
    allActivityArr = [];
    activityBankDetailsArr = [];
    membershipEmailSetupArr = [];
    membershipBankDetailsArr = [];
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
      public fb: FirebaseService, public popoverCtrl: PopoverController) {

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

    //   getSchoolLists() {
    //     this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
    //       this.schools = data;

    //     });

    //   }

   
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
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

    goToAddBankDetails() {
        if (this.bankDetailsTab == "activity") {
            if (this.activityBankDetailsArr.length == 0) {
                this.navCtrl.push("Type2AddActivityBankDetails");
            }
            else {
                let message = "One bank details is already present under this club and activity.You can't add more.";
                this.showToast(message, 3000);
                return false;
            }
        } else if (this.bankDetailsTab == "membership") {
              if(this.membershipBankDetailsArr.length == 0){
                this.navCtrl.push("Type2AddMembershipBankDetails");
              }
              else{
                let message = "One bank details is already present under this club.You can't add more.";
                this.showToast(message, 3000);
                return false;
              }
        }
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            if (data.length > 0) {
                this.allClub = data;
                this.selectedClub = this.allClub[0].$key;
                this.getAllActivity();
            }
        })
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.allActivityArr = [];
            if (data.length > 0) {
                this.allActivityArr = data;
                this.selectedActivity = data[0].$key;
                this.getActivityBankDetails();
                this.getMembershipBankDetails();
            }
        })
    }

    onClubChange() {
        this.activityBankDetailsArr = [];
        this.membershipBankDetailsArr = [];
        this.getAllActivity();
    }

    getActivityBankDetails() {
        this.fb.getAll("/BankDetails/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/ActivityBankDetails/" + this.selectedActivity + "/").subscribe((data) => {
            this.activityBankDetailsArr = [];
            if (data.length > 0) {
                this.activityBankDetailsArr = data;
            }
        })
    }

      getMembershipBankDetails() {
        this.fb.getAll("/BankDetails/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/MembershipBankDetails/" + this.selectedActivity + "/").subscribe((data) => {
          this.membershipBankDetailsArr = [];
          if (data.length > 0) {
            this.membershipBankDetailsArr = data;
          }
        })
      }



}
