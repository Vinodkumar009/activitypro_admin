
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';

import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as firebase from 'firebase';


import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
@IonicPage()
@Component({
  selector: 'memberenrolementtoactivitiesnotification-page',
  templateUrl: 'memberenrolementtoactivitiesnotification.html'
})

export class Type2MemberEnrolementToActivitiesNotification {

  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  deviceTokens = [];
  // sendTo = [];
  // session: any;
  // mlist = [];
  selectedClub: any;
  // loading: any;
  // androidDeviceTokens = [];
  // iOSDeviceTokens = [];
  parentClubDetails: any;
  memberDetails: any;
  sessionDetails: any;
  paymentMode = "";
  membersToSendNotification = []; tokens = [];
  constructor(public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    this.memberDetails = navParams.get("MemberDetails");
    this.sessionDetails = navParams.get("SessionDetails");
    let purpose = navParams.get("Purpose");
    let clubName = navParams.get("ClubName");




    for (let i = 0; i < this.memberDetails.length; i++) {
      if (this.memberDetails[i].ParentKey == "") {
        this.membersToSendNotification.push({
          Key: this.memberDetails[i].$key ? this.memberDetails[i].$key : this.memberDetails[i].FirebaseKey,
          ClubKey: this.memberDetails[i].ClubKey,
          ParentClubKey: this.memberDetails[i].ParentClubKey,
          FirstName: this.memberDetails[i].FirstName,
          LastName: this.memberDetails[i].LastName,
        });
      } else {
        let isPresent = false;
        for (let j = 0; j < this.membersToSendNotification.length; j++) {
          let memberTosendUserKey = this.membersToSendNotification[j].Key ? this.membersToSendNotification[j].Key : this.membersToSendNotification[j].FirebaseKey;
          if (memberTosendUserKey == this.memberDetails[i].ParentKey) {
            isPresent = true;
            break;
          }
        }
        if (!isPresent) {
          this.membersToSendNotification.push({
            Key: this.memberDetails[i].$key ? this.memberDetails[i].$key : this.memberDetails[i].FirebaseKey,
            ClubKey: this.memberDetails[i].ClubKey,
            ParentClubKey: this.memberDetails[i].ParentClubKey,
            FirstName: this.memberDetails[i].FirstName,
            LastName: this.memberDetails[i].LastName,
          });
        }
      }
    }


    this.getDeviceToken();


    this.parentClubKey = this.sessionDetails.ParentClubKey;


    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubDetails = data[0];
    });


    this.selectedClub = this.sessionDetails.ClubKey;
    this.notificationObj.Message = "Welcome! You/your family member have been added to the session: " + clubName + " - " + this.sessionDetails.Days + ":" + this.sessionDetails.StartTime + ": " + this.sessionDetails.CoachName + " - " + this.sessionDetails.SessionName + ".";
    this.notificationObj.SessionName = this.sessionDetails.SessionName;
    this.notificationObj.Purpose = purpose;
    this.notificationObj.sendByRole = "Admin";
    this.notificationObj.SendBy = "Admin";
    this.notificationObj.SendTo = this.memberDetails.Key;
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
    this.notify();
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
    pc.Purpose = "Session";
    pc.Message = notificationDetailsObj.Message;
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


    let memberObject = {
      CreatedTime: new Date().toString(),
      Message: notificationDetailsObj.Message,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'Session',
      sendByRole: "Admin",
      Status: "Unread",
      Admin: []
    };

    for (let i = 0; i < this.membersToSendNotification.length; i++) {
      pc.Member.push({
        Name: this.membersToSendNotification[i].FirstName + " " + this.membersToSendNotification[i].LastName,
        Key: this.membersToSendNotification[i].Key,
        ClubKey: this.membersToSendNotification[i].Key,
        SignedUpType: 1
      });
    }

    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

    for (let i = 0; i < this.membersToSendNotification.length; i++) {
      // notificationDetailsObj.SendBy = this.parentClubKey;
      // notificationDetailsObj.sendByRole = "ClubAdmin";
      // notificationDetailsObj.Purpose = "Session";
      // notificationDetailsObj.SessionName = this.notificationObj.SessionName;
      // notificationDetailsObj.CreatedTime = new Date().toString();
      // notificationDetailsObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
      // notificationDetailsObj.SendTo = this.membersToSendNotification[i].Key;
      memberObject.Admin[0] = { Key: this.parentClubKey };

      this.fb.saveReturningKey("Notification/Member/" + this.membersToSendNotification[i].ParentClubKey + "/" + this.membersToSendNotification[i].ClubKey + "/" + this.membersToSendNotification[i].Key + "/Session/Notification/", memberObject);
    }


    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = notificationDetailsObj.Message;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });


    // for (let innerIndex = 0; innerIndex < this.androidDeviceTokens.length; innerIndex++) {
    //   let data = {
    //     to: '',
    //     priority: "high",
    //     notification: {
    //       body: '',
    //       title: '',
    //       sound: "default",
    //     },
    //     data: {
    //       param: notificationDetailsObj.Message.toString(),
    //     },
    //   };
    //   data.to = this.androidDeviceTokens[innerIndex];
    //   data.notification = { body: '', title: '',
    //   sound: "default", };
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

    //this.commonService.updateCategory("sessions");
    let m = "Notification sent successfully";
    this.commonService.toastMessage(m,2500,ToastMessageType.Success,ToastPlacement.Bottom);
    //this.navCtrl.pop();
    this.navCtrl.pop();
    this.navCtrl.pop();
  }

  getDeviceToken() {
    for (let i = 0; i < this.membersToSendNotification.length; i++) {
      let x: any;
      let ref = firebase.database().ref('/').child("/DeviceToken/Member/" + this.membersToSendNotification[i].ParentClubKey + "/" + this.membersToSendNotification[i].ClubKey + "/" + this.membersToSendNotification[i].Key + "/Token");
      ref.once("value", function (snapshot) {
        x = snapshot.val();
      }, function (error) {
        this.showToast(error.message, 5000);
      });
      if (x != null) {
        let arr = [];
        arr = this.commonService.convertFbObjectToArray(x);
        for (let loop = 0; loop < arr.length; loop++) {
          // this.tokens.push(arr[loop].DeviceToken);
          // if (arr[loop].DeviceToken.length != 64) {
          //   this.androidDeviceTokens.push(arr[loop].DeviceToken);
          // } else if (arr[loop].DeviceToken.length == 64) {
          //   this.iOSDeviceTokens.push(arr[loop].DeviceToken);
          // }
          this.deviceTokens.push({ MobileDeviceId: arr[loop].DeviceToken, ConsumerID: "", PlatformArn: "" });
        }
      }
    }



  }
}


