import { Component  } from '@angular/core';
import { LoadingController, AlertController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';
// import { PopoverPage } from '../../popover/popover';

import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { Http, Headers, RequestOptions } from '@angular/http';;
import * as $ from 'jquery';
import { IonicPage } from 'ionic-angular';

import { ActionSheetController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService } from '../../../../services/common.service';

/**
 * Generated class for the ComposenotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-composenotification',
  templateUrl: 'composenotification.html',
})
export class ComposenotificationPage  {
    //content:Content;
    returnKey: any;
    parentClubEmail: string;
    parentClubName: string;
    clubShortName: "";
    clubName: "";
    themeType: number;
    isAndroid: boolean = false;
    parentClubKey: any;
    clubs: any;
    selectedClub: any;
    memberList = [];
    MemberListsForDeviceToken = [];
    activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
    selectedCoachName: any;
    session = [];
    selectedSession: "";
    notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
    notificationObjForSesion = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
    emailObj = { Message: "", Subject: "" };
    isEmail = true;
    selectedActivityType = "";
    selectedCoach = "";
    types = [];
    coachs = [];
    sessionList = [];
    selectectedSessionObj = { Member: [] };
    allSessionMembers = [];
    currentSessionDetails: any;
    currentSessionMembers = [];
    numberOfPeopleToSend = 0;
    recentNotificationList = [];
    loading: any;
    parentClubDetails: any;
    // androidDeviceTokens = [];
    // iOSDeviceTokens = [];
    deviceToken = [];
    blockIndex = -1;
    tempNotification = [];
    notification = [];
    currentLastIndex = 30;
    notificationCountDevider = 0;
    notificationCountreminder = 0;


    copiedText: any = "";
    constructor(private clipboard: Clipboard, public actionSheetCtrl: ActionSheetController, public viewController: ViewController, public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, private storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
        this.storage.get('userObj').then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
              this.parentClubKey = val.UserInfo[0].ParentClubKey;
              this.parentClubName = val.Name;
              this.parentClubEmail = val.EmailID;
              this.getClubList();
            
          }
      });
    }
    //DONE
   
    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            this.MemberListsForDeviceToken = [];
            this.clubs = data;
            if (this.clubs.length != 0) {
                this.selectedClub = this.clubs[0].$key;
                //    for (var index = 0; index < this.clubs.length; index++) {
                // if (this.clubs[index].$key == this.selectedClub) {
                this.clubName = this.clubs[0].ClubName;
                this.clubShortName = this.clubs[0].ClubShortName;
                //  }

                // }
                this.getMemberList();
                this.initialGetActivityList();
                for (let i = 0; i < data.length; i++) {
                    this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.clubs[i].$key + "/").subscribe((token) => {

                        for (let j = 0; j < token.length; j++) {
                            //patch
                            //Due to unsufficient time given to devlope
                            token[j].ClubKey = this.clubs[i].$key;
                            this.MemberListsForDeviceToken.push(token[j]);
                        }
                    });
                }
            }
        });
    }
    initialGetActivityList() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.types = data;
            //this.selectedClub = data[0]
        });
    }
    getActivityList() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.types = data;
            if (this.types.length != 0) {
                this.selectedActivityType = this.types[0].$key;
                this.activityObj = this.types[0];
                this.getCoachListForGroup();
            }
        });
    }

    getCoachListForGroup() {
        this.coachs = [];
        if (this.activityObj.Coach != undefined) {
            this.coachs = this.commonService.convertFbObjectToArray(this.activityObj.Coach);
            //this.selectedCoach = this.coachs[0].CoachKey;
            //this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].MiddleName + " " + this.coachs[0].LastName;
            this.getSessionList();
        }
        else {
            this.selectedCoach = "";
            this.selectedCoachName = "";
            this.coachs = [];
        }
    }


    getSessionList() {
        this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedCoach + "/Group/").subscribe((data) => {
            this.numberOfPeopleToSend = 0;
            this.session = [];
            for (let i = 0; i < data.length; i++) {
                if (new Date(data[i].EndDate).getTime() > new Date().getTime()) {
                    this.session.push(data[i]);
                }
            }

            this.sessionList = [];
            if (this.session.length != 0) {
                let sessionMembers = [];
                for (let i = 0; i < this.session.length; i++) {
                    if (this.session[i].ActivityKey == this.selectedActivityType) {
                        this.sessionList.push(this.session[i]);
                        for (let k = 0; k < this.sessionList.length; k++) {
                            let memberList = this.commonService.convertFbObjectToArray(this.sessionList[k].Member);

                            for (let i = 0; i < memberList.length; i++) {
                                let isExist = false;

                                for (let j = 0; j < sessionMembers.length; j++) {
                                    if (sessionMembers[j].Key == memberList[i].Key) {
                                        isExist = true;
                                        break;
                                    }
                                }
                                if (!isExist && memberList[i].IsActive) {
                                    sessionMembers.push(memberList[i]);
                                }
                            }
                        }
                        this.numberOfPeopleToSend = sessionMembers.length;
                    }
                }
            }

        });
    }



    getMemberList() {
        this.fb.getAll("/Member/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.memberList = data;
            this.numberOfPeopleToSend = this.memberList.length;
        });
    }



    onChangeOfClub(club) {
        this.numberOfPeopleToSend = 0;
        this.selectedActivityType = "";
        this.selectedCoach = "";
        this.types = [];
        this.coachs = [];
        this.session = [];
        this.sessionList = [];
        this.selectedSession = "";



        this.getMemberList();
        this.initialGetActivityList();

        for (var index = 0; index < this.clubs.length; index++) {
            if (this.clubs[index].$key == this.selectedClub) {
                this.clubName = this.clubs[index].ClubName;
                this.clubShortName = this.clubs[index].ClubShortName;
            }

        }


    }
    onChangeActivity() {
        this.numberOfPeopleToSend = 0;
        this.selectedCoach = "";
        this.coachs = [];
        this.session = [];
        this.sessionList = [];
        this.selectedSession = "";

        if (this.selectedActivityType != undefined && this.selectedActivityType != "" && this.selectedActivityType != null && this.selectedActivityType != "select") {
            for (let i = 0; i < this.types.length; i++) {
                if (this.selectedActivityType == this.types[i].$key) {
                    this.activityObj = this.types[i];
                }
            }
            this.getCoachListForGroup();
        }
    }

    onChangeCoach() {
        this.numberOfPeopleToSend = 0;
        this.session = [];
        this.sessionList = [];
        this.selectedSession = "";
        this.getSessionList();
    }


    onChangeSession() {
        this.currentSessionDetails = {};
        this.currentSessionMembers = [];
        this.numberOfPeopleToSend = 0;
        let isPresent = false;

        this.currentSessionDetails = {};
        this.currentSessionMembers = [];
        for (let i = 0; i < this.sessionList.length; i++) {
            if (this.sessionList[i].$key == this.selectedSession) {
                this.currentSessionDetails = this.sessionList[i];
                break;
            }
        }

        let sessionMembers = this.commonService.convertFbObjectToArray(this.currentSessionDetails.Member);

        for (let i = 0; i < sessionMembers.length; i++) {
            if (sessionMembers[i].IsActive) {
                if (sessionMembers[i].ParentKey != "") {
                    isPresent = false;
                    for (let j = 0; j < this.currentSessionMembers.length; j++) {
                        if (this.currentSessionMembers[j].Key == sessionMembers[i].ParentKey) {
                            isPresent = true;
                            break;
                        }
                    }
                    if (!isPresent) {
                        this.currentSessionMembers.push({ Key: sessionMembers[i].ParentKey, ClubKey: sessionMembers[i].ClubKey });
                    }
                } else {
                    this.currentSessionMembers.push(sessionMembers[i]);
                }
            }
        }
        this.numberOfPeopleToSend = this.currentSessionMembers.length;
    }
    cancel() {
        this.navCtrl.pop();
    }

    focusOutMessage() {

        this.emailObj.Subject = this.notificationObj.Message.split(/\s+/).slice(0, 4).join(" ");
        //this.emailObj.Message = this.notificationObj.Message;
    }
    sendNotification() {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        let message = this.notificationObj.Message;
        if (message != "") {
            let confirm = this.alertCtrl.create({
                title: 'Notification Alert',
                message: 'Are you sure you want to send the message?',
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
                            // this.loading.present();
                            // this.asyncAwait();
                            this.loading = this.loadingCtrl.create({
                                content: 'Please wait...'
                            });
                            this.loading.present().then(() => {
                                this.notify();
                                this.loading.dismiss();
                                //this.navCtrl.pop();
                            });

                        }
                    }
                ]
            });
            confirm.present();
        }
        else {
            let m = "Please Enter message";
            this.showToast(m);
        }
    }



    notify() {
        try {


            let notificationDetailsObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread" };

            let message = this.notificationObj.Message;
            notificationDetailsObj.Message = message;


            if (this.selectedActivityType == undefined || this.selectedActivityType == "" || this.selectedActivityType == null || this.selectedActivityType == "select") {

                let storeNotificationObj = notificationDetailsObj;


                
                let pc = {
                    CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread",
                    Member: []
                };
                pc.SendBy = "Admin";;
                pc.sendByRole = "Admin";
                pc.Purpose = "";
                pc.Message = notificationDetailsObj.Message;
                pc.CreatedTime = new Date().toString();
                pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


                let memberObject = {
                    CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                    Message: notificationDetailsObj.Message,
                    SendBy: 'Admin',
                    ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                    Purpose: '',
                    sendByRole: "Admin",
                    Status: "Unread",
                    Admin: []
                };

                for (let i = 0; i < this.memberList.length; i++) {
                    pc.Member.push({
                        Name: (this.memberList[i].FirstName == undefined ? "" : this.memberList[i].FirstName) + " " + (this.memberList[i].LastName == undefined ? "" : this.memberList[i].LastName),
                        Key: (this.memberList[i].$key == undefined ? "" : this.memberList[i].$key),
                        ClubKey: (this.memberList[i].ClubKey == undefined ? "" : this.memberList[i].ClubKey),
                        SignedUpType: 1
                    });
                }


                this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

                for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
                    if (this.memberList[memberIndex].ParentKey == undefined || this.memberList[memberIndex].ParentKey == "") {

                        memberObject.Admin[0] = { Key: this.parentClubKey };
                        //  this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.memberList[memberIndex].$key + "/Session/Notification/", memberObject);
                    }
                }
                // this.androidDeviceTokens = [];
                // this.iOSDeviceTokens = [];
                let DeviceTokenCorrespondingClub = [];
                for (let deviceTokenIndex = 0; deviceTokenIndex < this.MemberListsForDeviceToken.length; deviceTokenIndex++) {
                    if (this.selectedClub == this.MemberListsForDeviceToken[deviceTokenIndex].ClubKey) {
                        DeviceTokenCorrespondingClub.push(this.MemberListsForDeviceToken[deviceTokenIndex]);

                    }
                }
                for (let tokenInd = 0; tokenInd < DeviceTokenCorrespondingClub.length; tokenInd++) {
                    let tokens = this.commonService.convertFbObjectToArray(DeviceTokenCorrespondingClub[tokenInd].Token);
                    for (let loop = 0; loop < tokens.length; loop++) {
                        if (tokens[loop].DeviceToken.trim() != "") {
                            this.deviceToken.push({ MobileDeviceId: tokens[loop].DeviceToken, ConsumerID: "", PlatformArn: "" });
                            // if (tokens[loop].DeviceToken.length != 64) {
                            //     this.androidDeviceTokens.push(tokens[loop].DeviceToken);
                            // } else if (tokens[loop].DeviceToken.length == 64) {
                            //     this.iOSDeviceTokens.push(tokens[loop].DeviceToken);
                            // }
                        }
                    }

                }



                let url = this.sharedservice.getEmailUrl();
                let pKey = this.sharedservice.getParentclubKey();
                this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceToken, Message: notificationDetailsObj.Message, Subject: "Notification", ParentclubKey: pKey });
            }

            else if (this.selectedSession == "" || this.selectedSession == undefined || this.selectedSession == null || this.selectedSession == "select") {
                this.allSessionMembers = [];
                for (let k = 0; k < this.sessionList.length; k++) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionList[k].Member);
                    for (let i = 0; i < memberList.length; i++) {
                        let isExist = false;
                        for (let j = 0; j < this.allSessionMembers.length; j++) {
                            if (this.allSessionMembers[j].Key == memberList[i].Key) {
                                isExist = true;
                                break;
                            }
                        }
                        if (!isExist) {
                            this.allSessionMembers.push(memberList[i]);
                        }
                    }
                }


                //get unique parent key
                let allSessionMembersArr = [];
                let isPresent = false;
                for (let i = 0; i < this.allSessionMembers.length; i++) {
                    if (this.allSessionMembers[i].IsActive) {
                        if (this.allSessionMembers[i].ParentKey != "") {
                            isPresent = false;
                            for (let j = 0; j < allSessionMembersArr.length; j++) {
                                if (allSessionMembersArr[j].Key == this.allSessionMembers[i].ParentKey) {
                                    isPresent = true;
                                    break;
                                }
                            }
                            if (!isPresent) {
                                allSessionMembersArr.push({ Key: this.allSessionMembers[i].ParentKey, ClubKey: this.allSessionMembers[i].ClubKey });
                            }
                        } else {
                            allSessionMembersArr.push(this.allSessionMembers[i]);
                        }
                    }
                }

                let storeNotificationObj = notificationDetailsObj;




                let pc = {
                    CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread",
                    Member: []
                };
                pc.SendBy = "Admin";
                pc.sendByRole = "Admin";
                pc.Purpose = "";
                pc.Message = notificationDetailsObj.Message;
                pc.CreatedTime = new Date().toString();
                pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


                let memberObject = {
                    CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                    Message: notificationDetailsObj.Message,
                    SendBy: 'Admin',
                    ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                    Purpose: '',
                    sendByRole: "Admin",
                    Status: "Unread",
                    Admin: []
                };

                for (let i = 0; i < allSessionMembersArr.length; i++) {
                    pc.Member.push({
                        Name: (allSessionMembersArr[i].FirstName == undefined ? "" : allSessionMembersArr[i].FirstName) + " " + (allSessionMembersArr[i].LastName == undefined ? "" : allSessionMembersArr[i].LastName),
                        Key: (allSessionMembersArr[i].Key == undefined ? "" : allSessionMembersArr[i].Key),
                        ClubKey: (allSessionMembersArr[i].ClubKey == undefined ? "" : allSessionMembersArr[i].ClubKey),
                        SignedUpType: 1
                    });
                }

                this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);
                for (let memberIndex = 0; memberIndex < allSessionMembersArr.length; memberIndex++) {
                   
                    memberObject.Admin[0] = { Key: this.parentClubKey };
                    this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + allSessionMembersArr[memberIndex].ClubKey + "/" + allSessionMembersArr[memberIndex].Key + "/Session/Notification/", memberObject);
                }


                let sendTo = [];
                if (allSessionMembersArr.length != 0) {
                    let mlist = allSessionMembersArr;
                    for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
                        for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
                            if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
                                sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
                            }
                        }
                    }

                    // this.androidDeviceTokens = [];
                    // this.iOSDeviceTokens = []
                    for (let tokenInd = 0; tokenInd < sendTo.length; tokenInd++) {
                        let tokens = this.commonService.convertFbObjectToArray(sendTo[tokenInd].Token);
                        for (let loop = 0; loop < tokens.length; loop++) {
                            if (tokens[loop].DeviceToken.trim() != "") {
                                // if (tokens[loop].DeviceToken.length != 64) {
                                //     this.androidDeviceTokens.push(tokens[loop].DeviceToken);
                                // } else if (tokens[loop].DeviceToken.length == 64) {
                                //     this.iOSDeviceTokens.push(tokens[loop].DeviceToken);
                                // }
                                this.deviceToken.push({ MobileDeviceId: tokens[loop].DeviceToken, ConsumerID: "", PlatformArn: "" });
                            }
                        }

                    }

                  
                    let url = this.sharedservice.getEmailUrl();
                    let pKey = this.sharedservice.getParentclubKey();
                    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceToken, Message: notificationDetailsObj.Message, Subject: "Notification", ParentclubKey: pKey });
           
                }


            }
            
            else {


                let pc = {
                    CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread",
                    Member: []
                };
                pc.SendBy = "Admin";
                pc.sendByRole = "Admin";
                pc.Purpose = "";
                pc.Message = notificationDetailsObj.Message;
                pc.CreatedTime = new Date().toString();
                pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


                let memberObject = {
                    CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                    Message: notificationDetailsObj.Message,
                    SendBy: 'Admin',
                    ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                    Purpose: '',
                    sendByRole: "Admin",
                    Status: "Unread",
                    Admin: []
                };

                for (let i = 0; i < this.currentSessionMembers.length; i++) {
                    pc.Member.push({
                        Name: (this.currentSessionMembers[i].FirstName == undefined ? "" : this.currentSessionMembers[i].FirstName) + " " + (this.currentSessionMembers[i].LastName == undefined ? "" : this.currentSessionMembers[i].LastName),
                        Key: (this.currentSessionMembers[i].Key == undefined ? "" : this.currentSessionMembers[i].Key),
                        ClubKey: (this.currentSessionMembers[i].ClubKey == undefined ? "" : this.currentSessionMembers[i].ClubKey),
                        SignedUpType: 1
                    });
                }


                this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

                for (let memberIndex = 0; memberIndex < this.currentSessionMembers.length; memberIndex++) {
                 
                    memberObject.Admin[0] = { Key: this.parentClubKey };
                    this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.currentSessionMembers[memberIndex].ClubKey + "/" + this.currentSessionMembers[memberIndex].Key + "/Session/Notification/", memberObject);
                }


                let sendTo = [];
                let mlist = this.currentSessionMembers;
                for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
                    for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
                        if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
                            sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
                        }
                    }
                }



                // this.androidDeviceTokens = [];
                // this.iOSDeviceTokens = []
                for (let tokenInd = 0; tokenInd < sendTo.length; tokenInd++) {
                    let tokens = this.commonService.convertFbObjectToArray(sendTo[tokenInd].Token);
                    for (let loop = 0; loop < tokens.length; loop++) {
                        if (tokens[loop].DeviceToken.trim() != "") {
                            this.deviceToken.push({ MobileDeviceId: tokens[loop].DeviceToken, ConsumerID: "", PlatformArn: "" });
                            // if (tokens[loop].DeviceToken.length != 64) {
                            //     this.androidDeviceTokens.push(tokens[loop].DeviceToken);
                            // } else if (tokens[loop].DeviceToken.length == 64) {
                            //     this.iOSDeviceTokens.push(tokens[loop].DeviceToken);
                            // }
                        }
                    }

                }


                // for (let innerIndex = 0; innerIndex < this.androidDeviceTokens.length; innerIndex++) {
                //     notificationDetailsObj.Purpose = "Session";
                //     notificationDetailsObj.Message = message;
                //     regToken = this.androidDeviceTokens[innerIndex];
                //     // var data = { to: '', notification: { body: '', title: '' } };
                //     let data = {
                //         to: '',
                //         priority: "high",
                //         notification: {
                //             body: '',
                //             title: '',
                //             sound: "default",
                //         },
                //         data: {
                //             param: notificationDetailsObj.Message,
                //         },
                //     };
                //     data.to = regToken;
                //     data.notification = { body: '', title: '', sound: "default", };
                //     data.notification.title = "";
                //     data.notification.body = notificationDetailsObj.Message;
                //     let headers = new Headers({
                //         'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
                //         'Content-Type': 'application/json'
                //     });
                //     let options = new RequestOptions({ headers: headers });
                //     this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
                //         this.notificationObj.Message = "";
                //     }, err => {
                //         console.log("ERROR!: ", err);
                //     }
                //     );
                // }

                let url = this.sharedservice.getEmailUrl();
                let pKey = this.sharedservice.getParentclubKey();
                this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceToken, Message: notificationDetailsObj.Message, Subject: "Notification", ParentclubKey: pKey });
                // $.ajax({
                //     url: url + "umbraco/surface/ActivityProSurface/SendNotification/",
                //     data: {
                //         DeviceID: this.deviceToken,
                //         DeviceType: 2,
                //         MessageType: 1,
                //         Message: notificationDetailsObj.Message,
                //         CertificateFileName: this.parentClubDetails.APNSCertificateFileName
                //     },
                //     type: "POST",
                //     success: function (response) {
                //     }, error: function (error, xhr) {


                //     }
                // });


            }
            message = "";
            this.notificationObj.Message = "";
            let m = "Notification sent successfully";
            this.showToast(m);

            this.navCtrl.setRoot("Dashboard");
        } catch (ex) {

        }

    }
  
    showToast(m: string) {

        let toast = this.toastCtrl.create({
            message: m,
            duration: 5000,

            position: 'bottom',
            showCloseButton: true,
            closeButtonText: "Undo"
        });

        toast.present();
    }

    validate() {
        if (this.selectedCoach == "" || this.selectedCoach == undefined || this.selectedCoach == null) {
            let message = "Select Coach";
            this.showToast(message);
            return false;
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


    showAlert(item) {
        this.navCtrl.push("NotificationDetails", { "NotificationDetail": item });
    }


    preContext = '';
    showBlock(index, data) {
        this.blockIndex = (this.blockIndex == index) ? -1 : index;
        this.preContext = JSON.parse(JSON.stringify(data));
    }


    copy(data) {
        this.clipboard.copy(data);
        this.showToast('Content Copied');
        console.log(this.clipboard.paste());
    }
    favorite(item) {
        console.log(item);
    }
    
    test(){
        console.log('test');
    }
}
