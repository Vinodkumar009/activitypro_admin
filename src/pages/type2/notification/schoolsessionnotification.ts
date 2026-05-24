
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';

import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';

@IonicPage()
@Component({
  selector: 'schoolsessionnotification-page',
  templateUrl: 'schoolsessionnotification.html'
})

export class Type2SchoolSessionNotifications {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  sendTo = [];
  session: any;
  mlist = [];
  selectedClub: any;
  loading: any;
  deviceTokens = [];
  // iOSDeviceTokens = [];
  parentClubDetails: any;
  constructor(public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    this.notificationObj.Message = "Hi all, No school session today. Thanks."

    this.sendTo = navParams.get('UsersDeviceToken');
    this.mlist = navParams.get('MemberList');
    this.session = navParams.get('SessionDetails');
    this.parentClubKey = this.session.ParentClubKey;



    this.deviceTokens = [];
    // this.iOSDeviceTokens = [];


    for (let i = 0; i < this.mlist.length; i++) {





      if (this.mlist[i].ClubKey != "") {
        this.mlist[i].SignedUpType = 1;
        this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key).subscribe((token) => {
          for (let i = 0; i < token.length; i++) {
            this.sendTo.push(token[i]);
          }
        });
      } else {
        this.mlist[i].SignedUpType = this.mlist[i].IsSchoolMember ? 2 : 3;
        this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.mlist[i].Key).subscribe((token) => {
          for (let i = 0; i < token.length; i++) {
            this.sendTo.push(token[i]);
          }
        });
      }
    }

    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubDetails = data[0];
    });


    this.selectedClub = this.session.ClubKey;
    this.notificationObj.SessionName = this.session.SessionName;
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
    // console.log(this.iOSDeviceTokens);
    // console.log(this.androidDeviceTokens);
    // console.log(this.sendTo);
  }
  sendNotification() {
    let confirm = this.alertCtrl.create({
      title: 'Notification Alert',
      message: 'Are you sure you want to send the notification to all the members of the school session?',
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
              for (let deviceTokenIndex = 0; deviceTokenIndex < this.sendTo.length; deviceTokenIndex++) {
                if (this.sendTo.length > 0) {
                  let tokens = this.commonService.convertFbObjectToArray(this.sendTo[deviceTokenIndex]);
                  for (let i = 0; i < tokens.length; i++) {

                    this.deviceTokens.push({ MobileDeviceId: tokens[i].DeviceToken, ConsumerID: "", PlatformArn: "" });

                    // if (tokens[i].DeviceToken.length != 64) {
                    //   this.androidDeviceTokens.push(tokens[i].DeviceToken);
                    // } else if (tokens[i].DeviceToken.length == 64) {
                    //   this.iOSDeviceTokens.push(tokens[i].DeviceToken);
                    // }
                  }
                }
              }
              this.notify();
            });
            this.loading.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }
  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }
  notify() {

    let notificationDetailsObj = this.notificationObj;

    let pc = {
      CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread",
      Member: []
    };
    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "SchoolSession";
    pc.Message = notificationDetailsObj.Message;
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: notificationDetailsObj.Message,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'SchoolSession',
      sendByRole: "Admin",
      Status: "Unread",
      Admin: [],
      SignedUpType: 1
    };
    let ids:any = [];
    for (let i = 0; i < this.mlist.length; i++) {
      ids.push(this.mlist[i].Key);
      pc.Member.push({
        Name: this.mlist[i].FirstName + " " + this.mlist[i].LastName,
        Key: this.mlist[i].Key,
        ClubKey: this.mlist[i].ClubKey,
        SignedUpType: this.mlist[i].SignedUpType
      });
    }






    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

    for (let i = 0; i < this.mlist.length; i++) {
      memberObject.Admin[0] = { Key: this.parentClubKey };
      memberObject.SignedUpType = this.mlist[i].SignedUpType;
      if (this.mlist[i].SignedUpType == 1) {
        this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
      } else {
        this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
      }

    }


    // for (let innerIndex = 0; innerIndex < this.androidDeviceTokens.length; innerIndex++) {
    //   // var data = { to: '', notification: { body: '', title: '' } };
    //   let data = {
    //     to: '',
    //     priority: "high",
    //     notification: {
    //       body: '',
    //       title: '',
    //       sound: "default",
    //     },
    //     data: {
    //       param: notificationDetailsObj.Message,
    //     },
    //   };
    //   data.to = this.androidDeviceTokens[innerIndex];
    //   data.notification = { body: '', title: '',sound: "default", };
    //   data.notification.title = "";
    //   data.notification.body = notificationDetailsObj.Message;
    //   let headers = new Headers({
    //     'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
    //     'Content-Type': 'application/json'
    //   });
    //   let options = new RequestOptions({ headers: headers });
    //   this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
    //     this.notificationObj.Message = "";
    //   }, err => {
    //     console.log("ERROR!: ", err);
    //   }
    //   );
    // }

    
    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = notificationDetailsObj.Message;
    this.commonService.publishPushMessage(ids,notificationDetailsObj.Message,'Notification',this.parentClubKey);
   // this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });


    // $.ajax({
    //   url: url + "umbraco/surface/ActivityProSurface/SendNotification/",
    //   data: {
    //     DeviceID: this.iOSDeviceTokens,
    //     DeviceType: 2,
    //     MessageType: 1,
    //     Message: notificationDetailsObj.Message,
    //     CertificateFileName: this.parentClubDetails.APNSCertificateFileName
    //   },
    //   type: "POST",


    //   success: function (response) {


    //   }, error: function (error, xhr) {

    //     //  alert("Your password has been successfully reset.");

    //   }
    // });
    // }


    if (this.sendTo.length == 0) {
      let m = "No member has logged in yet still we notify to the people. They can see the notification in the notification page.";
      this.showToast(m, 10000);
    } else {
      this.navCtrl.pop();
      let m = "Notification sent successfully";
      this.showToast(m, 5000);
    }

  }
}



