import { Component } from '@angular/core';
import { LoadingController, AlertController, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { Http, Headers, RequestOptions } from '@angular/http';;


import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'notificationcoach-page',
    templateUrl: 'notificationcoach.html'
})

export class CoachNotification {
    themeType: number;
    isAndroid: boolean = false;
    parentClubKey: any;
    selectedTab: string = "Recents";
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
    coachKey = '';
    coachType = "";
    isShow = false;
    constructor(public commonService:CommonService,public loadingCtrl: LoadingController, public alertCtrl: AlertController, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        
        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.coachKey = val.UserInfo[0].CoachKey;
                this.coachType = val.Type;
              
                this.getNotification();
                this.getClubList();
            }
        })
    }






    //DONE
    getNotification() {

        this.isShow = true;
        let time;
        this.fb.getAll("/Notification/Coach/" + this.parentClubKey + '/' + this.coachKey + "/Session/ComposeNotification/").subscribe((data) => {

            let x = data;
            if (x.length > 0) {
                this.isShow = false;
            }
            this.recentNotificationList = [];
            for (let i = x.length; i > 0; i--) {

                this.recentNotificationList.push(data[i - 1]);
            }

            //this.recentNotificationList = data;
            if (data.length > 0) {
                for (let i = 0; i < this.recentNotificationList.length; i++) {
                    //this.fb.update(this.recentNotificationList[i].$key, "/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", { Status: "Read" })
                    let totalTimeInMiliSec = new Date().getTime() - new Date(this.recentNotificationList[i].CreatedTime).getTime();

                    if (totalTimeInMiliSec >= 0 && totalTimeInMiliSec < 60000) {
                        time = totalTimeInMiliSec / 1000;
                        this.recentNotificationList[i].TimesAgo = Math.floor(time) + "sec";
                    }
                    else if (totalTimeInMiliSec >= 60000 && totalTimeInMiliSec < 3600000) {
                        time = totalTimeInMiliSec / 60000;
                        this.recentNotificationList[i].TimesAgo = Math.floor(time) + "min";
                    }
                    else if (totalTimeInMiliSec >= 3600000 && totalTimeInMiliSec < 86400000) {
                        time = totalTimeInMiliSec / 3600000;
                        this.recentNotificationList[i].TimesAgo = Math.floor(time) + "hr";
                    }
                    else if (totalTimeInMiliSec >= 86400000 && totalTimeInMiliSec < 2678400000) {
                        time = totalTimeInMiliSec / 86400000;
                        this.recentNotificationList[i].TimesAgo = Math.floor(time) + "day";
                    }
                    else if (totalTimeInMiliSec >= 2678400000 && totalTimeInMiliSec < 31536000000) {
                        time = totalTimeInMiliSec / 2678400000;
                        this.recentNotificationList[i].TimesAgo = Math.floor(time) + "month";
                    } else if (totalTimeInMiliSec >= 31536000000) {
                        time = totalTimeInMiliSec / 31536000000;
                        this.recentNotificationList[i].TimesAgo = Math.floor(time) + "yr";
                    }
                }
            }

        });


    }

    //DONE
    getClubList() {
        this.fb.getAll("/Coach/Type" + this.coachType + "/" + this.parentClubKey + "/" + this.coachKey + "/Club/").subscribe((data) => {
            this.clubs = data;
            if (this.clubs.length != 0) {
                this.selectedClub = this.clubs[0].$key;

                this.getMemberList();
                this.getDeviceToken();
                this.getSessionList();
                //});
            }
        });
    }



    getSessionList() {
        this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.coachKey + "/Group/").subscribe((data) => {
            //  this.numberOfPeopleToSend = 0;
            this.sessionList = [];
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].IsActive) {
                        this.sessionList.push(data[i]);
                    }
                }
            }
        });
    }
    getMemberList() {
        this.fb.getAll("/Member/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.memberList = data;
            this.numberOfPeopleToSend = data.length;
        });
    }
    getDeviceToken() {
        this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.MemberListsForDeviceToken = data;
        });
    }


    onChangeOfClub() {
        // this.numberOfPeopleToSend = 0;
        this.selectedActivityType = "";
        this.selectedCoach = "";
        this.types = [];
        this.coachs = [];
        this.session = [];
        this.sessionList = [];
        this.selectedSession = "";
        this.MemberListsForDeviceToken = [];

        // this.getMemberList();
        // this.getDeviceToken();
        this.getMemberList();
        this.getDeviceToken();
        this.getSessionList();
    }


    // onChangeSession() {
    //     this.currentSessionDetails = {};
    //     this.currentSessionMembers = [];
    //     //this.numberOfPeopleToSend = 0;
    //     for (let i = 0; i < this.sessionList.length; i++) {
    //         if (this.sessionList[i].$key == this.selectedSession) {
    //             this.currentSessionDetails = this.sessionList[i];
    //             this.currentSessionMembers = this.convertFbObjectToArray(this.sessionList[i].Member);
    //             this.numberOfPeopleToSend = this.currentSessionMembers.length;
    //         }
    //     }

    // }
    onChangeSession() {
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
        // for (let i = 0; i < sessionMembers.length; i++) {
        //     if (sessionMembers[i].IsActive) {
        //         this.currentSessionMembers.push(sessionMembers[i]);
        //     }
        // }
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
                        this.currentSessionMembers.push({ Key: sessionMembers[i].ParentKey });
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



            if (this.selectedSession == "" || this.selectedSession == undefined || this.selectedSession == null || this.selectedSession == "select") {
                let storeNotificationObj = notificationDetailsObj;
                let pc = { CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread" };
                pc.SendBy = this.parentClubKey;
                pc.sendByRole = "Coach";
                pc.Purpose = "Session";
                pc.CreatedTime = new Date().toString();
                pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                pc.Message = message;
                this.fb.saveReturningKey("Notification/Coach/" + this.parentClubKey + "/" + this.coachKey + "/Session/ComposeNotification/", pc);

                for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
                    storeNotificationObj.SendTo = this.memberList[memberIndex].$key;
                    storeNotificationObj.SendBy = this.parentClubKey;
                    storeNotificationObj.sendByRole = "Coach";
                    storeNotificationObj.Purpose = "Session";

                    storeNotificationObj.CreatedTime = new Date().toString();
                    storeNotificationObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                    storeNotificationObj.Message = message;
                    this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.memberList[memberIndex].$key + "/Session/Notification/", notificationDetailsObj);
                }



                for (let sendtoindex = 0; sendtoindex < this.MemberListsForDeviceToken.length; sendtoindex++) {
                    let differentLoginDeviceTokens = this.commonService.convertFbObjectToArray(this.MemberListsForDeviceToken[sendtoindex].Token);
                    for (let innerIndex = 0; innerIndex < differentLoginDeviceTokens.length; innerIndex++) {
                        notificationDetailsObj.SendTo = this.MemberListsForDeviceToken[sendtoindex].$key;
                        notificationDetailsObj.SendBy = this.selectedClub;
                        notificationDetailsObj.sendByRole = "Coach";
                        notificationDetailsObj.Purpose = "Session";
                        notificationDetailsObj.CreatedTime = new Date().toString();
                        notificationDetailsObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                        notificationDetailsObj.Message = message;
                        let regToken = differentLoginDeviceTokens[innerIndex].DeviceToken;
                        // let data = { to: '', notification: { body: '', title: '' } };

                        let data = {
                            to: '',
                            priority:"high",
                            notification: {
                              body: '',
                              title: '',
                              sound: "default",
                            },
                            data: {
                              param: notificationDetailsObj.Message.toString(),
                            },
                          };





                        data.to = regToken;
                        data.notification = { body: '', title: '',
                        sound: "default", };
                        data.notification.title = "";
                        data.notification.body = notificationDetailsObj.Message;
                        let headers = new Headers({
                            'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
                            'Content-Type': 'application/json'
                        });
                        let options = new RequestOptions({ headers: headers });

                        this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
                            this.notificationObj.Message = '';
                        }, err => {
                            console.log("ERROR!: ", err);
                        }
                        );
                    }

                }
            }

            else {
                let pc = { CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
                //let pc = { CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread" };
                pc.SendBy = this.parentClubKey;
                pc.sendByRole = "Coach";
                pc.Purpose = "Session";
                pc.SessionName = this.currentSessionDetails.SessionName;
                pc.CreatedTime = new Date().toString();
                pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                pc.Message = message;
                this.fb.saveReturningKey("Notification/Coach/" + this.parentClubKey + "/" + this.coachKey + "/Session/ComposeNotification/", pc);

                for (let memberIndex = 0; memberIndex < this.currentSessionMembers.length; memberIndex++) {
                    this.notificationObjForSesion.SendTo = this.currentSessionMembers[memberIndex].Key;
                    this.notificationObjForSesion.SendBy = this.parentClubKey;
                    this.notificationObjForSesion.sendByRole = "Coach";
                    this.notificationObjForSesion.Purpose = "Session";
                    this.notificationObjForSesion.SessionName = this.currentSessionDetails.SessionName;
                    this.notificationObjForSesion.CreatedTime = new Date().toString();
                    this.notificationObjForSesion.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                    this.notificationObjForSesion.Message = message;
                    this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.currentSessionMembers[memberIndex].Key + "/Session/Notification/", this.notificationObjForSesion);
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

                for (let sendtoindex = 0; sendtoindex < sendTo.length; sendtoindex++) {
                    let differentLoginDeviceTokens = this.commonService.convertFbObjectToArray(sendTo[sendtoindex].Token);
                    for (let innerIndex = 0; innerIndex < differentLoginDeviceTokens.length; innerIndex++) {
                        let regToken = differentLoginDeviceTokens[innerIndex].DeviceToken;
                        // let data = { to: '', notification: { body: '', title: '' } };
                        let data = {
                            to: '',
                            priority:"high",
                            notification: {
                              body: '',
                              title: '',
                              sound: "default",
                            },
                            data: {
                              param: this.notificationObjForSesion.Message.toString(),
                            },
                          };




                        data.to = regToken;
                        data.notification = { body: '', title: '' ,sound: "default", };
                        data.notification.title = "";
                        data.notification.body = this.notificationObjForSesion.Message;
                        let headers = new Headers({
                            'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
                            'Content-Type': 'application/json'
                        });
                        let options = new RequestOptions({ headers: headers });
                        this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
                            this.notificationObj.Message = '';
                        }, err => {
                            console.log("ERROR!: ", err);
                        }
                        );
                    }

                }
            }
            this.navCtrl.pop();
            message = "";
            this.notificationObj.Message = "";
            let m = "Notification sent successfully";
            this.showToast(m);

        } catch (ex) {
            this.loading.dismiss().catch(() => { });
        }

    }

    showToast(m: string) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: 5000,
            position: 'bottom'
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


    notificationTabClick() {


    }




}