
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";

@IonicPage()
@Component({
    selector: 'helpconfig-page',
    templateUrl: 'helpconfig.html'
})

export class Type2HelpConfig {
    parentIconUrl:string = "";
    parentClubInfo:any;
    clubDetails = [];
    selectedParentClubKey: any;
    selectedClubKey: any;
    memberKey: any;
    parentClubDetails = [];
    toggleAll = true;
    reOrderToggle = false;
    navText: string = "Re-order";
    helpList: Array<IHelpConfig> = [
        {
            Header: "Welcome",
            Description: "Thank you for downloading the App. From now all communication will be through the app. Information about term sessions, holiday camps,  school sessions and others will be available in the App. You will also be able to send emails to your coach for any queries you might have.",
            IconUrl:"https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/BestCoach-Demo-ActivityPro%20MemberApp%2Fcompanyinfo%2FBestCoachAppicon.png?alt=media&token=06c3fb09-e9f5-4310-9122-475a8c540e8a",
            Sequence: 1,
            ButtonText: "SKIP",
            IsShow: true
        },
        {
            Header: "Session Booking",
            Description: "Please enrol onto any session you would like from session or school session listing page. Once you enrol into the session(s), it would appear on the dashboard. Enrol into all session(s) for you and your family before paying to get maximum discount.",
            IconUrl: "https://firebasestorage.googleapis.com/v0/b/timekare-app.appspot.com/o/Session%20List.jpg?alt=media&token=bf791141-f51f-4972-a04d-34690bd659a7",
            Sequence: 2,
            ButtonText: "SKIP",
            IsShow: true
        },
        {
            Header: "Add Family",
            Description: "Please add your family member(s) using the ‘Family' menu from the top right corner before you can enrol them into any session.",
            IconUrl: "https://firebasestorage.googleapis.com/v0/b/timekare-app.appspot.com/o/add%20family%20member.jpg?alt=media&token=bd484c32-c87b-4bfe-96e8-9a5fef67556a",
            Sequence: 3,
            ButtonText: "SKIP",
            IsShow: true
        },
        {
            Header: " Payment",
            Description: "From the dashboard select the session for payment. All unpaid sessions will be selected automatically and applicable discounts will be applied. For holiday camp, go to the basket and go ahead with the payment. If you are paying by cash/BACS, please update through the payment page and add your comments.",
            IconUrl: "https://firebasestorage.googleapis.com/v0/b/timekare-app.appspot.com/o/Payment.jpg?alt=media&token=9f449d70-8c6e-43de-abf9-57a7f79b6658",
            Sequence: 4,
            ButtonText: "SKIP",
            IsShow: true
        },
        {
            Header: "Discount",
            Description: "There are many discount available - Early Payment, Sibling, Multi Session, One Off etc. Discounts are applied during payment for the respective sessions if applicable",
            IconUrl: "https://firebasestorage.googleapis.com/v0/b/timekare-app.appspot.com/o/discount.jpg?alt=media&token=074762ab-7818-44d4-b486-17f32267c409",
            Sequence: 5,
            ButtonText: "Let’s Explore’",
            IsShow: true
        },
        

    ];

    helps = [];
    constructor(public alertCtrl: AlertController, public commonService: CommonService, public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                this.selectedClubKey = user.ClubKey;
                this.memberKey = user.MemberKey;
                this.getParentClubImage();
                this.getHelpSetup();
                //  this.getParentClubDetails();
                
                break;
            }

        }).catch(error => {


        });

        
    }

    getParentClubImage() {
        this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {
          //this.parentClubInfo = data[0];
          console.log(data[0]);
          this.helpList[0].IconUrl = data[0].ParentClubAppIconURL;
        })
    }

    showToast(m: string, duration: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: duration,
            position: 'bottom'
        });
        toast.present();
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
    getHelpSetup() {

        let x = [];

        //<summary>
        //
        //this is not working inside the firebase callback
        //so initialized this to local variable called currentInvokingObj
        //
        //</summary>

        let currentInvokingObj = this;

        let ref = firebase.database().ref('/').child("/HelpConfig/Member/" + this.selectedParentClubKey);
        ref.once("value", function (snapshot) {
            x = snapshot.val();
            if (x == null) {
                currentInvokingObj.helpConfigSetup();
            } else {
                currentInvokingObj.helps = currentInvokingObj.commonService.convertFbObjectToArray(x);
                currentInvokingObj.helps = currentInvokingObj.commonService.sortingObjects(currentInvokingObj.helps, "Sequence")

                let flag = false;
                for (let i = 0; i < currentInvokingObj.helps.length; i++) {
                    if (currentInvokingObj.helps[i].IsShow) {
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
    helpConfigSetup() {
        for (let i = 0; i < this.helpList.length; i++) {
            this.fb.saveReturningKey("/HelpConfig/Member/" + this.selectedParentClubKey, this.helpList[i]);
        }
        this.getTabConfigList();
    }
    getTabConfigList() {
        this.fb.getAllWithQuery("/HelpConfig/Member/" + this.selectedParentClubKey, { orderByKey: true }).subscribe((data) => {
            for (let i = 0; i < data.length; i++) {
                data[i].Key = data[i].$key;
            }
            this.helps = data;
        });
    }
    reorderItems(indexes) {
        let element = this.helps[indexes.from];
        this.helps.splice(indexes.from, 1);
        this.helps.splice(indexes.to, 0, element);

        for (let tabIndex = 0; tabIndex < this.helps.length; tabIndex++) {
            this.fb.update(this.helps[tabIndex].Key, "/HelpConfig/Member/" + this.selectedParentClubKey, { Sequence: tabIndex + 1 });
        }
        let message = "Re-eorderd successfully done."
        this.showToast(message, 3000);
    }
    enableReorder() {
        this.reOrderToggle = !this.reOrderToggle;
        this.navText = this.reOrderToggle ? "Done" : "Re-order";
    }



    //<summary>
    //
    //  ON / OFF functionality (if OFF then should not appear in the member app)
    //  if OFF => make IsShow flag to false
    //  if ON  => make IsShow flag to true
    //
    //<summary>

    helpConfigToggleAll() {
        for (let loop = 0; loop < this.helps.length; loop++) {

            if (!this.toggleAll) {
                // this.helps[loop].IsAllowNotification = true;
                this.fb.update(this.helps[loop].Key, "/HelpConfig/Member/" + this.selectedParentClubKey, { IsShow: true });
            } else {
                // this.helps[loop].IsAllowNotification = false;
                this.fb.update(this.helps[loop].Key, "/HelpConfig/Member/" + this.selectedParentClubKey, { IsShow: false });
            }
        }
        this.getTabConfigList();

    }

    //<summary>
    //
    //  ON / OFF functionality (if OFF then should not appear in the member app)
    //  if OFF => make IsShow flag to false
    //  if ON  => make IsShow flag to true
    //
    //<summary>
    helpConfigToggle(tabItem, index) {
        this.fb.update(tabItem.Key, "/HelpConfig/Member/" + this.selectedParentClubKey, { IsShow: !tabItem.IsShow });
        let flag = false;
        for (let i = 0; i < this.helps.length; i++) {
            if (!tabItem.IsShow) {
                this.toggleAll = true;
                flag = true;
                break;
            }
            if (this.helps[i].IsShow && i != index) {
                this.toggleAll = true;
                flag = true;
                break;
            }
        }
        if (!flag) {
            this.toggleAll = false;
        }

    }

    saveText(tabItem) {
        let confirm = this.alertCtrl.create({
            title: 'Edit Help',
            message: 'Are you sure you want to edit help config ? ',
            buttons: [
                {
                    text: 'No',
                    handler: () => {
                        this.navCtrl.pop();
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.navCtrl.push("EditHelpConfig", { HelpConfigItem: tabItem });
                    }
                }
            ]
        });
        confirm.present();




        // let prompt = this.alertCtrl.create({
        //      subTitle: tabItem.Header,
        //     // message: "Modify tab details!",
        //     inputs: [
        //         {
        //             name: 'Header',
        //             placeholder: 'Display Text',
        //             value: tabItem.Header
        //         }
        //     ],
        //     buttons: [
        //         {
        //             text: 'Cancel',
        //             handler: data => {
        //                 console.log('Cancel clicked');
        //             }
        //         },
        //         {
        //             text: 'Save',
        //             handler: data => {


        //                 if (this.validateInputs(data)) {
        //                     this.fb.update(tabItem.Key, "/HelpConfig/Member/" + this.selectedParentClubKey, { DisplayText: data.DisplayText });
        //                     this.getTabConfigList();
        //                 }
        //             }
        //         }
        //     ]
        // });
        // prompt.present();
    }

    //<Summary>
    //
    //‘display text’ (recommended length upto 20 characters 
    //
    //</Summary>
    validateInputs(data): boolean {
        if (data.DisplayText.length == 0 || data.DisplayText.length > 20) {
            if (data.DisplayText.length == 0) {
                this.showToast("Display text must not be empty.", 5000);
                return false;
            } else {
                this.showToast("Display text length must not exceed 20.", 5000);
                return false;
            }
        } else {
            return true;
        }
    }
}
interface IHelpConfig {
    Header: string,
    Description: string,
    IconUrl: string,
    Sequence: number,
    ButtonText: string,
    IsShow: boolean
}