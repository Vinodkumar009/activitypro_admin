import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController, AlertController } from "ionic-angular";
import { Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { LanguageService } from '../../../services/language.service';
@IonicPage()
@Component({
  selector: 'createholidaydiscounts-page',
  templateUrl: 'createholidaydiscounts.html'
})

export class Type2CreateHolidayDiscounts {
  LangObj:any = {};//by vinod
  themeType: any;
  parentClubKey = "";
  // sessionList = [];
  // memberList = [];
  // myIndex = -1;
  // activityDiscountList = [];
  // clubDiscountList = [];
  holidayCampDiscounts = {
    DiscountName: '',
    AbsoluteValue: '',
    IsActive: true,
    IsEnable: true,
    PercentageValue: '',
    DiscountCode: '',
    CreationTime: 0,
  };
  constructor(public events: Events, public comonService: CommonService, public viewCtrl: ViewController, public fb: FirebaseService, private toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private navParams: NavParams, public navCtrl: NavController, public storage: Storage, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController,
    private langService:LanguageService) {

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });
    this.themeType = sharedservice.getThemeType();

  }

  ionViewDidLoad() {
  this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  getLanguage(){
    this.storage.get("language").then((res)=>{
      console.log(res["data"]);
     this.LangObj = res.data;
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

  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }
  cancel() {
    this.navCtrl.pop();
  }



  createHolidayCampDiscount() {
    if (this.validation()) {
      this.holidayCampDiscounts.PercentageValue = parseFloat(this.holidayCampDiscounts.PercentageValue).toFixed(2);
      this.holidayCampDiscounts.AbsoluteValue = parseFloat(this.holidayCampDiscounts.AbsoluteValue).toFixed(2);
      this.holidayCampDiscounts.CreationTime = new Date().getTime();
      this.fb.saveReturningKey("HolidayCampCharges/" + this.parentClubKey + "/Discounts/", this.holidayCampDiscounts);
      this.showToast("Discount created successfully.", 2500);
      this.navCtrl.pop();
    }
  }

  validation(): boolean {
    if (this.holidayCampDiscounts.DiscountName == "" || this.holidayCampDiscounts.DiscountName == undefined) {
      this.showToast("Enter discount name.", 2500);
      return false;
    } else if (this.holidayCampDiscounts.DiscountCode == "" || this.holidayCampDiscounts.DiscountCode == undefined) {
      this.showToast("Enter discount code.", 2500);
      return false;
    }
    else if (this.holidayCampDiscounts.PercentageValue == "" || this.holidayCampDiscounts.PercentageValue == undefined) {
      this.showToast("Enter percentage value.", 2500);
      return false;
    }
    else if (this.holidayCampDiscounts.AbsoluteValue == "" || this.holidayCampDiscounts.AbsoluteValue == undefined) {
      this.showToast("Enter absoulute value.", 2500);
      return false;
    }
    return true;
  }















  // moveToTrashClubDiscount(discount) {

  //   let confirm = this.alertCtrl.create({
  //     title: 'Discount Alert',
  //     message: 'Are you sure you want to remove the discount?',
  //     buttons: [
  //       {
  //         text: 'No',
  //         handler: () => {
  //           console.log('Disagree clicked');
  //         }
  //       },
  //       {
  //         text: 'Yes',
  //         handler: () => {
  //           console.log();
  //           this.fb.update(discount.Key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ClubDiscount/", { IsActive: false });
  //           this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByKey: true, equalTo: this.campDetails.$key }).subscribe((data) => {
  //             this.campDetails = data[0];
  //             this.clubDiscountList = [];
  //             if (this.campDetails.ClubDiscount != undefined) {
  //               let clubDisc = this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
  //               clubDisc.forEach(element => {
  //                 if (element.IsActive) {
  //                   this.clubDiscountList.push(element);
  //                 }
  //               });
  //             }
  //           });

  //         }
  //       }
  //     ]
  //   });
  //   confirm.present();
  // }

  // moveToTrashActivityDiscount(discount) {

  //   let confirm = this.alertCtrl.create({
  //     title: 'Discount Alert',
  //     message: 'Are you sure you want to remove the discount?',
  //     buttons: [
  //       {
  //         text: 'No',
  //         handler: () => {
  //           console.log('Disagree clicked');
  //         }
  //       },
  //       {
  //         text: 'Yes',
  //         handler: () => {
  //           console.log();
  //           this.fb.update(discount.Key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ActivityDiscount/", { IsActive: false });
  //           this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByKey: true, equalTo: this.campDetails.$key }).subscribe((data) => {
  //             this.campDetails = data[0];
  //             this.clubDiscountList = [];
  //             this.activityDiscountList = [];
  //             if (this.campDetails.ClubDiscount != undefined) {
  //               let clubDisc = this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
  //               clubDisc.forEach(element => {
  //                 if (element.IsActive) {
  //                   this.clubDiscountList.push(element);
  //                 }
  //               });
  //             }

  //             if (this.campDetails.ActivityDiscount != undefined) {
  //               let activitydisc = this.comonService.convertFbObjectToArray(this.campDetails.ActivityDiscount);
  //               activitydisc.forEach(element => {
  //                 if (element.IsActive) {
  //                   this.activityDiscountList.push(element);
  //                 }
  //               });
  //             }


  //           });

  //         }
  //       }
  //     ]
  //   });
  //   confirm.present();
  // }
}

