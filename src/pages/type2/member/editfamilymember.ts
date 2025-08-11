import { Component } from '@angular/core';
import { NavController,PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Type2Member } from './member';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'editfamilymember-page',
  templateUrl: 'editfamilymember.html'
})

export class Type2EditFamilyMember {
themeType:number ;
  constructor(public navCtrl: NavController,public sharedservice:SharedServices, public popoverCtrl:PopoverController) {
    this.themeType = sharedservice.getThemeType();
    //console.log(this.themeType);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  save(){
      this.navCtrl.push("Type2Member");
  }

  goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
 