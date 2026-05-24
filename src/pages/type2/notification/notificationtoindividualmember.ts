
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';

import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as firebase from 'firebase';
import { HttpClient } from '@angular/common/http';

import { IonicPage } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";
@IonicPage()
@Component({
  selector: 'notificationtoindividualmember-page',
  templateUrl: 'notificationtoindividualmember.html'
})

export class Type2NotificationToIndividualMember {
  deviceTokens=[];
  //androidDeviceTokens = [];
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = {
    CreatedTime: "",
    Message: '',
    SendBy: '',
    ComposeOn: '',
    Purpose: '', 
    sendByRole: "",
    Status: "Unread",
    Member: [],
  };

  selectedClub: any;

  parentClubDetails: any;
  memberDetails: any;
  sessionDetails: any;
  paymentMode = "";
  clubDetails = [];

  constructor(public httpService:HttpClient,public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    this.memberDetails = navParams.get("MemberDetails");

    if (this.memberDetails != undefined) {
      if(this.memberDetails.SignedUpType != undefined && this.memberDetails.SignedUpType!= 1){
        this.selectedClub ="";
      }else{
      this.selectedClub = "";
      }
      this.parentClubKey = this.memberDetails.ParentClubKey;
      this.getDeviceToken();
      // this.getClubDetails();

      this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
        this.parentClubDetails = data[0];
      });



      this.notificationObj.Purpose = "NotifyToMember";
      this.notificationObj.sendByRole = "Admin";
      this.notificationObj.SendBy = "Admin";
      this.notificationObj.Message = "";

      this.notificationObj.Member.push({
        Name: this.memberDetails.FirstName + " " + this.memberDetails.LastName,
        Key: this.memberDetails.$key,
        ClubKey: this.memberDetails.ClubKey == undefined ? "" : this.memberDetails.ClubKey,
        SignedUpType: this.commonService.getMemberSignedUpType(this.memberDetails)
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



  //From Today
  getDeviceToken() {
    if (this.commonService.getMemberSignedUpType(this.memberDetails) == 1) {
      this.fb.getAllWithQuery("/DeviceToken/Member/" + this.memberDetails.ParentClubKey + "/" + this.memberDetails.ClubKey + "/" + this.memberDetails.$key + "/Token", { orderByKey: true }).subscribe((response) => {
        this.deviceTokens=[];
        //        this.iOSDeviceTokens = [];
        for (let i = 0; i < response.length; i++) { 
          // if (response[i].DeviceToken.length != 64) {
          //   this.androidDeviceTokens.push(response[i].DeviceToken);
          // } else if (response[i].DeviceToken.length == 64) {
          //   this.iOSDeviceTokens.push(response[i].DeviceToken);
          // }
          this.deviceTokens.push({ MobileDeviceId: response[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
        }
      });
    }
    else {
      this.fb.getAllWithQuery("/DeviceToken/Member/" + this.memberDetails.ParentClubKey + "/" + this.memberDetails.$key + "/Token", { orderByKey: true }).subscribe((response) => {
        this.deviceTokens = [];
        // this.iOSDeviceTokens = [];
        for (let i = 0; i < response.length; i++) {
          // if (response[i].DeviceToken.length != 64) {
          //   this.androidDeviceTokens.push(response[i].DeviceToken);
          // } else if (response[i].DeviceToken.length == 64) {
          //   this.iOSDeviceTokens.push(response[i].DeviceToken);
          // }
          this.deviceTokens.push({ MobileDeviceId: response[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
        }
      });
    }
  }

  async getMemberKey(){
    if(this.memberDetails.IsChild){
      const data:any = await this.getParenrMember();
      return data.$key
    }else{
      return this.memberDetails.$key
    }
  }
  getParenrMember(){
    return new Promise((res,rej)=>{
      this.fb.getAllWithQuery(`Member/${this.memberDetails.ParentClubKey}/${this.memberDetails.ClubKey}`,{orderByKey:true,equalTo:this.memberDetails.$key}).subscribe((data)=>{
        res(data[0]);
      })
    })
  }


  async notify() {

    let notificationDetailsObj = this.notificationObj;

    this.notificationObj.CreatedTime = new Date().toString();
    this.notificationObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


    let undefinedProps = this.commonService.findUndefinedProp(notificationDetailsObj);
    if (undefinedProps != "") {
      return;
    }

    let memberObject = {
      CreatedTime: "",
      Message: '',
      SendBy: '',
      ComposeOn: '',
      Purpose: 'NotifyToMember',
      sendByRole: "",
      Status: "Unread",
      Admin: [],
      SignedUpType: 1
    };
    memberObject.SignedUpType = this.commonService.getMemberSignedUpType(this.memberDetails);
    memberObject.ComposeOn = this.notificationObj.ComposeOn;
    memberObject.CreatedTime = this.notificationObj.CreatedTime;
    memberObject.Message = this.notificationObj.Message;
    memberObject.SendBy = "Admin";
    memberObject.Status = "Unread";
    memberObject.sendByRole = "Admin";
    memberObject.SignedUpType = this.commonService.getMemberSignedUpType(this.memberDetails);
    memberObject.Admin.push({
      Key: this.parentClubKey,
    });

    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", this.notificationObj);
    if (this.commonService.getMemberSignedUpType(this.memberDetails) == 1) {
      this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.memberDetails.ClubKey + "/" + this.memberDetails.$key + "/Session/Notification/", memberObject);
    } else {
      this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.memberDetails.$key + "/Session/Notification/", memberObject);
    }

    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = notificationDetailsObj.Message;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });
    const key = await this.getMemberKey();
    let keys:any = [];
    keys.push(key);
    this.commonService.publishPushMessage(keys,message,"Notification",this.parentClubKey)
    // const requestingObj = {
    //   parentClubKey: this.parentClubKey,
    //   memberKey:this.memberDetails.$key,
    //   messegeHeader: "string",
    //   messegeBody: message,
    //   sentTo: "member"
    // }
    // this.commonService.sendPush(requestingObj).subscribe((data)=>{
    //   console.log(data);
    // })






    // for (let innerIndex = 0; innerIndex < this.androidDeviceTokens.length; innerIndex++) {
    //   // var data = {
    //   //   to: '',
    //   //   notification: {
    //   //     body: '',
    //   //     title: ''
    //   //   }
    //   // };
    //   // data.to = this.androidDeviceTokens[innerIndex];
    //   // data.notification = { body: '', title: '' };
    //   // data.notification.title = this.notificationObj.Purpose;
    //   // data.notification.body = this.notificationObj.Message;

    //     // priority:"high",
    //   var data = {
    //     to: '',
    //     priority:"high",
    //     notification: {
    //       body: '',
    //       title: '',
    //       sound: "default"
    //     },
    //     data: {
    //       param: this.notificationObj.Message.toString(),
    //     },
    //   };
    //   data.to = this.androidDeviceTokens[innerIndex];
    //   data.notification = { body: '', title: '', sound: "default" };
    //   data.notification.title = "";
    //   data.notification.body = this.notificationObj.Message;



    //   // var data ={
    //   //   // "notification":{
    //   //   //   "title":"Notification title",
    //   //   //   "body":"Notification body",
    //   //   //   "sound":"default",
    //   //   //   "click_action":"FCM_PLUGIN_ACTIVITY",
    //   //   //   "icon":"fcm_push_icon"
    //   //   // },
    //   //   "data":{
    //   //     "param1":"value1",
    //   //     "param2":"value2"
    //   //   },
    //   //     // "to":"/topics/topicExample",
    //   //     // "priority":"high",
    //   //     // "restricted_package_name":""
    //   // }








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

    this.navCtrl.pop();
    let m = "Notification sent successfully";
    this.showToast(m, 5000);

  }

  getClubDetails() {

    this.fb.getAllWithQuery("Club/Type2/" + this.parentClubKey, { orderByKey: true, equalTo: this.selectedClub }).subscribe((data) => {
      this.clubDetails = data;
      let msg = "";
      if(this.navParams.get('from') == 'CreatenotePage'){
        msg = this.navParams.get('msg');
      }else{
        msg = "Hi " + this.memberDetails.FirstName + " " + this.memberDetails.LastName + ", Welcome to " + this.clubDetails[0].ClubName + ".";
      }
      this.notificationObj.Message = msg;
    });
  }

}


