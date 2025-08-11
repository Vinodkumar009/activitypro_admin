import { Component } from '@angular/core';
import { NavController,PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Type2ContinueAddMember } from './continueaddmember';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'editmember-page',
  templateUrl: 'editmember.html'
})

export class Type2EditMember {
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
  continue(){
      this.navCtrl.push("Type2ContinueAddMember");
  }
  cancelEditmember(){
    this.navCtrl.pop(); 
  }

  goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
 