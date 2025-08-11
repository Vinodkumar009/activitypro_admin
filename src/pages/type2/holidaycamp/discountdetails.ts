import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController, AlertController } from "ionic-angular";
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'discountdetails-page',
  templateUrl: 'discountdetails.html'
})

export class Type2CampDiscountList {
  themeType: any;
  parentClubKey = "";
  campDetails: any;
  sessionList = [];
  memberList = [];
  myIndex = -1;
  activityDiscountList = [];
  clubDiscountList = [];

  constructor(public comonService:CommonService,public viewCtrl: ViewController, public fb: FirebaseService, private toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private navParams: NavParams, public navCtrl: NavController, storage: Storage, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
    try {

      this.themeType = sharedservice.getThemeType();
      this.campDetails = navParams.get('CampDetails');
      this.parentClubKey = this.campDetails.ParentClubKey;
      if (this.campDetails.ActivityDiscount != undefined) {

        let activitydisc = this.comonService.convertFbObjectToArray(this.campDetails.ActivityDiscount);
        activitydisc.forEach(element => {
          if (element.IsActive) {
            this.activityDiscountList.push(element);
          }
        });
      }
      if (this.campDetails.ClubDiscount != undefined) {
        let clubDisc = this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
        clubDisc.forEach(element => {
          if (element.IsActive) {
            this.clubDiscountList.push(element);
          }
        });
      }
    } catch (ex) {
      this.showToast(ex.message, 1000);
    }
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
  moveToTrashClubDiscount(discount) {

    let confirm = this.alertCtrl.create({
      title: 'Discount Alert',
      message: 'Are you sure you want to remove the discount?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log();
            this.fb.update(discount.Key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ClubDiscount/", { IsActive: false });
            this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByKey: true, equalTo: this.campDetails.$key }).subscribe((data) => {
              this.campDetails = data[0];
              this.clubDiscountList = [];
              if (this.campDetails.ClubDiscount != undefined) {
                let clubDisc = this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
                clubDisc.forEach(element => {
                  if (element.IsActive) {
                    this.clubDiscountList.push(element);
                  }
                });
              }
            });

          }
        }
      ]
    });
    confirm.present();
  }

  moveToTrashActivityDiscount(discount) {

    let confirm = this.alertCtrl.create({
      title: 'Discount Alert',
      message: 'Are you sure you want to remove the discount?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log();
            this.fb.update(discount.Key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ActivityDiscount/", { IsActive: false });
            const camp$Obs = this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByKey: true, equalTo: this.campDetails.$key }).subscribe((data) => {
              camp$Obs.unsubscribe();
              this.campDetails = data[0];
              this.clubDiscountList = [];
              this.activityDiscountList = [];
              if (this.campDetails.ClubDiscount != undefined) {
                let clubDisc = Array.isArray(this.campDetails.ClubDiscount) ? this.campDetails.ClubDiscount: this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
                clubDisc.forEach(element => {
                  if (element.IsActive) {
                    this.clubDiscountList.push(element);
                  }
                });
              }

              if (this.campDetails.ActivityDiscount != undefined) {
                let activitydisc = Array.isArray(this.campDetails.ActivityDiscount) ? this.campDetails.ActivityDiscount: this.comonService.convertFbObjectToArray(this.campDetails.ActivityDiscount);
                activitydisc.forEach(element => {
                  if (element.IsActive) {
                    this.activityDiscountList.push(element);
                  }
                });
              }


            });

          }
        }
      ]
    });
    confirm.present();
  }
}

