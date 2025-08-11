import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddVenue } from '../venue/addvenue';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'courtsetup-page',
  templateUrl: 'courtsetup.html'
})

export class Type2CourtSetup {
  themeType: number;
  clubs: any;
  x: any;
  constructor(storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          if(val.UserType=="2"){
            this.clubs =[];
           this.fb.getAllWithQuery("/Club/Type2/" + club.ParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            this.clubs = data;
          });
          }
        }
    }).catch(error => {
     // alert("Errr occured");
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        //for (let club of val.UserInfo)
          if (val.$key != "") {
           // this.fb.getAll("/Club/" + club.ParentClubKey).subscribe((data) => {
           //   this.clubs = data;
           // });
          }
      });
    });


  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  showSelected() {
    alert();
  }
addVenue(){
  this.navCtrl.push("Type2AddVenue");
}


goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
