
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';


import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

// import { Dashboard } from './../../dashboard/dashboard';
import * as firebase from 'firebase';


import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";
@IonicPage()
@Component({
    selector: 'notificationcenter-page',
    templateUrl: 'notificationcenter.html'
})

export class NotificationCenter {
    clubDetails = [];
    selectedParentClubKey: any;
    selectedClubKey: any;
    memberKey: any;
    parentClubDetails = [];

    notificationCategoryObj = {
        Label: "",
        NotificationID: "",
        IsAllowNotification: false,
        Clubs: []
    }

    notificationCategoryArr = [
        {
            Label: "Member Registration",
            NotificationText: "Welcome to <Name of the Parent Club> : <Venue Name>.",
            IsAllowNotification: true,
            Type: "UserRegistration"
        },
        {
            Label: "Session Enrolment",
            NotificationText: "Thank you for enrolling in the session.",
            IsAllowNotification: true,
            Type: "SessionEnrollment"
        },
        {
            Label: "Session Payment",
            NotificationText: "Thank you for making the payment for the session",
            IsAllowNotification: true,
            Type: "SessionPayment"

        },

        {
            Label: "Camp Enrolment",
            NotificationText: "Thank you for enrolling in the Holiday Camp session.",
            IsAllowNotification: true,
            Type: "HolidayCampEnrollment"
        },
        {
            Label: "HolidayCamp Payment ",
            NotificationText: "Thank you for making the payment for the Holiday Camp",
            IsAllowNotification: true,
            Type: "HolidayCampPayment"
        },
        {
            Label: "School Session Enrolment",
            NotificationText: "Thank you for enrolling in the school session.",
            IsAllowNotification: true,
            Type: "SchoolSessionEnrollment"
        },
        {
            Label: "School Session Payment",
            NotificationText: "Thank you for making the payment for the school session",
            IsAllowNotification: true,
            Type: "SchoolSessionPayment"
        }













        , {
            Label: "Notify To Admin After Session Payment",
            NotificationText: "<Name of the Player> paid <amount> for <Session Name>:<Day>:<Time> at <Venue>",
            IsAllowNotification: true,
            Type: "NotifyToAdminForSessionPayment"

        },

        {
            Label: "Notify To Coach After Session Payment",
            NotificationText: "<Name of the Player> paid <amount> for <Session Name>:<Day>:<Time> at <Venue>",
            IsAllowNotification: true,
            Type: "NotifyToCoachForSessionPayment"
        }, 
        {
            Label: "Notify To Admin After School Session Payment",
            NotificationText: "<Name of the Player> paid <amount> for <School Session Name>:<Day>:<Time> at <School Name>",
            IsAllowNotification: true,
            Type: "NotifyToAdminForSchoolSessionCamp"
        },
        {
            Label: "Notify To Coach After School Session Payment",
            NotificationText: "<Name of the Player> paid <amount> for <School Session Name>:<Day>:<Time> at <School Name>",
            IsAllowNotification: true,
            Type: "NotifyToCoachForSchoolSessionPayment"
        },
        {
            Label: "Notify To Admin After HolidayCamp Payment",
            NotificationText: "<Name of the Player> paid <amount> for <Holiday Camp Name>:<Day>:<Time> at <Venue>",
            IsAllowNotification: true,
            Type: "NotifyToAdminForHolidayCamp"
        },
        {
            Label: "Notify To Coach After HolidayCamp Payment",
            NotificationText: "<Name of the Player> paid <amount> for <Holiday Camp Name>:<Day>:<Time> at <Venue>",
            IsAllowNotification: true,
            Type: "NotifyToCoachForHolidayCampPayment"
        },
        {
            Label: "Notify To Admin After Amendment of Session Amount",
            NotificationText: "<Name of the Player> paid <amount> for <Holiday Camp Name>:<Day>:<Time> at <Venue>",
            IsAllowNotification: true,
            Type: "NotifyToAdminAmendmentOfSessionAmount"
        },
        {
            Label: "Notify To Coach After Amendment of Session Amount",
            NotificationText: "<Name of the Player> paid <amount> for <Holiday Camp Name>:<Day>:<Time> at <Venue>",
            IsAllowNotification: true,
            Type: "NotifyToCoachAfterAmendmentOfSessionAmount"
        }


    ];


    notificationList = [];
    toggleAll = true;
    constructor(public alertCtrl: AlertController, public commonService: CommonService, public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                this.selectedClubKey = user.ClubKey;
                this.memberKey = user.MemberKey;
                this.getNotificationSetup();
                this.getParentClubDetails();
                break;
            }

        }).catch(error => {


        });


    }


    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {
            this.clubDetails = data;
        });
    }

    getParentClubDetails() {
        this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {
            this.parentClubDetails = data;
        });
    }


    createNotification() {
        this.navCtrl.push("CreateNotification");
    }
    getNotificationSetup() {

        let x = [];

        //this is not working inside the firebase callback
        //so initialized this to local variable called currentInvokingObj
        let currentInvokingObj = this;

        let ref = firebase.database().ref('/').child("/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey);
        ref.once("value", function (snapshot) {
            x = snapshot.val();
            if (x == null) {
                currentInvokingObj.setNotificationSetup();
            } else {
                currentInvokingObj.notificationList = currentInvokingObj.commonService.convertFbObjectToArray(x);
                let flag = false;
                for (let i = 0; i < currentInvokingObj.notificationList.length; i++) {
                    if (currentInvokingObj.notificationList[i].IsAllowNotification) {
                        currentInvokingObj.toggleAll = true;
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    currentInvokingObj.toggleAll = false;
                }
            }
        }, function (error) {
            this.showToast(error.message, 5000);
        });
    }
    setNotificationSetup() {
        this.notificationList = this.notificationCategoryArr;
        for (let i = 0; i < this.notificationCategoryArr.length; i++) {
            let obj = { Label: "", NotificationText: "", IsAllowNotification: true, Type: '' };
            obj = this.notificationCategoryArr[i];
            this.fb.saveReturningKey("/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, {
                Label: obj.Label,
                NotificationText: obj.NotificationText,
                IsAllowNotification: true,
                Type: obj.Type,
            });
        }

    }


    changeNotificationToggle(notificationItem, index) {
        this.fb.update(notificationItem.Key, "/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, { IsAllowNotification: !notificationItem.IsAllowNotification });
        let flag = false;
        for (let i = 0; i < this.notificationList.length; i++) {
            if (!notificationItem.IsAllowNotification) {
                this.toggleAll = true;
                flag = true;
                break;
            }
            if (this.notificationList[i].IsAllowNotification && i != index) {
                this.toggleAll = true;
                flag = true;
                break;
            }
        }
        if (!flag) {
            this.toggleAll = false;
        }

    }


    changeNotificationToggleAll() {
        for (let loop = 0; loop < this.notificationList.length; loop++) {
            if (!this.toggleAll) {
                this.notificationList[loop].IsAllowNotification = true;
                this.fb.update(this.notificationList[loop].Key, "/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, { IsAllowNotification: true });
            } else {
                this.notificationList[loop].IsAllowNotification = false;
                this.fb.update(this.notificationList[loop].Key, "/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, { IsAllowNotification: false });
            }
        }

    }

    saveText(notificationItem) {

        let prompt = this.alertCtrl.create({
            subTitle: notificationItem.Label,
            message: notificationItem.NotificationText.toString(),
            inputs: [
                {
                    name: 'title',
                    placeholder: 'Notification Text',
                    value: notificationItem.NotificationText
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Save',
                    handler: data => {
                        //Thank you for making the payment for the Holiday Camp
                        this.fb.update(notificationItem.Key, "/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, { NotificationText: data.title });
                        this.fb.getAllWithQuery("/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, { orderByKey: true }).subscribe((data) => {
                            for (let i = 0; i < data.length; i++) {
                                data[i].Key = data[i].$key;
                            }
                            this.notificationList = data;

                        });
                    }
                }
            ]
        });
        prompt.present();
    }

}
