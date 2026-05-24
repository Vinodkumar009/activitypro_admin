
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';

import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'paymentconfirmationnotification-page',
  templateUrl: 'paymentconfirmationnotification.html'
})

export class Type2PaymentConfirmationNotification {
  // iOSDeviceTokens = [];
  // androidDeviceTokens = [];
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
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
  deviceTokens=[];
  constructor(public loadingCtrl: LoadingController, public alertCtrl: AlertController,
     public navParams: NavParams, 
     private toastCtrl: ToastController,
      private http: Http, public fb: FirebaseService, 
      storage: Storage, public navCtrl: NavController, 
      public sharedservice: SharedServices,
       platform: Platform, public popoverCtrl: PopoverController,
       private commonService: CommonService, ) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    let tokens = navParams.get("Tokens");
    this.memberDetails = navParams.get("MemberDetails");
    this.sessionDetails = navParams.get("SessionDetails");
    this.paymentMode = navParams.get("PaymentType");
    let purpose = navParams.get("Purpose");



    for (let i = 0; i < tokens.length; i++) {
      this.deviceTokens.push({ MobileDeviceId: tokens[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
      // if (tokens[i].DeviceToken.length != 64) {
      //   this.androidDeviceTokens.push(tokens[i].DeviceToken);
      // } else if (tokens[i].DeviceToken.length == 64) {
      //   this.iOSDeviceTokens.push(tokens[i].DeviceToken);
      // }
    }
    this.parentClubKey = this.sessionDetails.ParentClubKey;


    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubDetails = data[0];
    });


    this.selectedClub = this.sessionDetails.ClubKey;
    this.notificationObj.Message = "Thank you for the payment by " + this.paymentMode;
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


    // this.notificationObj.CreatedTime = new Date().toString();
    // this.notificationObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();



    // let notificationDetailsObj = this.notificationObj;

    let pc = {
      CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '',
      Member: []
    };
    // pc.SendBy = this.parentClubKey;
    // pc.sendByRole = "ClubAdmin";
    // pc.Purpose = "Payment";
    // pc.Message = notificationDetailsObj.Message;
    // pc.SessionName = this.memberDetails.SessionName;
    // pc.CreatedTime = new Date().toString();
    // pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();



    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "Payment";
    pc.Message = notificationDetailsObj.Message;
    pc.SessionName = this.notificationObj.SessionName;
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();




    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: notificationDetailsObj.Message,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'Payment',
      SessionName: this.notificationObj.SessionName,
      sendByRole: "Admin",
      Status: "Unread",
      Admin: []
    };


    pc.Member.push({
      Name: this.memberDetails.FirstName + " " + this.memberDetails.LastName,
      Key: this.memberDetails.Key,
      ClubKey: this.memberDetails.ClubKey,
      SignedUpType: 1
    });

    memberObject.Admin[0] = { Key: this.parentClubKey };


    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);
    this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.memberDetails.ClubKey + "/" + this.memberDetails.Key + "/Session/Notification/", memberObject);




    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = notificationDetailsObj.Message;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });





    // for (let innerIndex = 0; innerIndex < this.androidDeviceTokens.length; innerIndex++) {
    //   // var data = { to: '', notification: { body: '', title: '' } };

    //   let data = {
    //     to: '',
    //     priority:"high",
    //     notification: {
    //       body: '',
    //       title: '',
    //       sound: "default",
    //     },
    //     data: {
    //       param: this.notificationObj.Message,
    //     },
    //     };

    //   data.to = this.androidDeviceTokens[innerIndex];
    //   data.notification = { body: '', title: '', sound: "default", };
    //   data.notification.title = "";
    //   data.notification.body = this.notificationObj.Message;
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

    // let url = this.sharedservice.getEmailUrl();

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

    //   }
    // });

    
    if(this.notificationObj.Purpose!="SessionPayment"){
      this.navCtrl.pop();
    }else{
      this.navCtrl.pop().then(()=>this.navCtrl.pop());
    }
    this.commonService.toastMessage("Notification sent successfully", 3000,ToastMessageType.Success,ToastPlacement.Bottom);
  }
}


