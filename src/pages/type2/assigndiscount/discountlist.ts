import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController,ActionSheetController } from 'ionic-angular';
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
  selector: 'discountlist-page',
  templateUrl: 'discountlist.html'
})

export class Type2DiscountList {
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
  constructor(public commonService:CommonService,public loadingCtrl: LoadingController, storage: Storage,
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
  goToAssignDiscount() {
    this.navCtrl.push("Type2AssignDiscountList");
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


  getAllDiscount() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/Discount/").subscribe((data3) => {
      this.discount = data3;
    })
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


  getAllActivity() {
    this.discountList = [];
    if (this.allClub.length > 0) {
      for (let i = 0; i < this.allClub.length; i++) {
        this.selectedClubname = "";
        if (this.selectedClubKey == this.allClub[i].$key) {
          this.selectedClubname = this.allClub[i].ClubName;
          let allDiscountList = this.commonService.convertFbObjectToArray(this.allClub[i].Discount);
          allDiscountList.forEach((discount)=>{
            if(discount.IsActive){
              this.discountList.push(discount);
            }
          })
          this.chargeList = this.commonService.convertFbObjectToArray(this.allClub[i].Charges);
          break;
        }
      }
    }
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey).subscribe((data1) => {

      this.activity = data1;
      this.getActivityDiscount()


    })
  }


  getActivityDiscount() {
    if (this.activity.length != undefined) {
      for (let i = 0; i < this.activity.length; i++) {
        this.activity[i].DiscountArr = [];
        if (this.activity[i].Discount != undefined) {
          let x = this.commonService.convertFbObjectToArray(this.activity[i].Discount);
         
          x.forEach(discount => {
            if(discount.IsActive)
            {
              this.activity[i].DiscountArr.push(discount)
            }
          });
        }
      }
    }
  }


  onClubChange() {
    this.getAllActivity();
  }
  clublevelEdit(item){
    const actionSheet = this.actionSheetCtrl.create({
      //  title: 'Send Report',
        buttons: [
         
            {
                text: 'Edit',
                handler: () => {
                  this.gotoClubAssignDiscountPage(item)
              }
            },
            
        
                   
        ]
    });
    actionSheet.present();
  }

  activitylevelEdit(activity){
    const actionSheet = this.actionSheetCtrl.create({
      //  title: 'Send Report',
        buttons: [
         
            {
                text: 'Edit',
                handler: () => {
                  this. gotoActivityAssignDiscountPage(activity)
              }
            },
            
        
                   
        ]
    });
    actionSheet.present();  
  }
  gotoActivityAssignDiscountPage(activity) {
    this.navCtrl.push("Type2AssignDiscountList", { selectedClubKey: this.selectedClubKey, activitykey: activity.$key,activityDetails:activity });
  }

  gotoClubAssignDiscountPage(clubDetails) {
    this.navCtrl.push("Type2AssignDiscountListClub", { selectedClubKey: this.selectedClubKey,clubDetails:clubDetails });
  }

  gotoClubAssignChargePage(clubChargeDetails){
    this.navCtrl.push("Type2AssignChargeListClub", { selectedClubKey: this.selectedClubKey,clubChargeDetails:clubChargeDetails});
  }

}
