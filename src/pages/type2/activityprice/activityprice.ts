import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController,ActionSheetController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AssignDiscountList } from './assigndiscountlist';
// import { Dashboard } from './../../dashboard/dashboard';
// import { Type2AssignDiscountListClub } from './assigndiscountlistclub';
// import { Type2AssignChargeListClub } from './assignchargelistclub';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'activityprice-page',
  templateUrl: 'activityprice.html'
})

export class ActivityPrice {
  themeType: number;
  parentClubKey: string;
  schools: any;
  clubs: any;
  selectedClub: any;
  selectedLevelType: any;
  allClub = [];
  selectedActivity: any;
  activity = [];
  discount = [];
  discount1 = [];
  discountChargesTab: string = "discount";
  selectedClubKey: any;
  selectedClubname: string;
  discountList = [];
  chargeList = [];
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
  clubDisCountArr = [];
  userData: any;
  currencyDetails: any;

  PriceSetup:{
    MemberPricePerHour : 0.00,
    NonMemberPricePerHour : 0.00,
    IsActive : true,
    CreateDate:0,
  }
  PriceList: any[];
  constructor(public commonService:CommonService, public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public popoverCtrl: PopoverController, public actionSheetCtrl: ActionSheetController) {

    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
  })

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getAllClub();
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


  getClubAgainstParentClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {

      if (data.length > 0) {
        this.allClub = data;

      }
    })
    this.selectedClub = "";
    this.selectedActivity = "";
  }


  // getAllDiscount() {
  //   this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/Discount/").subscribe((data3) => {
  //     this.discount = data3;
  //   })
  // }

  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = data4;
        this.selectedClubKey = this.allClub[0].$key;
        this.getAllActivity();

      }



    })
  }


  getAllActivity() {
    this.PriceList = [];
    if (this.allClub.length > 0) {
      for (let i = 0; i < this.allClub.length; i++) {
        this.selectedClubname = "";
        if (this.selectedClubKey == this.allClub[i].$key) {
          this.selectedClubname = this.allClub[i].ClubName;
        }
      }
    }
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey).subscribe((data1) => {

      this.activity = data1;
      this.getActivityPrice()


    })
  }


  getActivityPrice() {
    if (this.activity.length != undefined) {
      for (let i = 0; i < this.activity.length; i++) {

        if (this.activity[i].PriceSetup == undefined) {
          this.activity[i]['PriceSetup'] = {
            MemberPricePerHour : 8.00,
            NonMemberPricePerHour : 10.00,
            IsActive : true,
            CreateDate:0,
          }
         this.activity[i]['PriceSetup'].MemberPricePerHour = parseFloat(this.activity[i]['PriceSetup'].MemberPricePerHour).toFixed(2)
         this.activity[i]['PriceSetup'].NonMemberPricePerHour = parseFloat(this.activity[i]['PriceSetup'].NonMemberPricePerHour).toFixed(2)
        }
      }
    }
  }


  onClubChange() {
    this.getAllActivity();
  }


  save(){
    if (this.activity.length != undefined) {
      for (let i = 0; i < this.activity.length; i++) {
        if (this.activity[i].PriceSetup.MemberPricePerHour != '' && this.activity[i].PriceSetup.NonMemberPricePerHour != '') {
          let key = this.activity[i].$key
          delete this.activity[i].$key
          this.activity[i].PriceSetup.CreateDate = new Date().getTime()
          let priceSetup = this.activity[i].PriceSetup
          delete this.activity[i].PriceSetup
          this.fb.update(key,"/Activity/" + this.parentClubKey + "/" + this.selectedClubKey, {PriceSetup:priceSetup})

        }
      }
      this.showToast('Price added successfully...')
      this.navCtrl.pop()
    }
  }
  
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
