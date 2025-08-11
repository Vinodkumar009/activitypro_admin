// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';


import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'reportbooking-page',
  templateUrl: 'reportbooking.html'
})

export class Type2ReportBooking {
  themeType: number;
  loading: any;
  coachKey: any;
  parentClubKey: any;

  obj = {
    Message: ''
  }

  constructor(public loadingCtrl: LoadingController, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.obj.Message = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;

      }
      // this.loading.dismiss().catch(() => { });
    })

  }
  cancel() {
    this.navCtrl.pop();
  }
  pay(){
    
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

}




