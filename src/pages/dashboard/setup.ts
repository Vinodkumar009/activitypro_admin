// import {Dashboard} from './dashboard';
import { Component } from '@angular/core';
import { Events, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavParams, NavController, PopoverController,IonicPage } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { CommonService } from '../../services/common.service';
import { ThemeService } from '../../services/theme.service';
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
  isDarkTheme: boolean = true;
  
  constructor(public events: Events, public alertCtrl: AlertController, public navParams: NavParams,public commonService: CommonService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,public storage:Storage, public themeService: ThemeService) {
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
    this.loadTheme();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      console.log('Setup page - loaded theme from storage:', isDarkTheme);
      if (isDarkTheme !== null) {
        this.isDarkTheme = isDarkTheme;
      } else {
        // Default to dark theme if no preference is stored
        this.isDarkTheme = true;
      }
      this.applyTheme();
    }).catch((error) => {
      console.log('Setup page - error loading theme:', error);
      this.isDarkTheme = true; // Default to dark theme
      this.applyTheme();
    });
    
    // Listen for theme changes from other pages
    this.events.subscribe('theme:changed', (isDark) => {
      console.log('Setup page - received theme change event:', isDark);
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  applyTheme() {
    const setupElement = document.querySelector('setup-page');
    console.log('Setup page - applying theme:', this.isDarkTheme ? 'dark' : 'light');
    console.log('Setup page - element found:', !!setupElement);
    
    if (setupElement) {
      if (this.isDarkTheme) {
        setupElement.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
      } else {
        setupElement.classList.add('light-theme');
        document.body.classList.add('light-theme');
      }
    }
  }



  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
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
      this.showAlter()
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
  showAlter(){
    let confirm = this.alertCtrl.create({
      title: 'Coming Soon...',
  
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
