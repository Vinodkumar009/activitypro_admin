import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2ActivitySetupHome } from './activitysetuphome';
import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'activitysetuplist-page',
  templateUrl: 'activitysetuplist.html'
})

export class Type2ActivitySetupList {
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
  selectedClubKey: any;
  allClub: any;
  allActivityArr = [];
  selectedActivity: any;
  allActivitySetup = [];
  activitySetupArr = [];
  orgActivitySetupArr = [];
  constructor(public commonService:CommonService,public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
     public fb: FirebaseService, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getAllClub();

        }
    })
  }


  goTo(obj) {
    this.navCtrl.push(obj.component);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: myEvent
    });
  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot(Dashboard);
  }

  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: 'bottom'
    });
    toast.present();
  }

  gotoActivitySetupHome() {
    this.navCtrl.push("Type2ActivitySetupHome");
  }

  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = data4;
        this.selectedClubKey = this.allClub[0].$key;
        this.getAllActivity();
      }
    })
  }

  onClubChange() {
    this.getAllActivity();
  }

  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.allActivityArr = [];
      if (data.length > 0) {
        this.allActivityArr = data;
        this.selectedActivity = data[0].$key;
        this.getActivitySetup();
      }
    })
  }

  getActivitySetup() {
    if (this.allActivityArr.length != undefined) {
      this.activitySetupArr = [];
      this.orgActivitySetupArr = [];
      for (let i = 0; i < this.allActivityArr.length; i++) {
        if (this.selectedActivity == this.allActivityArr[i].$key) {
          this.activitySetupArr.push(this.allActivityArr[i]);
          if (this.activitySetupArr.length != undefined) {
            for (let j = 0; j < this.activitySetupArr.length; j++) {
              if (this.activitySetupArr[j].ActivitySetup != undefined) {
                this.activitySetupArr[j].ActivitySetupArr = this.commonService.convertFbObjectToArray(this.activitySetupArr[j].ActivitySetup);
                for(let k = 0; k < this.activitySetupArr[j].ActivitySetupArr.length; k++){
                    this.orgActivitySetupArr.push(this.activitySetupArr[j].ActivitySetupArr[k]);
                }
              }

            }
          }
        }
      }
      if(this.orgActivitySetupArr.length > 0){
          for(let m = 0; m < this.orgActivitySetupArr.length; m++){
              if(this.orgActivitySetupArr[m].Indoor != undefined && this.orgActivitySetupArr[m].Outdoor != undefined){
                  this.orgActivitySetupArr[m].IndoorArr = this.commonService.convertFbObjectToArray(this.orgActivitySetupArr[m].Indoor);
                  this.orgActivitySetupArr[m].OutdoorArr = this.commonService.convertFbObjectToArray(this.orgActivitySetupArr[m].Outdoor);
              }
              
          }
      }
    }
  }

  editActivitySetup(){
    
  }
}
