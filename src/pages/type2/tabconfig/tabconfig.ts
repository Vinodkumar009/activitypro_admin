
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
import { Type2CourtBookListModule } from '../courtsetup/courtbooklist.module';

// import { reorderArray } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'tabconfig-page',
    templateUrl: 'tabconfig.html'
})

export class Type2TabConfig {
    clubDetails = [];
    selectedParentClubKey: any;
    selectedClubKey: any;
    memberKey: any;
    parentClubDetails = [];
    toggleAll = true;
    reOrderToggle = false;
    navText: string = "Re-order";
    showTabView = false;
    ///<summary>
    /// 
    /// Role = -1  <-1 states that this should not be changed>
    /// 
    ///</summary>


    menuList: ReadonlyArray<Menus> = [
        { DefaultText: "Home", DisplayText: "Home", IsVisible: true, TabSequenceNo: 21, SuperMenuSequence: 0, Component: "VanuePage", Icon: "md-notifications", Role: 2, Type: 2, Level: 2, IsApplicableVisibleFlag: true },
     //   { DefaultText: "Show Tab View", DisplayText: "Show Tab View", IsVisible: true, TabSequenceNo: 0, SuperMenuSequence: 0, Component: "", Icon: "", Role: -1, Type: 2, Level: 0, IsApplicableVisibleFlag: true, IsTabView: false },
        { DefaultText: "Dashboard", DisplayText: "Dashboard", IsVisible: true, TabSequenceNo: 1, SuperMenuSequence: 0, Component: "dashboard", Icon: "speedometer", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: false },
        { DefaultText: "Session", DisplayText: "Session", IsVisible: true, TabSequenceNo: 2, SuperMenuSequence: 0, Component: "SessionList", Icon: "laptop", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: false },
        { DefaultText: "School Session", DisplayText: "School Session", IsVisible: false, TabSequenceNo: 3, SuperMenuSequence: 0, Component: "School", Icon: "school", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        { DefaultText: "Holiday Camp", DisplayText: "Holiday Camp", IsVisible: false, TabSequenceNo: 4, SuperMenuSequence: 0, Component: "HolidayCampList", Icon: "bonfire", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        { DefaultText: "News n Photos", DisplayText: "News & Photos", IsVisible: true, TabSequenceNo: 5, SuperMenuSequence: 0, Component: "NewsEvents", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },

        //No Component starts here
        { DefaultText: "Videos", DisplayText: "Videos", IsVisible: false, TabSequenceNo: 6, SuperMenuSequence: 0, Component: "VediosPage", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        { DefaultText: "Court Booking", DisplayText: "Court Booking", IsVisible: true, TabSequenceNo: 7, SuperMenuSequence: 0, Component: "BookingPage", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        //ends here

     //   { DefaultText: "Club Calendar", DisplayText: "Club Calendar", IsVisible: false, TabSequenceNo: 8, SuperMenuSequence: 0, Component: "Holiday", Icon: "calendar", Role: 2, Type: 2, Level: 2, IsApplicableVisibleFlag: true },

        //No Component starts here
        { DefaultText: "Results", DisplayText: "Tournament", IsVisible: false, TabSequenceNo: 9, SuperMenuSequence: 0, Component: "TournamentPage", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
      //  { DefaultText: "Coach Tips", DisplayText: "Coach Tips", IsVisible: false, TabSequenceNo: 10, SuperMenuSequence: 0, Component: "", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        //ends here
       // { DefaultText: "Member Activities", DisplayText: "Member Activities", IsVisible: false, TabSequenceNo: 11, SuperMenuSequence: 0, Component: "MyActivity", Icon: "ios-construct", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        //No Component starts here
       // { DefaultText: "Contact Us", DisplayText: "Contact Us", IsVisible: false, TabSequenceNo: 12, SuperMenuSequence: 0, Component: "", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        { DefaultText: "Misc Services", DisplayText: "Misc Services", IsVisible: false, TabSequenceNo: 13, SuperMenuSequence: 0, Component: "", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        //{ DefaultText: "Promotions", DisplayText: "Promotions    ", IsVisible: false, TabSequenceNo: 14, SuperMenuSequence: 0, Component: "", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        { DefaultText: "Others", DisplayText: "Others", IsVisible: false, TabSequenceNo: 15, SuperMenuSequence: 0, Component: "", Icon: "calendar", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
        //ends here
     
        { DefaultText: "Coaches", DisplayText: "Coaches", IsVisible: true, TabSequenceNo: 16, SuperMenuSequence: 0, Component: "CoachList", Icon: "body", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
     //   { DefaultText: "Fees", DisplayText: "Fees", IsVisible: false, TabSequenceNo: 17, SuperMenuSequence: 0, Component: "ActivityFees", Icon: "logo-foursquare", Role: 2, Type: 2, Level: 1, IsApplicableVisibleFlag: true },
      //  { DefaultText: "Payment", DisplayText: "Payment", IsVisible: false, TabSequenceNo: 19, SuperMenuSequence: 0, Component: "PaymentStatus", Icon: "card", Role: 2, Type: 2, Level: 2, IsApplicableVisibleFlag: true },
      //  { DefaultText: "Notification", DisplayText: "Notification", IsVisible: false, TabSequenceNo: 20, SuperMenuSequence: 0, Component: "NotificationDetails", Icon: "md-notifications", Role: 2, Type: 2, Level: 2, IsApplicableVisibleFlag: true },
         { DefaultText: "Partners", DisplayText: "Partners", IsVisible: false, TabSequenceNo: 21, SuperMenuSequence: 0, Component: "PartnersPage", Icon: "md-notifications", Role: 2, Type: 2, Level: 2, IsApplicableVisibleFlag: true },
       
         { DefaultText: "Events", DisplayText: "Events", IsVisible: false, TabSequenceNo: 21, SuperMenuSequence: 0, Component: "EventDetailsPage", Icon: "md-notifications", Role: 2, Type: 2, Level: 2, IsApplicableVisibleFlag: true },
    ];


    tabs = [];
    constructor(public alertCtrl: AlertController, public commonService: CommonService, public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                this.selectedClubKey = user.ClubKey;
                this.memberKey = user.MemberKey;
                this.getMenuSetup();
                this.getParentClubDetails();

                break;
            }

        }).catch(error => {


        });


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
            //    this.clubDetails = data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].IsEnable) {
                    this.clubDetails.push(data[i]);
                }
            }

        });
    }

    getParentClubDetails() {
        this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {
            this.parentClubDetails = data;
        });
    }
    getMenuSetup() {

        let x = [];

        //<summary>
        //
        //this is not working inside the firebase callback
        //so initialized this to local variable called currentInvokingObj
        //
        //<summary>

        let currentInvokingObj = this;

        let ref = firebase.database().ref('/').child("/TabConfig/Member/" + this.selectedParentClubKey);
        ref.once("value", function (snapshot) {
            x = snapshot.val();
            if (x == null) {
                currentInvokingObj.menuSetup();
            } else {
                currentInvokingObj.tabs = currentInvokingObj.commonService.convertFbObjectToArray(x);
                currentInvokingObj.tabs = currentInvokingObj.commonService.sortingObjects(currentInvokingObj.tabs, "TabSequenceNo",1)

                let flag = false;
                for (let i = 0; i < currentInvokingObj.tabs.length; i++) {
                    if (currentInvokingObj.tabs[i].IsVisible && currentInvokingObj.tabs[i].IsApplicableVisibleFlag) {
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
            currentInvokingObj.commonService.toastMessage(error.message,2500,ToastMessageType.Error);
        });
    }
    menuSetup() {

        for (let i = 0; i < this.menuList.length; i++) {
            this.fb.saveReturningKey("/TabConfig/Member/" + this.selectedParentClubKey, this.menuList[i]);
        }
        this.getTabConfigList();
    }
    getTabConfigList() {
        this.fb.getAllWithQuery("/TabConfig/Member/" + this.selectedParentClubKey, { orderByKey: true }).subscribe((data) => {
            for (let i = 0; i < data.length; i++) {
                data[i].Key = data[i].$key;
            }
            this.tabs = data;
            this.showTabView = this.tabs[0].IsVisible;
        });
    }
    reorderItems(indexes) {
        // if (indexes.from != 0) {
        let element = this.tabs[indexes.from];
        this.tabs.splice(indexes.from, 1);
        this.tabs.splice(indexes.to, 0, element);

        for (let tabIndex = 0; tabIndex < this.tabs.length; tabIndex++) {
            this.fb.update(this.tabs[tabIndex].Key, "/TabConfig/Member/" + this.selectedParentClubKey, { TabSequenceNo: tabIndex });
        }
        let message = "Menus reorderd successfully."
        this.commonService.toastMessage(message,2500,ToastMessageType.Success);
        // } 
        // else {
        //     let message = "You can not reorder the first element.";
        //     this.showToast(message, 3000);
        // }
    }
    enableReorder() {
        this.reOrderToggle = !this.reOrderToggle;
        this.navText = this.reOrderToggle ? "Done" : "Re-order";
    }



    //<summary>
    //
    //  ON / OFF functionality (if OFF then should not appear in the member app)
    //  if OFF => make IsVisible flag to false
    //  if ON  => make IsVisible flag to true
    //
    //<summary>

    changeNotificationToggleAll() {
        for (let loop = 0; loop < this.tabs.length; loop++) {

            if (!this.toggleAll && this.tabs[loop].IsApplicableVisibleFlag) {
                // if (this.tabs[loop].DisplayText == 'Tournament' || this.tabs[loop].DisplayText == 'Tournaments') {
                //     this.tabs[loop].IsAllowNotification = true;
                //     this.fb.update(this.tabs[loop].Key, "/TabConfig/Member/" + this.selectedParentClubKey, {
                //         IsVisible: true,
                //         Component: 'TournamentPage'
                //     });
                // } else {
                    this.tabs[loop].IsAllowNotification = true;
                    this.fb.update(this.tabs[loop].Key, "/TabConfig/Member/" + this.selectedParentClubKey, { IsVisible: true });
                // }
            } else if (this.tabs[loop].IsApplicableVisibleFlag) {
                this.tabs[loop].IsAllowNotification = false;
                this.fb.update(this.tabs[loop].Key, "/TabConfig/Member/" + this.selectedParentClubKey, { IsVisible: false });
            }
        }
        this.getTabConfigList();

    }

    //<summary>
    //
    //  ON / OFF functionality (if OFF then should not appear in the member app)
    //  if OFF => make IsVisible flag to false
    //  if ON  => make IsVisible flag to true
    //
    //<summary>
    changeNotificationToggle(tabItem, index) {
        if (tabItem.DisplayText == 'Tournament' || tabItem.DisplayText == 'Tournaments') {

            this.fb.update(tabItem.Key, "/TabConfig/Member/" + this.selectedParentClubKey, {
                IsVisible: !tabItem.IsVisible,
                Component: 'TournamentPage'
            });
        } else {
            this.fb.update(tabItem.Key, "/TabConfig/Member/" + this.selectedParentClubKey, { IsVisible: !tabItem.IsVisible });
            let flag = false;
            for (let i = 0; i < this.tabs.length; i++) {
                if (!tabItem.IsVisible) {
                    this.toggleAll = true;
                    flag = true;
                    break;
                }
                if (this.tabs[i].IsVisible && i != index) {
                    this.toggleAll = true;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                this.toggleAll = false;
            }

        }
    }

    saveText(tabItem) {

        let prompt = this.alertCtrl.create({
            subTitle: tabItem.DisplayText,
            message: "Modify tab details!",
            inputs: [
                {
                    name: 'DisplayText',
                    placeholder: 'Display Text',
                    value: tabItem.DisplayText
                }
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


                        if (this.validateInputs(data)) {
                            this.fb.update(tabItem.Key, "/TabConfig/Member/" + this.selectedParentClubKey, { DisplayText: data.DisplayText });
                            this.getTabConfigList();
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    //<Summary>
    //
    //‘display text’ (recommended length upto 20 characters 
    //
    //</Summary>
    validateInputs(data): boolean {
        if (data.DisplayText.length == 0 || data.DisplayText.length > 20) {
            if (data.DisplayText.length == 0) {
                this.commonService.toastMessage("Display text must not be empty", 2500,ToastMessageType.Error);
                return false;
            } else {
                this.commonService.toastMessage("Display text length must not exceed 20", 2500,ToastMessageType.Error);
                return false;
            }
        } else {
            return true;
        }
    }

    changeMemberTheme() {
        this.fb.update(this.tabs[0].Key, "/TabConfig/Member/" + this.selectedParentClubKey, { IsTabView: this.showTabView });
    }
    goTocreatepage(){
        this.showalert("Please talk to ActivityPro support team if you want to add anything.")
        //this.navCtrl.push("AddtabPage");
    }
    showalert(messege){
        let alert = this.alertCtrl.create({
          title: 'Attention!',
          message:messege,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.navCtrl.push('AddtabPage')
              }   
            },
        
          ]
        });
        alert.present();
      }
    
}
interface Menus {
    DefaultText: string;
    DisplayText: string;
    IsVisible: boolean;
    TabSequenceNo: number;
    Component: string;
    Icon: string;
    Role: number;
    Type: number;
    Level: number;
    IsApplicableVisibleFlag: boolean;
    SuperMenuSequence: number;
    Key?: string;
    IsTabView?: boolean;
}