
import { Component } from '@angular/core';
import { AlertController, LoadingController, NavParams, ToastController, NavController, Platform, Events } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { Http, Headers, RequestOptions } from '@angular/http';


import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'notificationsessioncoach-page',
  templateUrl: 'notificationsessioncoach.html'
})

export class CoachNotificationSession {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  sendTo = [];
  session: any;
  mlist = [];
  selectedClub: any;
  coachKey = '';
    
  loading: any;

  constructor(public events:Events,public commonService:CommonService,public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    this.notificationObj.Message = "Hi all, No session today. Thanks."

    this.sendTo = navParams.get('UsersDeviceToken');
    this.mlist = navParams.get('MemberList');
  
    this.session = navParams.get('SessionDetails');
    this.parentClubKey = this.session.ParentClubKey;
    this.selectedClub = this.session.ClubKey;
    this.notificationObj.SessionName = this.session.SessionName;
    this.coachKey = this.session.CoachKey;
  }



  
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }



  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  cancel() {
    this.navCtrl.pop();
  }

  sendNotification() {
    let confirm = this.alertCtrl.create({
      title: 'Notification Alert',
      message: 'Are you sure you want to send the notification to all the members of the session?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.loading = this.loadingCtrl.create({
              content: 'Please wait...'
            });
            this.loading.present().then(() => {
              this.notify();
            });
            this.loading.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }



  notify() {

    let notificationDetailsObj = this.notificationObj;

    let pc = { CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
    pc.SendBy = this.parentClubKey;
    pc.sendByRole = "ClubAdmin";
    pc.Purpose = "Session";
    pc.Message = notificationDetailsObj.Message;
    pc.SessionName = this.notificationObj.SessionName;
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
     this.fb.saveReturningKey("Notification/Coach/" + this.parentClubKey + "/" + this.coachKey + "/Session/ComposeNotification/", pc);
    for (let i = 0; i < this.mlist.length; i++) {
      notificationDetailsObj.SendBy = this.parentClubKey;
      notificationDetailsObj.sendByRole = "ClubAdmin";
      notificationDetailsObj.Purpose = "Session";
      notificationDetailsObj.SessionName = this.notificationObj.SessionName;
      notificationDetailsObj.CreatedTime = new Date().toString();
      notificationDetailsObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
      notificationDetailsObj.SendTo = this.mlist[i].Key;
      this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.mlist[i].Key + "/Session/Notification/", notificationDetailsObj);
      // if (this.mlist[i].MiddleName == undefined) {
      //   this.mlist[i].MiddleName = "";
      // }
      // this.fb.saveReturningKey("Notification/Coach/" + this.parentClubKey + "/" + this.coachKey + "/Session/ComposeNotification/" + returnedKey.toString() + "/SendTo/", { MemberKey: notificationDetailsObj.SendTo, Name: this.mlist[i].FirstName + " " + this.mlist[i].MiddleName + " " + this.mlist[i].LastName });
    }
    // let message = "Notification has sent to " + this.mlist.length + " Member of this session";
    // this.showToast(message);
    for (let sendtoindex = 0; sendtoindex < this.sendTo.length; sendtoindex++) {
      let differentLoginDeviceTokens = this.commonService.convertFbObjectToArray(this.sendTo[sendtoindex].Token);
      if (differentLoginDeviceTokens.length > 0) {
        for (let innerIndex = 0; innerIndex < differentLoginDeviceTokens.length; innerIndex++) {
          var regToken = differentLoginDeviceTokens[innerIndex].DeviceToken;
          var data = { to: '', notification: { body: '', title: '' } };
          data.to = regToken;
          data.notification = { body: '', title: '' };
          data.notification.title = notificationDetailsObj.Purpose;
          data.notification.body = notificationDetailsObj.Message;
          let headers = new Headers({
            'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
            'Content-Type': 'application/json'
          });

          let options = new RequestOptions({ headers: headers });
          this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
            this.notificationObj.Message = "Hi all, No session today. Thanks.";
            //this.showToast('')
          }, err => {
            console.log("ERROR!: ", err);
          }
          );

        }
      }

    }
    if (this.sendTo.length == 0) {
      // let m = "No member has logged in yet still we notify to the people. They can see the notification in the notification page.";
      // this.showToast(m);
    } else {
      this.navCtrl.pop();
      let m = "Notifcation sent successfully";
      this.showToast(m);
    }

  }


  
  showToast(m: string) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }

}


