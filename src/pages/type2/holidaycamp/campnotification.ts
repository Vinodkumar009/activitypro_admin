
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
  selector: 'campnotification-page',
  templateUrl: 'campnotification.html'
})

export class CampNotification {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread" };
  session: any;
  mlist = [];
  selectedClub: any;
  loading: any;
  deviceTokens = [];
  // iOSDeviceTokens = [];
  parentClubDetails: any;


  campDetails: any;
  sessionList: any;
  memberList: any;
  sessionDetails: any;
  functionalityBlock: any;

  constructor(public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    this.campDetails = navParams.get('CampDetails');
    this.sessionList = navParams.get('SessionList');
    this.memberList = navParams.get('MemberList');
    this.sessionDetails = navParams.get('SessionDetails');
    this.functionalityBlock = navParams.get('FunctionalityBlock');

    this.notificationObj.Message = "";
    this.parentClubKey = this.campDetails.ParentClubKey;

    this.getDeviceToken();

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
      message: 'Are you sure you want to send the notification to the member?',
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
    pc.Purpose = "Holiday Camp";
    pc.Message = notificationDetailsObj.Message;
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();

    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: notificationDetailsObj.Message,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'Holiday Camp',
      sendByRole: "Admin",
      Status: "Unread",
      Admin: [],
      SignedUpType: 1
    };
    let ids:any = []
    for (let i = 0; i < this.mlist.length; i++) {
      ids.push(this.mlist[i].Key);
      pc.Member.push({
        Name: this.mlist[i].UserName,
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
    //       param:notificationDetailsObj.Message.toString(),
    //     },
    //   };
    //   data.to = this.androidDeviceTokens[innerIndex];
    //   data.notification = { body: '', title: '',  sound: "default", };
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



    this.navCtrl.pop();
    let m = "Notification sent successfully";
    this.showToast(m, 5000);


  }



  getDeviceToken() {

    // this.androidDeviceTokens = [];
    this.deviceTokens = [];

   
    
    let isPresent = false;
    let sendTo = [];

    if (this.functionalityBlock != "SessionIndividualMember") {

      if (this.sessionDetails.Members != undefined) {
        if (this.sessionDetails.Members.length != 0) {
          let a = [];
          this.mlist = [];
          a = this.sessionDetails.Members;
          for (let i = 0; i < a.length; i++) {
            a[i]["UserName"] = a[i].FirstName + " " + a[i].LastName;
            if (a[i].ParentKey != "") {
              isPresent = false;
              for (let j = 0; j < this.mlist.length; j++) {
                if (this.mlist[j].Key == a[i].ParentKey) {
                  isPresent = true;
                  break;
                }
              }
              if (!isPresent) {
                this.mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey, UserName: a[i].UserName, SignedUpType: a[i].SignedUpType });
              }
            } else {
              this.mlist.push(a[i]);
            }


          }



          for (let i = 0; i < this.mlist.length; i++) {
            let key = "";
            // this.mlist[i]["SignedUpType"] = 1;
            if (this.mlist[i].ParentKey == "" || this.mlist[i].ParentKey == undefined) {
              this.mlist[i]["TokenDbKey"] = this.mlist[i].Key;
            } else {
              this.mlist[i]["TokenDbKey"] = this.mlist[i].ParentKey;
            }
            const token$Obs = this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
              for (let j = 0; j < data.length; j++) {
                // if (data[j].DeviceToken.length > 64) {
                //   this.androidDeviceTokens.push(data[j].DeviceToken);
                // } else {
                //   this.iOSDeviceTokens.push(data[j].DeviceToken);
                // }
                this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
              }
              token$Obs.unsubscribe()
            });
          }
        }
      }
      else if (this.sessionDetails.Member != undefined) {
        if (Object.keys(this.sessionDetails.Member).length != 0) {
          let a = [];
          a = Array.isArray(this.sessionDetails.Member) ? this.sessionDetails.Member : this.commonService.convertFbObjectToArray(this.sessionDetails.Member);
          for (let i = 0; i < a.length; i++) {
            a[i]["UserName"] = a[i].FirstName + " " + a[i].LastName;
            if (a[i].ParentKey != "") {
              isPresent = false;
              for (let j = 0; j < this.mlist.length; j++) {
                if (this.mlist[j].Key == a[i].ParentKey) {
                  isPresent = true;
                  break;
                }
              }
              if (!isPresent) {
                this.mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey, UserName: a[i].UserName, SignedUpType: a[i].SignedUpType });
              }
            } else {
              this.mlist.push(a[i]);
            }


          }



          for (let i = 0; i < this.mlist.length; i++) {
            if (this.mlist[i].ClubKey != "") {
              let key = "";
              this.mlist[i]["SignedUpType"] = 1;
              if (this.mlist[i].ParentKey == "" || this.mlist[i].ParentKey == undefined) {
                this.mlist[i]["TokenDbKey"] = this.mlist[i].Key;
              } else {
                this.mlist[i]["TokenDbKey"] = this.mlist[i].ParentKey;
              }
              const token$Obs = this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
                for (let j = 0; j < data.length; j++) {
                  // if (data[j].DeviceToken.length > 64) {
                  //   this.androidDeviceTokens.push(data[j].DeviceToken);
                  // } else {
                  //   this.iOSDeviceTokens.push(data[j].DeviceToken);
                  // }
                  this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
                }
                token$Obs.unsubscribe();
              });
            }

          }
        }
      }

    } else if (this.functionalityBlock == "SessionIndividualMember") {

      this.mlist = [];
      this.mlist.push({
        ClubKey: this.memberList[0].ClubKey,
        Key: "",
        UserName: this.memberList[0].UserName,
        ParentKey: this.memberList[0].ParentKey,
      });

      //  if (this.mlist[0].ClubKey != "") {

      let key = "";
      this.mlist[0]["SignedUpType"] = this.memberList[0].SignedUpType;
      if (this.mlist[0].ParentKey == "" || this.mlist[0].ParentKey == undefined) {
        this.mlist[0]["TokenDbKey"] = this.memberList[0].Key;
        this.mlist[0].Key = this.memberList[0].Key;
      } else {
        this.mlist[0]["TokenDbKey"] = this.memberList[0].ParentKey;
        this.mlist[0].Key = this.memberList[0].ParentKey;
      }
      if (this.memberList[0].SignedUpType == 1) {
        const token$Obs = this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[0].ClubKey + "/" + this.mlist[0].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
          token$Obs.unsubscribe();
          for (let j = 0; j < data.length; j++) {
            // if (data[j].DeviceToken.length > 64) {
            //   this.androidDeviceTokens.push(data[j].DeviceToken);
            // } else {
            //   this.iOSDeviceTokens.push(data[j].DeviceToken);
            // }
            this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
          }
        });
      } else {
        const token$Obs =  this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[0].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
          for (let j = 0; j < data.length; j++) {
            // if (data[j].DeviceToken.length > 64) {
            //   this.androidDeviceTokens.push(data[j].DeviceToken);
            // } else {
            //   this.iOSDeviceTokens.push(data[j].DeviceToken);
            // }


            this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
          }
          token$Obs.unsubscribe();
        });
      }

      // }
    }


  }


}


