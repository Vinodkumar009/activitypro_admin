
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';


import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { T } from '@angular/core/src/render3';
@IonicPage()
@Component({
  selector: 'paymentnotification-page',
  templateUrl: 'paymentnotification.html'
})

export class Type2PaymentNotification {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  sendTo = [];
  memberDetails: any;
  mlist = [];
  selectedClub: any;
  loading: any;
  // androidDeviceTokens = [];
  deviceTokens = [];
  parentClubDetails: any;

  constructor(public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    this.memberDetails = navParams.get('MemberDetails');
    let pageName = navParams.get('PageName');

    this.mlist.push(this.memberDetails);
    if (this.mlist[0].ParentKey.trim() != "") {
      this.mlist[0].Key = this.mlist[0].ParentKey;
    }
    if (pageName != undefined && pageName == "Due") {
      this.notificationObj.Message = "A gentle reminder for the payment for the session: " + this.memberDetails.SessionName + "-" + this.memberDetails.Days + "-" + this.memberDetails.StartTime + "-" + this.memberDetails.CoachName + ". Thanks";
    } else {
      this.notificationObj.Message = "Thank you for payment for the session: " + this.memberDetails.SessionName + "-" + this.memberDetails.Days + "-" + this.memberDetails.StartTime + "-" + this.memberDetails.CoachName + ". Thanks";
    }


    this.parentClubKey = this.memberDetails.ParentClubKey;
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubDetails = data[0];
    });

    this.getDeviceToken();


  }
  getDeviceToken() {
    let MemberKey = this.memberDetails.Key ? this.memberDetails.Key : this.memberDetails.MemberKey;
    if (this.memberDetails.ParentKey.trim() == "") {
      this.fb.getAllWithQuery("DeviceToken/Member/" + this.memberDetails.ParentClubKey + "/" + this.memberDetails.ClubKey + "/", { orderByKey: true, equalTo: MemberKey }).subscribe((data) => {
        this.deviceTokens = [];
        // this.iOSDeviceTokens = [];
        this.sendTo = data[0];
        // for (let deviceTokenIndex = 0; deviceTokenIndex < this.sendTo.length; deviceTokenIndex++) {
        //   if (this.sendTo[deviceTokenIndex].Token != undefined) {
        //     let tokens = this.convertFbObjectToArray(this.sendTo[deviceTokenIndex].Token);

        //     for (let i = 0; i < tokens.length; i++) {
        //       if (tokens[i].DeviceToken.length != 64) {
        //         this.androidDeviceTokens.push(tokens[i].DeviceToken);
        //       } else if (tokens[i].DeviceToken.length == 64) {
        //         this.iOSDeviceTokens.push(tokens[i].DeviceToken);
        //       }
        //     }
        //   }
        // }
      });
    } else {
      this.fb.getAllWithQuery("DeviceToken/Member/" + this.memberDetails.ParentClubKey + "/" + this.memberDetails.ClubKey + "/", { orderByKey: true, equalTo: this.memberDetails.ParentKey }).subscribe((data) => {
        this.deviceTokens = [];
        // this.iOSDeviceTokens = [];
        this.sendTo = data;
        for (let deviceTokenIndex = 0; deviceTokenIndex < this.sendTo.length; deviceTokenIndex++) {
          if (this.sendTo[deviceTokenIndex].Token != undefined) {
            let tokens = this.commonService.convertFbObjectToArray(this.sendTo[deviceTokenIndex].Token);

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
      });
    }

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
      message: 'Are you sure you want to send the notification ?',
      buttons: [
        {
          text: 'No',
          handler: () => {


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
    let ids:any = [];
    for (let i = 0; i < this.mlist.length; i++) {
      ids.push(this.mlist[i].Key ? this.mlist[i].Key : this.mlist[i].MemberKey)
      pc.Member.push({
        Name: this.mlist[i].FirstName + " " + this.mlist[i].LastName,
        Key: this.mlist[i].Key ? this.mlist[i].Key : this.mlist[i].MemberKey,
        ClubKey: this.mlist[i].ClubKey,
        SignedUpType: 1
      });
    }



    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

    for (let i = 0; i < this.mlist.length; i++) {
      memberObject.Admin[0] = { Key: this.parentClubKey };
      let memberkey = this.mlist[i].Key ? this.mlist[i].Key : this.mlist[i].MemberKey
      this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + memberkey + "/Session/Notification/", memberObject);
    }



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
    //       param: notificationDetailsObj.Message,
    //     },
    //     };
    //   data.to = this.androidDeviceTokens[innerIndex];
    //   data.notification = { body: '', title: '', sound: "default", };
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

    //     //  alert("Your password has been successfully reset.");

    //   }
    // });
   
    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = notificationDetailsObj.Message;
    this.commonService.publishPushMessage(ids,notificationDetailsObj.Message,'Notification',this.parentClubKey);
  //  this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });

    this.commonService.toastMessage("Notification sent successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.navCtrl.pop();
    

  }
}


