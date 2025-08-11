import { SharedServices } from './../../services/sharedservice';
import { FirebaseService } from './../../../services/firebase.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ToastController, AlertController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the NotficationforholidaycampandschoolsessionmemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notficationforholidaycampandschoolsessionmember',
  templateUrl: 'notficationforholidaycampandschoolsessionmember.html',
})
export class NotficationforholidaycampandschoolsessionmemberPage {
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

  description: string = "";

  selectedParentClubKey: string = "";
  memberList = [];
  emailObj = {
    Message: "",
    Subject: ""
  }
  numberOfPeople = "0 recipients";
  parentClubDetails: any;
  memberType = "";
  deviceTokens = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public fb: FirebaseService, public popoverCtrl: PopoverController, public alertCtrl: AlertController, private toastCtrl: ToastController, public sharedservice: SharedServices, public commonService: CommonService) {
    this.memberType = this.navParams.get("MemberType");
    if (this.memberType == "Holidaycampmember") {
      this.memberType = "HolidayCampMember"
    } else {
      this.memberType = "SchoolMember";
    }

    this.notificationObj.Purpose = "NotifyToMember";
    this.notificationObj.sendByRole = "Admin";
    this.notificationObj.SendBy = "Admin";
    this.notificationObj.Message = "";




  }

  ionViewDidLoad() {
    this.emailObj.Message = "Dear All,";
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentClubKey = user.ParentClubKey;

          //get holiday camp member
          this.getMemberList();
          //get parentclub details
          this.getParentclubDetails();
        }
      }
    }).catch(error => {

    });
  }






  cancelSessionCreation() {
    this.navCtrl.pop();
  }
  //*********************************** */
  //get all the holiday camp member
  //*--------------------
  getMemberList() {
    this.fb.getAllWithQuery("/" + this.memberType + "/" + this.selectedParentClubKey, { orderByChild: 'IsChild', equalTo: false }).subscribe((data) => {
      this.memberList = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].IsActive && data[i].IsEnable) {
          this.memberList.push(data[i]);


          //intiializing notification object member list
          this.notificationObj.Member.push({
            Name: data[i].FirstName + " " + data[i].LastName,
            Key: data[i].$key,
            ClubKey: (data[i].ClubKey == undefined || data[i].ClubKey == "") ? "" : data[i].ClubKey,
            SignedUpType: this.commonService.getMemberSignedUpType(data[i])
          });
          console.log(this.notificationObj);
        }
      }
      this.numberOfPeople = this.memberList.length.toString();
    });
  }

  getParentclubDetails() {
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {

      if (data.length > 0) {
        this.parentClubDetails = data[0];
        this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        this.emailObj.Subject = "";
      }
    });
  }






  notificationAlert() {

    let alert = this.alertCtrl.create({
      subTitle: 'Notification',
      message: 'Do you want to send notification?',
      buttons: [
        {
          text: "No",
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.sendNotification();
          }
        }
      ]
    });
    alert.present();


  }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }



  sendNotification() {

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


    this.fb.saveReturningKey("Notification/ParentClub/" + this.selectedParentClubKey + "/Session/ComposeNotification/", this.notificationObj);
    for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {

      memberObject.SignedUpType = this.commonService.getMemberSignedUpType(this.memberList[memberIndex]);
      memberObject.ComposeOn = this.notificationObj.ComposeOn;
      memberObject.CreatedTime = this.notificationObj.CreatedTime;
      memberObject.Message = this.notificationObj.Message;
      memberObject.SendBy = "Admin";
      memberObject.Status = "Unread";
      memberObject.sendByRole = "Admin";
      memberObject.SignedUpType = this.commonService.getMemberSignedUpType(this.memberList[memberIndex]);
      memberObject.Admin.push({
        Key: this.selectedParentClubKey,
      });


      if (this.commonService.getMemberSignedUpType(this.memberList[memberIndex]) == 1) {
        this.fb.saveReturningKey("Notification/Member/" + this.selectedParentClubKey + "/" + this.memberList[memberIndex].ClubKey + "/" + this.memberList[memberIndex].$key + "/Session/Notification/", memberObject);
      } else {
        this.fb.saveReturningKey("Notification/Member/" + this.selectedParentClubKey + "/" + this.memberList[memberIndex].$key + "/Session/Notification/", memberObject);
      }
    }
    let ids:any = [];
    this.notificationObj.Member.forEach((each)=>{
      ids.push(each.Key)
    })
    
    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message =this.notificationObj.Message;
    this.commonService.publishPushMessage(ids,notificationDetailsObj.Message,'Notification',this.selectedParentClubKey);
    //this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });




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





}

