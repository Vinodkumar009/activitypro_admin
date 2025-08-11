import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform, ActionSheetController, ModalController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import { GetPlayerModel } from '../models/team.model';
import { HttpLink } from 'apollo-angular-link-http';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';


/**
 * Generated class for the SendnotificationteamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sendnotificationteam',
  templateUrl: 'sendnotificationteam.html',
})
export class SendnotificationteamPage {
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", TournamentName: '' };
  sendTo = [];
  deviceTokens = [];
  parentClubDetails: any;
  mlist:GetPlayerModel;
  themeType:number;
  isAndroid:boolean;
  parentClubKey:any;
  loading:any;
  tournamentKey: string;
  popoverCtrl: any;

  
  constructor(  public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public platform: Platform,
    public fb: FirebaseService,
    public alertCtrl: AlertController,
    public commonService: CommonService,
    private toastCtrl: ToastController,
    public sharedservice: SharedServices,
    public modalCtrl: ModalController,
    popoverCtrl:PopoverController) {
    
     
  
     this.mlist=this.navParams.get("mlist");
     console.log('data for notification:',this.mlist);    
     this.notificationObj.Message = "Hi "+ this.mlist.user.FirstName +" "+ this.mlist.user.LastName   +" ",
    console.log("notification message:",  this.notificationObj.Message);


     this.parentClubKey = navParams.get('ParentClubKey');
     console.log("Parent Club Id is:",typeof this.parentClubKey)
    //  this.deviceTokens = [];
    //  let x = { MobileDeviceId: "", ConsumerID: "", PlatformArn: "" }
  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendnotificationteamPage');
    // this.storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   for (let user of val.UserInfo) {
    //     if (val.$key != "") {
    //       this.selectedParentClubKey = user.ParentClubKey;
    //        this.getMemberList();
    //        this.getParentclubDetails();
    //     }
    //   }
    // }).catch(error => {

    // });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  // getDeviceTokens(clubKey, memberKey) {
  //   this.fb.getAllWithQuery("/DeviceToken/Member/" + this.parentClubKey + "/" + clubKey,
  //     { orderByKey: true, equalTo: memberKey })
  //     .subscribe((data) => {
  //       if (data.length > 0) {
  //         console.log(data)
  //         data.forEach(eachMember => {
  //           this.commonService.convertFbObjectToArray(eachMember.Token)
  //             .forEach(eachDevice => {
  //               this.deviceTokens.push({ MobileDeviceId: eachDevice.DeviceToken, ConsumerID: "", PlatformArn: "" });
  //             })
  //         });
  //       }
  //     });
  // }
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
  
      let alert = this.alertCtrl.create({
        subTitle: 'Send notification',
        message: 'Are you sure want to send notification ?',
        buttons: [
          {
            text: "Don't send",
            role: 'cancel',
            handler: () => {

            }
          },
          {
            text: 'Send',
            handler: () => {
              this.notify();
            }
          }
        ]
      });
      alert.present();
    } 
  
  // getAlertMessage(): string {
  //   if (this.mlist.length == 1) {
  //     return "Are you sure you want to send the notification to "+this.mlist[0].user.FirstName+ this.mlist[0].user.LastName+" for this Tournament?"
  //   } else {
  //     return "Are you sure you want to send the notification to all the members of the Tournament?"
  //   }
  // }


  
  
  // goToDashboardMenuPage() {
  //   this.navCtrl.setRoot("Dashboard");
  // }

  // cancel() {
  //   this.navCtrl.pop();
  // }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create("PopoverPage");
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }
  // notify() {

  //   const notifyUser=gql`
  //   query notifyUser($parentClub: String!
  //     $heading: String!
  //     $message: String!
  //     $userFirebaseId: String!){
  //       notifyUser(parentClub:$parentClub heading:$heading message:$message 
  //         userFirebaseId:$userFirebaseId){

  //         }
  //     }
  //   `;
  //   this.apollo
  //   .query({
  //     query:notifyUser,
  //     fetchPolicy: "network-only",
  //     variables:{
  //       parentClub:this.parentClubKey,
  //       heading:"",
  //       message:this.notificationObj.Message,
  //       userFirebaseId:"-MP3ld83zU7MCJjU0JQy"
  //     }
  //   })
    
   
  // }

  notify(){
    const notifyUser = gql`
    query notifyUser($parentClub: String!, $heading:String!, $message:String! , $userFirebaseId:String!) {
      notifyUser(parentClub:$parentClub, heading:$heading ,message:$message, userFirebaseId:$userFirebaseId) 
       
   
      }

  `;
  this.apollo
    .query({
      query: notifyUser,
      fetchPolicy: "network-only",
      variables: {
        parentClub:this.parentClubKey,
        heading:"",
        message:this.notificationObj.Message,
        userFirebaseId:"-MP3ld83zU7MCJjU0JQy"


      },
    })
    .subscribe(({ data }) => {
      this.commonService.hideLoader();
        this.commonService.toastMessage(
          "Notification Send Successfully",
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        console.log("Notification Data:" +data[notifyUser]);

        this.navCtrl.pop();


     
    });
  (err) => {
    // this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage(
      "Notification failed",
      2500,
      ToastMessageType.Error,
      ToastPlacement.Bottom
    );
  };
  }

  

  // sendNotification() {
  //   this.notify();
  // }



  //Alert Message




  // notify() {

  //   let notificationDetailsObj = this.notificationObj;

  //   let pc = {
  //     CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread",
  //     Member: []
  //   };
  //   pc.SendBy = "Admin";
  //   pc.sendByRole = "Admin";
  //   pc.Purpose = " ";
  //   pc.Message = notificationDetailsObj.Message;
  //   pc.CreatedTime = new Date().toString();
  //   pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();

  //   let memberObject = {
  //     CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
  //     Message: notificationDetailsObj.Message,
  //     SendBy: 'Admin',
  //     ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
  //     Purpose: 'Holiday Camp',
  //     sendByRole: "Admin",
  //     Status: "Unread",
  //     Admin: [],
  //     SignedUpType: 1
  //   };
  //   let ids:any = []
  //   for (let i = 0; i < this.mlist.length; i++) {
  //     ids.push(this.mlist[i].Key);
  //     pc.Member.push({
  //       Name: this.mlist[i].UserName,
  //       Key: this.mlist[i].Key,
  //       ClubKey: this.mlist[i].ClubKey,
  //       SignedUpType: this.mlist[i].SignedUpType
  //     });
  //   }

  //   this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

  //   for (let i = 0; i < this.mlist.length; i++) {
  //     memberObject.Admin[0] = { Key: this.parentClubKey };
  //     memberObject.SignedUpType = this.mlist[i].SignedUpType;
  //     if (this.mlist[i].SignedUpType == 1) {
  //       this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
  //     } else {
  //       this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
  //     }
  //   }


  //   // for (let innerIndex = 0; innerIndex < this.androidDeviceTokens.length; innerIndex++) {
  //   //   // var data = { to: '', notification: { body: '', title: '' } };
  //   //   let data = {
  //   //     to: '',
  //   //     priority: "high",
  //   //     notification: {
  //   //       body: '',
  //   //       title: '',
  //   //       sound: "default",
  //   //     },
  //   //     data: {
  //   //       param:notificationDetailsObj.Message.toString(),
  //   //     },
  //   //   };
  //   //   data.to = this.androidDeviceTokens[innerIndex];
  //   //   data.notification = { body: '', title: '',  sound: "default", };
  //   //   data.notification.title = "";
  //   //   data.notification.body = notificationDetailsObj.Message;
  //   //   let headers = new Headers({
  //   //     'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
  //   //     'Content-Type': 'application/json'
  //   //   });
  //   //   let options = new RequestOptions({ headers: headers });
  //   //   this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
  //   //     this.notificationObj.Message = "";
  //   //   }, err => {
  //   //     console.log("ERROR!: ", err);
  //   //   }
  //   //   );

  //   // }



  //   let url = this.sharedservice.getEmailUrl();
  //   let pKey = this.sharedservice.getParentclubKey();
  //   let message = notificationDetailsObj.Message;
  //   this.commonService.publishPushMessage(ids,notificationDetailsObj.Message,'Notification',this.parentClubKey);
  //  // this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });



  //   this.navCtrl.pop();
  //   let m = "Notification sent successfully";
  //   this.showToast(m, 5000);


  // }

  // getDeviceToken() {

  //   // this.androidDeviceTokens = [];
  //   this.deviceTokens = [];

   
    
  //   let isPresent = false;
  //   let sendTo = [];

  //   if (this.functionalityBlock != "SessionIndividualMember") {

  //     if (this.sessionDetails.Members != undefined) {
  //       if (this.sessionDetails.Members.length != 0) {
  //         let a = [];
  //         this.mlist = [];
  //         a = this.sessionDetails.Members;
  //         for (let i = 0; i < a.length; i++) {
  //           a[i]["UserName"] = a[i].FirstName + " " + a[i].LastName;
  //           if (a[i].ParentKey != "") {
  //             isPresent = false;
  //             for (let j = 0; j < this.mlist.length; j++) {
  //               if (this.mlist[j].Key == a[i].ParentKey) {
  //                 isPresent = true;
  //                 break;
  //               }
  //             }
  //             if (!isPresent) {
  //               this.mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey, UserName: a[i].UserName, SignedUpType: a[i].SignedUpType });
  //             }
  //           } else {
  //             this.mlist.push(a[i]);
  //           }


  //         }



  //         for (let i = 0; i < this.mlist.length; i++) {
  //           let key = "";
  //           // this.mlist[i]["SignedUpType"] = 1;
  //           if (this.mlist[i].ParentKey == "" || this.mlist[i].ParentKey == undefined) {
  //             this.mlist[i]["TokenDbKey"] = this.mlist[i].Key;
  //           } else {
  //             this.mlist[i]["TokenDbKey"] = this.mlist[i].ParentKey;
  //           }
  //           this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
  //             for (let j = 0; j < data.length; j++) {
  //               // if (data[j].DeviceToken.length > 64) {
  //               //   this.androidDeviceTokens.push(data[j].DeviceToken);
  //               // } else {
  //               //   this.iOSDeviceTokens.push(data[j].DeviceToken);
  //               // }
  //               this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
  //             }
  //           });
  //         }
  //       }
  //     }
  //     else if (this.sessionDetails.Member != undefined) {
  //       if (Object.keys(this.sessionDetails.Member).length != 0) {
  //         let a = [];
  //         a = this.commonService.convertFbObjectToArray(this.sessionDetails.Member);
  //         for (let i = 0; i < a.length; i++) {
  //           a[i]["UserName"] = a[i].FirstName + " " + a[i].LastName;
  //           if (a[i].ParentKey != "") {
  //             isPresent = false;
  //             for (let j = 0; j < this.mlist.length; j++) {
  //               if (this.mlist[j].Key == a[i].ParentKey) {
  //                 isPresent = true;
  //                 break;
  //               }
  //             }
  //             if (!isPresent) {
  //               this.mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey, UserName: a[i].UserName, SignedUpType: a[i].SignedUpType });
  //             }
  //           } else {
  //             this.mlist.push(a[i]);
  //           }


  //         }



  //         for (let i = 0; i < this.mlist.length; i++) {
  //           if (this.mlist[i].ClubKey != "") {
  //             let key = "";
  //             this.mlist[i]["SignedUpType"] = 1;
  //             if (this.mlist[i].ParentKey == "" || this.mlist[i].ParentKey == undefined) {
  //               this.mlist[i]["TokenDbKey"] = this.mlist[i].Key;
  //             } else {
  //               this.mlist[i]["TokenDbKey"] = this.mlist[i].ParentKey;
  //             }
  //             this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
  //               for (let j = 0; j < data.length; j++) {
  //                 // if (data[j].DeviceToken.length > 64) {
  //                 //   this.androidDeviceTokens.push(data[j].DeviceToken);
  //                 // } else {
  //                 //   this.iOSDeviceTokens.push(data[j].DeviceToken);
  //                 // }
  //                 this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
  //               }
  //             });
  //           }

  //         }
  //       }
  //     }

  //   } else if (this.functionalityBlock == "SessionIndividualMember") {

  //     this.mlist = [];
  //     this.mlist.push({
  //       ClubKey: this.memberList[0].ClubKey,
  //       Key: "",
  //       UserName: this.memberList[0].UserName,
  //       ParentKey: this.memberList[0].ParentKey,
  //     });

  //     //  if (this.mlist[0].ClubKey != "") {

  //     let key = "";
  //     this.mlist[0]["SignedUpType"] = this.memberList[0].SignedUpType;
  //     if (this.mlist[0].ParentKey == "" || this.mlist[0].ParentKey == undefined) {
  //       this.mlist[0]["TokenDbKey"] = this.memberList[0].Key;
  //       this.mlist[0].Key = this.memberList[0].Key;
  //     } else {
  //       this.mlist[0]["TokenDbKey"] = this.memberList[0].ParentKey;
  //       this.mlist[0].Key = this.memberList[0].ParentKey;
  //     }
  //     if (this.memberList[0].SignedUpType == 1) {
  //       this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[0].ClubKey + "/" + this.mlist[0].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
  //         for (let j = 0; j < data.length; j++) {
  //           // if (data[j].DeviceToken.length > 64) {
  //           //   this.androidDeviceTokens.push(data[j].DeviceToken);
  //           // } else {
  //           //   this.iOSDeviceTokens.push(data[j].DeviceToken);
  //           // }
  //           this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
  //         }
  //       });
  //     } else {
  //       this.fb.getAllWithQuery("/DeviceToken/Member/" + this.campDetails.ParentClubKey + "/" + this.mlist[0].TokenDbKey + "/Token/", { orderByKey: true }).subscribe((data) => {
  //         for (let j = 0; j < data.length; j++) {
  //           // if (data[j].DeviceToken.length > 64) {
  //           //   this.androidDeviceTokens.push(data[j].DeviceToken);
  //           // } else {
  //           //   this.iOSDeviceTokens.push(data[j].DeviceToken);
  //           // }


  //           this.deviceTokens.push({ MobileDeviceId: data[j].DeviceToken, ConsumerID: "", PlatformArn: "" });
  //         }
  //       });
  //     }

  //     // }
  //   }
  // }


  // getClubDetails() {

  //   this.fb.getAllWithQuery("Club/Type2/" + this.parentClubKey, { orderByKey: true, equalTo: this.selectedClub }).subscribe((data) => {
  //     this.clubDetails = data;
  //     let msg = "";
  //     if (this.navParams.get('from') == 'CreatenotePage') {
  //       msg = this.navParams.get('msg');
  //     } else {
  //       msg = "Hi " + this.memberDetails.FirstName + " " + this.memberDetails.LastName + ", Welcome to " + this.clubDetails[0].ClubName + ".";
  //     }
  //     this.notificationObj.Message = msg;
  //   });
  // }

  // getParenrMember() {
  //   return new Promise((res, rej) => {
  //     this.fb.getAllWithQuery(`Member/${this.memberDetails.ParentClubKey}/${this.memberDetails.ClubKey}`, { orderByKey: true, equalTo: this.memberDetails.$key }).subscribe((data) => {
  //       res(data[0]);
  //     })
  //   })
  // }

  // getDeviceToken() {
  //   if (this.commonService.getMemberSignedUpType(this.memberDetails) == 1) {
  //     this.fb.getAllWithQuery("/DeviceToken/Member/" + this.memberDetails.ParentClubKey + "/" + this.memberDetails.ClubKey + "/" + this.memberDetails.$key + "/Token", { orderByKey: true }).subscribe((response) => {
  //       this.deviceTokens = [];
  //       for (let i = 0; i < response.length; i++) {

  //         this.deviceTokens.push({ MobileDeviceId: response[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
  //       }
  //     });
  //   }
  //   else {
  //     this.fb.getAllWithQuery("/DeviceToken/Member/" + this.memberDetails.ParentClubKey + "/" + this.memberDetails.$key + "/Token", { orderByKey: true }).subscribe((response) => {
  //       this.deviceTokens = [];

  //       for (let i = 0; i < response.length; i++) {
  //         this.deviceTokens.push({ MobileDeviceId: response[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
  //       }
  //     });
  //   }
  // }

  // async getMemberKey() {
  //   if (this.memberDetails.IsChild) {
  //     const data: any = await this.getParenrMember();
  //     return data.$key
  //   } else {
  //     return this.memberDetails.$key
  //   }
  // }

  // showToast(m: string, d: number) {
  //   let toast = this.toastCtrl.create({
  //     message: m,
  //     duration: d,
  //     position: 'bottom'
  //   });
  //   toast.present();
  // }


}
