import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddSchool } from './addschool';
// import { Dashboard } from './../../dashboard/dashboard';
import { CommonService } from "../../../services/common.service";

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'school-page',
  templateUrl: 'school.html'
})

export class Type2School {
  themeType: number;
  parentClubKey: string;
  schools: any;
  clubs: any;
  selectedClub: any;
  menus: Array<{ DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebLocalImage: string;
    WebIcon:string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  platform:string = "";
  constructor(public loadingCtrl: LoadingController, storage: Storage, public commonService: CommonService,
    public navCtrl: NavController, public sharedservice: SharedServices,
     public fb: FirebaseService, public popoverCtrl: PopoverController) {
      this.platform = this.sharedservice.getPlatform();
      this.themeType = sharedservice.getThemeType();
      this.menus = sharedservice.getMenuList();
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        for (let club of val.UserInfo)
          if (val.$key != "") {
            this.parentClubKey = club.ParentClubKey;
            this.getSchoolLists()
          }
      })
  }

  getSchoolLists() {
    const schools$Obs = this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
      schools$Obs.unsubscribe();
      this.schools = data;
      console.table(this.schools);
    });

  }
  ionViewDidLoad() {
      
    this.commonService.screening("Type2School");
  
}
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  gotoAddSchool(){
    this.navCtrl.push("Type2AddSchool");
  }

  gotoaddnewschool(){
    this.navCtrl.push('AddnewSchool')
  }

   goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
