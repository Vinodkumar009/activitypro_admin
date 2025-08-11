import { Component } from '@angular/core';
import { CommonService } from "../../services/common.service";
import { App,  ViewController , NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertController, IonicPage } from 'ionic-angular';
import * as firebase from 'firebase';
import { FirebaseService } from '../../services/firebase.service';
import { SharedServices } from '../services/sharedservice';
import { LanguageService } from '../../services/language.service';
// <ion-item-divider color="light">Theme Layout</ion-item-divider>
// <ion-item (click)="setThemeType(1)"><ion-icon name="log-out" item-left></ion-icon>Menu Layout</ion-item>
// <ion-item-group>
// <ion-item-divider color="light">Theme Color</ion-item-divider>
// <ion-icon name="square" (click)="setThemeColor(1)" class="theme-color-size theme-color1"></ion-icon>
// <ion-icon name="square" (click)="setThemeColor(2)" class="theme-color-size theme-color2"></ion-icon>
// <ion-icon name="square" (click)="setThemeColor(3)" class="theme-color-size theme-color3"></ion-icon>
// <ion-icon name="square" (click)="setThemeColor(4)" class="theme-color-size theme-color4"></ion-icon>
// <ion-icon name="square" (click)="setThemeColor(5)" class="theme-color-size theme-color5"></ion-icon>
// <ion-icon name="square" (click)="setThemeColor(6)" class="theme-color-size theme-color6"></ion-icon>
// <ion-icon name="square" (click)="setThemeColor(7)" class="theme-color-size theme-color7"></ion-icon>
// </ion-item-group>
//<ion-note item-right>View</ion-note>
@IonicPage()
@Component({
  selector: 'popover-page',
  providers: [FirebaseService,CommonService, SharedServices,LanguageService ],
  template: `
  <ion-item-group>
  <ion-item (click)="goToProfile()">
    <ion-avatar item-left>
      <img src="assets/images/user2.png">
    </ion-avatar>
    <h2>{{loginUserName}}</h2>
    <p>{{loginUserID}}</p>
   
  </ion-item>
</ion-item-group>
   <ion-item-group>

    <ion-item (click)="gotoHelp()"><ion-icon name="md-help" item-left></ion-icon>FAQ</ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item (click)="aboutus()"><ion-icon name="information" style="font-size: 40px;"item-left></ion-icon>About Us</ion-item>
  </ion-item-group>

  <ion-item-group>
    <ion-item (click)="changeLanguage()">
    <ion-avatar item-left>
      <img src="assets/images/translating.svg" style="width:30px;height:30px;">
    </ion-avatar>
    <h2>Select Language</h2>
    </ion-item>
  </ion-item-group>

   <ion-item-group (click)="logOut()">
    <ion-item-divider color="light" >
    <ion-icon name="log-out" item-left></ion-icon>
      Logout
</ion-item-divider>

   </ion-item-group>
  `
})


export class PopoverPage {
  loginUserName: any;
  loginUserID: any;
  userToken = "";
  userDetailsFromLocalStorage: any;
  constructor(public appCtrl: App,public commonService: CommonService, public viewCtrl: ViewController, public navCtrl: NavController, public storage: Storage, private alertCtrl: AlertController, private langService:LanguageService, public sharedService: SharedServices) {
    storage.get('UserTokenKey').then((val) => {
      this.userToken = val;
    }).catch(error => {


    });

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userDetailsFromLocalStorage = val;
      this.loginUserName = val.Name;
      this.loginUserID = val.EmailID;
      //      let pKey = val.UserInfo[0].ParentClubKey;
      // this.getUserDetails(pKey);
    }).catch(error => {

    });
  }

  close() {
    this.viewCtrl.dismiss();
  }

  gotoHelp(){
    this.navCtrl.push("HelpSupportPage");
    this.close();
  }

  changeLanguage(){
    this.langService.selectLanguage();
    this.close();
  }
  
  goToProfile() { 
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.RoleType == "2" && val.UserType == "2") {
        if(val.SignedUpUnder && val.SignedUpUnder == "6"){
          this.viewCtrl.dismiss();
          this.appCtrl.getActiveNav().push("SubAdminProfile"); // nothing but added from subadmin add  and he had a admin permissions,But user node is in SubAdmin
          return false;
        }
        this.viewCtrl.dismiss();
        this.appCtrl.getActiveNav().push("Profile");
      }
      else if (val.RoleType == "2" && val.UserType == "1") {
        this.viewCtrl.dismiss();
        this.appCtrl.getActiveNav().push("Profile");
      }
      else if (val.RoleType == "4" && val.UserType == "2") {
        this.viewCtrl.dismiss();
        this.appCtrl.getActiveNav().push("CoachProfile");
      }
      else {
        this.viewCtrl.dismiss();
        this.appCtrl.getActiveNav().push("SubAdminProfile"); 
      }
    });
  }

  logOut() {
    try {
      if ((this.userToken != "") && (this.userDetailsFromLocalStorage.RoleType == "2" && this.userDetailsFromLocalStorage.UserType == "2")) {
       
        let dbRef = firebase.database().ref().child("/DeviceToken/ParentClub/" + this.userDetailsFromLocalStorage.UserInfo[0].ParentClubKey + "/" + this.userToken + "/");
        dbRef.remove();
        
      } else if ((this.userToken != "") && (this.userDetailsFromLocalStorage.RoleType == "2" && this.userDetailsFromLocalStorage.UserType == "2")) {
      
        let dbRef = firebase.database().ref().child("/DeviceToken/Coach/" + this.userDetailsFromLocalStorage.UserInfo[0].ParentClubKey + "/"+this.userDetailsFromLocalStorage.UserInfo[0].CoachKey + this.userToken + "/");
        dbRef.remove();
      }

    } catch (ex) {

    }

    this.storage.set('UserTokenKey', "");
    this.storage.set('isLogin', false);
    this.storage.set('userObj', "");
    this.storage.set('LoginWhen', 'notFirst')
    this.storage.remove('events');
    this.storage.remove('Menus');
    this.storage.set('isAppAdminLogin',false);
    this.storage.set('postgre_parentclub', "");
    this.storage.set('memberType', "");
    this.viewCtrl.dismiss();
    this.appCtrl.getActiveNav().push("Login");
  }
  aboutus(){
    this.navCtrl.push("AboutUsPage");
    this.close();
  }
  setThemeType(val) {
    this.storage.set('themeType', val);
    let alert = this.alertCtrl.create({
      title: 'Theme Changer',
      message: 'Do you want to change theme ? App will restart after changing the theme.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.viewCtrl.dismiss();

          }
        },
        {
          text: 'Apply',
          handler: () => {
            this.viewCtrl.dismiss();
            location.reload();
          }
        }
      ]
    });
    alert.present();
  }

  setThemeColor(val) {
    this.storage.set('themeColor', val);
    let alert = this.alertCtrl.create({
      title: 'Color Changer',
      message: 'Do you want to change color ? App will restart after changing the color.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Apply',
          handler: () => {
            this.viewCtrl.dismiss();
            location.reload();
          }
        }
      ]
    });
    alert.present();
 
  }


  // <ion-item (click)="setThemeType(1)"><ion-icon name="log-out" item-left></ion-icon>Menu Layout</ion-item>
  // <ion-item (click)="setThemeType(2)"><ion-icon name="log-out" item-left></ion-icon>Dashboard Layout</ion-item>
}