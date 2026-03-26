
import { Component, ViewChild } from '@angular/core';
import { ViewController, NavController, Slides, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { IonicPage, NavParams, AlertController, ModalController } from 'ionic-angular';
import { FabContainer } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';

@IonicPage()
@Component({
  selector: 'page-notificationdetails',
  templateUrl: 'notificationdetails.html'
})
export class NotificationDetails {
  @ViewChild(Slides) slides: Slides;
  themeType: number;
  isAndroid: boolean = false;
  notificationDetails: any;
  constructor(platform: Platform, public sharedservice: SharedServices, public modalCtrl: ModalController, public alertCtrl: AlertController, public commonService: CommonService, private viewCtrl: ViewController, public toastCtrl: ToastController, public popoverCtrl: PopoverController,
    public navCtrl: NavController, public storage: Storage, public fb: FirebaseService, public navParams: NavParams) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    this.notificationDetails = navParams.get('NotificationDetail');
    console.log(this.notificationDetails);

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {

      }
    })
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }




}