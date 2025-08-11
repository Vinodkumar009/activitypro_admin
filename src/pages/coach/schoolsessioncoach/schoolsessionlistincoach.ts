import { Component } from '@angular/core';
import { LoadingController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';

import { IonicPage, ActionSheetController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'schoolsessionlistincoach-page',
    templateUrl: 'schoolsessionlistincoach.html'
})
export class CoachSchoolSessionList {
    themeType: number;
    isAndroid: boolean = false;
    myIndex: number = -1;
    parentClubKey: any;
    loading: any;
    schoolSessions = [];
    schools = [];
    selectedSchool = "";
   
    sessionMemberDetails = [];
    sessionMemberLength = [];
    MemberListsForDeviceToken = [];
    coachKey = '';
    coachType = "";
    constructor(public actionSheetCtrl: ActionSheetController, public commonService: CommonService, public loadingCtrl: LoadingController, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, private platform: Platform, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.isAndroid = this.platform.is('android');


        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.coachKey = val.UserInfo[0].CoachKey;
                this.coachType = val.Type;

                this.getSchools();
            }
        })
    }
    ionViewDidEnter() {
        this.myIndex = -1;
    }

    goToDashBoard() {
        this.navCtrl.setRoot("Dashboard");
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    gotoCreateSchoolSession() {
        this.navCtrl.push("Type2CreateSchoolSession");
    }



    getSchools() {
        this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
            this.schools = [];
            data.forEach(element => {
                if (element.IsActive) {
                    this.schools.push(element);
                    this.selectedSchool = this.schools[0].$key;
                }
            });
            this.getSchoolSessionlist();
        });
    }

    onChangeOfSchool() {
        this.schoolSessions = [];
      
        this.fb.getAllWithQuery("SchoolSession/" + this.parentClubKey + "/", { orderByChild: 'SchoolKey', equalTo: this.selectedSchool}).subscribe((data) => {
            this.schoolSessions = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].CoachKey === this.coachKey) {
                    if(data[i].IsActive){
                        const today = new Date();
                        const year = today.getFullYear();
                        const monthNumber = today.getMonth() + 1; // Month is zero-based, so add 1
                        const month = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
                        const day = today.getDate() < 10 ? `0${today.getDate()}` : `${today.getDate()}`;
                        const todayDate = `${year}-${month}-${day}`;
                        if (((new Date(data[i].EndDate).getTime()) >= (new Date(todayDate).getTime())) && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
                            this.schoolSessions.push(data[i]);
                        }
                    }
                }
                
            }
            
            this.sessionMemberLength = [];
            for (let i = 0; i < this.schoolSessions.length; i++) {
                if (this.schoolSessions[i].Member != undefined) {
                    let j = 0;
                    let activeMemberLength = 0;
                    let members = [];
                    members = Array.isArray(this.schoolSessions[i].Member) ?this.schoolSessions[i].Member:this.commonService.convertFbObjectToArray(this.schoolSessions[i].Member);
                    for (j = 0; j < members.length; j++) {
                        if (members[j].IsActive) {
                            activeMemberLength++;
                        }
                    }
                    this.sessionMemberLength.push(activeMemberLength);
                } else {
                    this.sessionMemberLength.push(0);
                }
            }
        });
    }

    getSchoolSessionlist() {
     
        this.fb.getAllWithQuery("SchoolSession/" + this.parentClubKey + "/", { orderByChild: 'SchoolKey', equalTo: this.selectedSchool}).subscribe((data) => {
            this.schoolSessions = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].CoachKey === this.coachKey) {
                    if(data[i].IsActive){
                        let mm = ((new Date(this.commonService.getTodaysDate()).getMonth()) + 1);
                        let month = mm < 10 ? "0" + mm : mm.toString();
                        let todayDate = (new Date(this.commonService.getTodaysDate()).getFullYear()) + "-" + month + "-" + (new Date(this.commonService.getTodaysDate()).getDate());
                        if (((new Date(data[i].EndDate).getTime()) >= (new Date(todayDate).getTime())) && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
                            this.schoolSessions.push(data[i]);
                        }
                    }
                }
            }
            // this.schoolSessions = data;
            for (let i = 0; i < this.schoolSessions.length; i++) {
                if (this.schoolSessions[i].Member != undefined) {
                    let j = 0;
                    let activeMemberLength = 0;
                    let members = [];
                    members = this.commonService.convertFbObjectToArray(this.schoolSessions[i].Member);
                    for (j = 0; j < members.length; j++) {
                        if (members[j].IsActive) {
                            activeMemberLength++;
                        }
                    }
                    this.sessionMemberLength.push(activeMemberLength);
                } else {
                    this.sessionMemberLength.push(0);
                }
            }

        });
    }


    // doInfinite(infiniteScroll) {
    //     this.limitToFirst += 12;
    //     setTimeout(() => {
    //         this.fb.getAllWithQuery("SchoolSession/" + this.parentClubKey + "/", { orderByChild: 'SchoolKey', equalTo: this.selectedSchool, limitToFirst: this.limitToFirst }).subscribe((data) => {

    //             this.schoolSessions = [];
    //             for (let i = 0; i < data.length; i++) {
    //                 if (data[i].CoachKey === this.coachKey) {
    //                     if(data[i].IsActive){
    //                         let mm = ((new Date(this.commonService.getTodaysDate()).getMonth()) + 1);
    //                         let month = mm < 10 ? "0" + mm : mm.toString();
    //                         let todayDate = (new Date(this.commonService.getTodaysDate()).getFullYear()) + "-" + month + "-" + (new Date(this.commonService.getTodaysDate()).getDate());
    //                         if (((new Date(data[i].EndDate).getTime()) >= (new Date(todayDate).getTime())) && (data[i].IsEnable == true || data[i].IsEnable == undefined)) {
    //                             this.schoolSessions.push(data[i]);
    //                         }
    //                     }
    //                 }
    //             }
    //             this.sessionMemberLength = [];
    //             for (let i = 0; i < this.schoolSessions.length; i++) {
    //                 if (this.schoolSessions[i].Member != undefined) {
    //                     let j = 0;
    //                     let activeMemberLength = 0;
    //                     let members = [];
    //                     members = this.commonService.convertFbObjectToArray(this.schoolSessions[i].Member);
    //                     for (j = 0; j < members.length; j++) {
    //                         if (members[j].IsActive) {
    //                             activeMemberLength++;
    //                         }
    //                     }
    //                     this.sessionMemberLength.push(activeMemberLength);
    //                 } else {
    //                     this.sessionMemberLength.push(0);
    //                 }
    //             }
    //         });
    //         infiniteScroll.complete();
    //     }, 100);
    // }

    addMemberToSession(session) {
        this.navCtrl.push('Type2AddMemberSchoolSession', { SchoolSession: session });
    }

    memberDetailsForGroup(index) {
        //console.clear();
        if (this.schoolSessions[index].Member != undefined) {
            this.sessionMemberDetails = this.commonService.convertFbObjectToArray(this.schoolSessions[index].Member);
            for (let i = 0; i < this.sessionMemberDetails.length; i++) {
                let age = (new Date().getFullYear() - new Date(this.sessionMemberDetails[i].DOB).getFullYear());
                if (isNaN(age)) {
                    this.sessionMemberDetails[i].Age = "N.A";
                } else {
                    this.sessionMemberDetails[i].Age = age;
                }
            }
            this.myIndex = (index == this.myIndex) ? -1 : index;
        }
    }

  
    

    presentActionSheet(session) {
        this.myIndex = -1;
        let actionSheet
        if (this.platform.is('android')) {
            actionSheet = this.actionSheetCtrl.create({
                
                buttons: [
                    {
                        text: 'Add Member',
                        icon: 'people',
                        handler: () => {
                            this.addMemberToSession(session)
                        }
                    },
                    // {
                    //     text: 'Edit',
                    //     icon: 'create',
                    //     handler: () => {
                    //         this.editSession(session)
                    //     }
                    // },
                    {
                        text: 'Notify',
                        icon: 'md-notifications',
                        handler: () => {
                            this.notifyMeber(session)
                        }
                    }
                    // ,
                    // {
                    //     text: 'Email',
                    //     icon: 'mail',
                    //     handler: () => {
                    //         // this.notifyMeber(session)
                    //     }
                    // }
                    ,
                    {
                        text: 'Cancel',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        } else {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Add Member',
                        handler: () => {
                            this.addMemberToSession(session)
                        }
                    },
                    // {
                    //     text: 'Edit',
                    //     handler: () => {
                    //          this.editSession(session)
                    //     }
                    // },
                    {
                        text: 'Notify',
                        handler: () => {
                            this.notifyMeber(session)
                        }
                    }
                    ,
                    // {
                    //     text: 'Email',
                    //     handler: () => {
                            
                    //     }
                    // },
                    {
                        text: 'Cancel',
                        // icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        }



    }
    notifyMeber(session) {

        let isPresent = false;
        let sendTo = [];
        if (session.Member != undefined) {
            if (session.Member.length != 0) {
                let a = [];
                let mlist = [];
                a = this.commonService.convertFbObjectToArray(session.Member);
                for (let i = 0; i < a.length; i++) {
                    if (a[i].IsActive) {
                        if (a[i].ParentKey != "") {
                            isPresent = false;
                            for (let j = 0; j < mlist.length; j++) {
                                if (mlist[j].Key == a[i].ParentKey) {
                                    isPresent = true;
                                    break;
                                }
                            }
                            if (!isPresent) {
                                mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey });
                            }
                        } else {
                            mlist.push(a[i]);
                        }


                    }
                }
                for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
                    for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
                        if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
                            sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
                        }
                    }
                }


                //we have reused the type2 session notification page
                //dont be confuse
                this.navCtrl.push("Type2SchoolSessionNotifications", { UsersDeviceToken: sendTo, SessionDetails: session, MemberList: mlist });
            }
        }

    }

    editSession(session) {
        //we have reused the type2 Edit SchoolSession Details  page
        //dont be confuse
        this.navCtrl.push('Type2EditSchoolSessionDetails', { SchoolSession: session });
    }
    presentActionSheetOption(sessioninfo) {
        const actionSheet = this.actionSheetCtrl.create({
          buttons: [
         {
              text: 'Attendance',
              handler: () => {
               this.navCtrl.push('SchoolesessiondetailsforattendancePage',{
                sessionOInfo:sessioninfo,
                type:'coach'
               })
              }
            },{
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            }
          ]
        });
        actionSheet.present();
      }
}

