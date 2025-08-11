
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";
import { InAppBrowser } from '@ionic-native/in-app-browser';
@IonicPage()
@Component({
    selector: 'aboutus-page',
    templateUrl: 'aboutus.html'
    
})

export class AboutUsPage {
    clubDetails = [];
    selectedParentClubKey: any;
    selectedClubKey: any;
    memberKey: any;
    app;
   
  themeType: number;
  parentClubInfo: any;
  appInfo: any;
    constructor(private iab: InAppBrowser,public alertCtrl: AlertController, public commonService: CommonService, public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
     
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                this.selectedClubKey = user.ClubKey;
                this.memberKey = user.MemberKey;
                // this.themeType = sharedservice.getThemeType();
                this.getParentClubImage()
                this.getVersionDetails()
                //  this.getParentClubDetails();

                break;
            }

        }).catch(error => {


        });


    }
    getParentClubImage() {
      this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo:  this.selectedParentClubKey  }).subscribe((data) => {
        this.parentClubInfo = data[0];
      })
    }

    getVersionDetails(){
      this.fb.getAllWithQuery("AppInfo/", { orderByKey: true, equalTo:  this.selectedParentClubKey  }).subscribe((data) => {
        this.appInfo = data[0];
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

    gotoPrivacypolicy(){
     const browser = this.iab.create('https://www.activitypro.co.uk', '_blank');
     browser.show();
  }
}
