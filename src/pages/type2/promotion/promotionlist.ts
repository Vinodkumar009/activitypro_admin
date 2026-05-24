import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddPromotion } from './addpromotion';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'promotionlist-page',
  templateUrl: 'promotionlist.html'
})

export class Type2PromotionList {
  themeType: number;
  NoActivePromotion = "No Active Promotion";
  NoPastPromotion = "No Past Promotion";
  parentClubKey: string;
  allClub: any;
  selectedClub: any;
  allPromotion = [];
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
  promotionTab: string = "active";
  activePromotion = [];
  pastPromotion = [];
  upcomingPromotion = [];
  constructor(public loadingCtrl: LoadingController, storage: Storage,
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


  
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  goToAddPromotion() {
    this.navCtrl.push("Type2AddPromotion");
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getClubList() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      if (data.length > 0) {
        this.allClub = data;
        this.selectedClub = this.allClub[0].$key;
        this.getAllPromotion();
      }
    })
  }

  onClubChange() {
    this.getAllPromotion();
  }

  getAllPromotion() {
    this.fb.getAll("/Promotion/Type2/" + this.parentClubKey + "/" + this.selectedClub).subscribe((data1) => {

      this.allPromotion = [];
      if (data1.length > 0) {
        this.allPromotion = data1;
        this.activePromotion = [];
        this.pastPromotion = [];
        this.upcomingPromotion = [];
        for (let index = 0; index < this.allPromotion.length; index++) {
          var q = new Date();
          var m = q.getMonth();
          var d = q.getDate();
          var y = q.getFullYear();

          var date = new Date(y, m, d);
          var promodate = new Date(this.allPromotion[index].EndDate);
          if (date.getTime() > promodate.getTime()) {
            this.pastPromotion.push(this.allPromotion[index]);
          }
          else if(date.getTime() <= promodate.getTime()){
            this.activePromotion.push(this.allPromotion[index]);
          }
          // else if(date.getTime() < promodate.getTime()){
          //   this.upcomingPromotion.push(this.allPromotion[index]);
          // }
        }
        console.log(this.pastPromotion);
        console.log(this.activePromotion);
        console.log(this.upcomingPromotion);
      }
    })
  }

  editActivePromo(activePromoObj){
      this.navCtrl.push("Type2EditPromotion", { activePromoObj: activePromoObj, clubKey: this.selectedClub,promoKey:activePromoObj.$key });
  }



}
