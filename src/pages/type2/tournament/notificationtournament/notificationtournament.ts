
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';



@IonicPage()
@Component({
  selector: 'notificationtournament-page',
  templateUrl: 'notificationtournament.html'
})

export class NotificationTournament {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", TournamentName: '' };
  sendTo = [];
  tournamentKey: any;
  mlist = [];
  selectedClub: any;
  loading: any;
  deviceTokens = [];
  parentClubDetails: any;
  tournamentName: any;
  ids:any = []
  constructor(public commonService: CommonService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navParams: NavParams, private toastCtrl: ToastController,
    private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController,
    public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');


    // this.sendTo = navParams.get('UsersDeviceToken');
    this.mlist = navParams.get('Members');
    if (this.mlist.length == 1) {
      this.notificationObj.Message = "Hi " + this.mlist[0].FirstName + ", Tournament starts today. Thanks."
    }else{
      this.notificationObj.Message = "Hi all, Tournament starts today. Thanks."
    }
    this.tournamentKey = navParams.get('TournamentKey');
    this.tournamentName = navParams.get('tournamentName');
    this.notificationObj.TournamentName = this.tournamentName;
    this.parentClubKey = navParams.get('ParentClubKey');
    console.log(this.mlist)
    this.deviceTokens = [];
    let x = { MobileDeviceId: "", ConsumerID: "", PlatformArn: "" }

    this.mlist.forEach(eachMember => {
      if (eachMember.IsChild) {
        this.ids.push(eachMember.ParentKey)
        this.getDeviceTokens(eachMember.ClubKey, eachMember.ParentKey)
      } else {
        this.ids.push(eachMember.Key)
        this.getDeviceTokens(eachMember.ClubKey, eachMember.Key)
      }
    })
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

  getDeviceTokens(clubKey, memberKey) {
    this.fb.getPropValue("/DeviceToken/Member/" + this.parentClubKey + "/" + clubKey + "/" + memberKey + "/" + "Token").then((tokens) => {
      if (tokens) {
        console.log(tokens)
        this.commonService.convertFbObjectToArray(tokens)
            .forEach(eachDevice => {
              this.deviceTokens.push({ MobileDeviceId: eachDevice.DeviceToken, ConsumerID: "", PlatformArn: "" });
            })
      }; 
    })
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
      message: this.getAlertMessage(),
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
  getAlertMessage(): string {
    if (this.mlist.length == 1) {
      return "Are you sure you want to send the notification to "+this.mlist[0].FirstName+" for this Tournament?"
    } else {
      return "Are you sure you want to send the notification to all the members of the Tournament?"
    }
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
    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "Tournament";
    pc.Message = notificationDetailsObj.Message;
    pc.SessionName = this.tournamentName;
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();



    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: notificationDetailsObj.Message,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'Session',
      SessionName: this.notificationObj.TournamentName,
      sendByRole: "Admin",
      Status: "Unread",
      Admin: []
    };

    for (let i = 0; i < this.mlist.length; i++) {
      pc.Member.push({
        Name: this.mlist[i].FirstName + " " + this.mlist[i].LastName,
        Key: this.mlist[i].Key,
        ClubKey: this.mlist[i].ClubKey,
        SignedUpType: 1
      });
    }

    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Tournament/" +
      this.tournamentKey + "/ComposeNotification/", pc);
      let memberKeyArr = [];
      for (let i = 0; i < this.mlist.length; i++) {
        memberKeyArr.push(this.mlist[i].Key)
        memberObject.SendBy = "Admin";
        memberObject.sendByRole = "Admin";
        memberObject.Purpose = "Tournament"
        memberObject.SessionName = this.notificationObj.TournamentName;
        memberObject.CreatedTime = new Date().toString();
        memberObject.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
        memberObject.Status = "Unread";
  
        memberObject.Admin[0] = { Key: this.parentClubKey };
        // if(this.session.navigateFrom == undefined){
        //   this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
        // }else{
        //   this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Tournament/ComposeNotification/", memberObject);
        // }
        this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Tournament/ComposeNotification/", memberObject);
        let message =  notificationDetailsObj.Message;
        // this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });
          let reqObj = {
            parentClubKey: this.parentClubKey ,
            messegeHeader: "string",
            messegeBody: message, 
            members:memberKeyArr,
            sentTo: "member"
          }
          // this.commonService.sendBulkPush(reqObj).subscribe((data)=>{
          //   console.log(data);
          // });
          
      }

      this.commonService.publishPushMessage(<any>memberKeyArr,notificationDetailsObj.Message,this.notificationObj.TournamentName,this.parentClubKey)
      this.commonService.toastMessage("Notification sent successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);

  }
}


