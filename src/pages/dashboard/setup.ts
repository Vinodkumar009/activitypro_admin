// import {Dashboard} from './dashboard';
import { Component } from '@angular/core';
import { Events, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavParams, NavController, PopoverController,IonicPage } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { CommonService } from '../../services/common.service';
// import { PopoverPage } from '../popover/popover';

@IonicPage()
@Component({
  selector: 'setup-page',
  templateUrl: 'setup.html'
})

export class Setup {
  themeType: number;
  LangObj:any = {};//by vinod 
  menus = [];
  constructor(public events: Events, public alertCtrl: AlertController, public navParams: NavParams,public commonService: CommonService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,public storage:Storage) {
    this.themeType = sharedservice.getThemeType();
    this.menus = [];
    let x = [];
    x = this.sharedservice.getMenuList();
    for (let i = 0; i < x.length; i++) {
      //if (x[i].Level == 2 && x[i].IsEnable) { vinod commented after menus api done -->
      if (x[i].Level == 2) {
        this.menus.push(x[i]);
      }
    }
    //console.log(this.menus);

  }
  // //added by vinod
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
  //returning label
  getLabel(label:string){
   return this.LangObj[label];
  }
  //added by vinod ends here

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  goTo(obj) {
    this.commonService.screening(obj.MobComponent)
    if(obj.MobComponent == 'StaffattendancesetupPage'){
      this.showAlter('Coming Soon...')
      return false;
    }
    // else if( obj.component == 'WalletPage'){
    //   this.showAlter1(obj)
     
    // }
    
    else if(obj.MobComponent == 'MembershipPage'){
      this.commonService.updateCategory("update_membership_list");
    }
    else if(obj.MobComponent == 'Type2ManageCoach'){
      this.commonService.updateCategory("coach_list");
    }
    else if(obj.MobComponent === "TermsandconditionsPage"){
        const alert_msg = "We are upgrading our platform. This module is temporarily unavailable. We apologise for the inconvenience."
        this.commonService.alertWithText("Info",alert_msg,"OK");
        return false;
    }

    this.navCtrl.push(obj.MobComponent);
  }
  showAlter(title:string){
    let confirm = this.alertCtrl.create({
      title: title,
  
      buttons: [
          {
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                  console.log('Disagree clicked');
              }
          }
       
      ]
  });
  confirm.present();
  }

  showAlter1(obj){
    let confirm = this.alertCtrl.create({
      title: 'Coming Soon...',
  
      buttons: [
          {
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                  console.log('Disagree clicked');
                  this.navCtrl.push(obj.component);
              }
          }
       
      ]
  });
  confirm.present();
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
}
