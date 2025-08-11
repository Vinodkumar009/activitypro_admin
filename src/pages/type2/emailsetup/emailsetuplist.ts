import { Component } from '@angular/core';
import {ToastController, NavController,  PopoverController,  LoadingController, ActionSheetController} from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddActivityEmailSetup } from './addactivityemailsetup';
// import { Type2AddMembershipEmailSetup } from './addmembershipemailsetup';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'emailsetuplist-page',
  templateUrl: 'emailsetuplist.html'
})

export class Type2EmailSetupList {
  themeType: number;
  parentClubKey: string;
  allClub = [];
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
  emailSetupTab: string = "activity";
  activePromotion = [];
  pastPromotion = [];
  selectedActivity: any;
  allActivityArr = [];
  activityEmailSetupArr = [];
  membershipEmailSetupArr = [];
  AddEmailSetup = "Add Email Setup"
  constructor(public toastCtrl: ToastController,public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public actionSheetCtrl: ActionSheetController, public popoverCtrl: PopoverController) {

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

  goToAddEmailSetup() {
    if (this.emailSetupTab == "activity") {
      if (this.activityEmailSetupArr.length == 0) {
        this.navCtrl.push("Type2AddActivityEmailSetup");
      }
      else {
        let message = "One email setup is already present under this club and activity.You can't add more.";
        this.showToast(message, 2000);
        return false;
      }
    } else if (this.emailSetupTab == "membership") {
      if(this.membershipEmailSetupArr.length == 0){
        this.navCtrl.push("Type2AddMembershipEmailSetup");
      }
      else{
        let message = "One email setup is already present under this club.You can't add more.";
        this.showToast(message, 2000);
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
        this.getMembershipEmailSetup();
      }
    })
  }

  presentpopover(ac){
    let actionSheet
    // if (this.platform.is('android')) {
    actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: 'Edit',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("Type2AddActivityEmailSetup",{setup:ac, selectedclubkey:this.selectedClub, selectedActivity:this.selectedActivity});
       
        },
      }]
    })
  
    actionSheet.present();
  }

  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      this.allActivityArr = [];
      if (data.length > 0) {
        this.allActivityArr = data;
        this.selectedActivity = data[0].$key;
        this.getEmailSetup();
      }
    })
  }

  onClubChange() {
    this.activityEmailSetupArr = [];
    this.getAllActivity();
  }

  getEmailSetup() {
    this.fb.getAll("/EmailSetup/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/ActivityEmailSetup/" + this.selectedActivity + "/").subscribe((data) => {
      this.activityEmailSetupArr = [];
      if (data.length > 0) {
        this.activityEmailSetupArr = data;
      }
    })
  }

  getMembershipEmailSetup() {
    this.fb.getAll("/EmailSetup/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/MembershipEmailSetup/").subscribe((data) => {
      this.membershipEmailSetupArr = [];
      if (data.length > 0) {
        this.membershipEmailSetupArr = data;
      }
    })
  }



}
