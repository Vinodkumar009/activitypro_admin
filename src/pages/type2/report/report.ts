// import { Dashboard } from '../../dashboard/dashboard';
// import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import {NavParams, NavController,  PopoverController} from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { LanguageService } from '../../../services/language.service';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'report-page',
  templateUrl: 'report.html'
})

export class Type2Report {
  LangObj:any = {};//by vinod
   themeType: number;
  //menus: Array<{ title: string, component: any, icon: string, Level: number }>;
  menus = [];
  constructor(public events: Events,public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,public storage: Storage,private langService:LanguageService,) {
    this.themeType = sharedservice.getThemeType();



    this.menus = [];
    let x = [];
    x = this.sharedservice.getMenuList();
    for (let i = 0; i < x.length; i++) {
      if (x[i].Level == 3) {
        this.menus.push(x[i]);
      }
    }


  }
  // ionViewDidEnter() {
  //   this.menus = [];
  //   let x = [];
  //   x = this.sharedservice.getMenuList();
  //   for (let i = 0; i < x.length; i++) {
  //     if (x[i].Level == 2) {
  //       this.menus.push(x[i]);
  //     }
  //   }
  // }
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
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  goTo(obj) {
    this.navCtrl.push(obj.MobComponent);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
}
