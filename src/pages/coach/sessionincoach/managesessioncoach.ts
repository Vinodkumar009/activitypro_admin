//import {Type2SessionNotification} from './sessionnotification';
//import { Member } from './../../member/member';
// import { Type2SessionDetails } from './sessiondetails';
// import { Type2EditMembershipSession } from './editmembershipsession';
import { Component } from '@angular/core';
import { ActionSheetController, LoadingController, NavController, Platform, Events } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Type2Session } from './session';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../../services/common.service';
import { IonicPage, AlertController, ToastController } from 'ionic-angular';



@IonicPage()
@Component({
    selector: 'managesessioncoach-page',
    templateUrl: 'managesessioncoach.html'
})

export class CoachManageSession {
    themeType: number;
    // venue: any = 's';
    // coach: any = 'a';

    isAndroid: boolean = false;
    // musicAlertOpts: { title: string, subTitle: string };
    //show:boolean=false;
    myIndex: number = -1;
    currencyDetails = {
        CurrencySymbol: "",
    };

    //variable 
    sessionMemberLength = [];
    paidMemberLength = [];
    sessionStrength: string = "Group";
    selectedTabValue: string = "Group";
    parentClubKey: any;
    coachList: any;
    clubs: any;
    selectedClub: any;
    coaches: any=[];
    selectedCoach: any;
    sessionObj = [];
    sessionMemberDetails: Array<any> = [];

    isShowMessage1 = false;
    isShowMessage2 = false;
    isShowMessage3 = false;
    isShowMessage4 = false;
    //for one to one session 
    onetooneSessionMember = [];
    clubsForOneToOne: any;
    selectedClubForOneToOne: any;
    coachesForOneToOne: any;
    selectedCoachForOneToOne: any;
    sessionObjForOneToOne = [];



    //for one to one session 
    familySessionMember = [];
    clubsForFamily: any;
    selectedClubForFamily: any;
    coachesForFamily: any;
    selectedCoachForFamily: any;
    sessionObjForFamily = [];
    familyIndex: number = -1;
    familyMemberList = [];

    MemberListsForDeviceToken = [];

    loading: any;
    sessionType:boolean = false;
    activeSessionList = [];
    pastSessionList = [];



    past = [];
    pre = [];
    coachType:any = "";
    
    LangObj: any = {};//by vinod
    iscoach_see_revenue:boolean = false;
    constructor(public events:Events,public commonService: CommonService, public actionSheetCtrl: ActionSheetController, public commonservice: CommonService, private toastCtrl: ToastController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public platform: Platform, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');


        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.selectedCoach = val.UserInfo[0].CoachKey;
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.coachType = val.Type;
                this.loading = this.loadingCtrl.create({
                    content: 'Please wait...'
                });
                this.loading.present().then(() => {

                    this.getClubList();
                });

            }
        });

        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        }).catch(error => {
        });



    }

    getLanguage() {
        this.storage.get("language").then((res) => {
          console.log(res["data"]);
          this.LangObj = res.data;
        })
      }
      ionViewDidLoad(){
        this.getLanguage();
        this.events.subscribe('language', (res) => {
          this.getLanguage();
        });
      }
    goToDashBoard() {
        this.navCtrl.setRoot("Dashboard");
    }







    ///
    //           group tab  starts here
    ///
    ////
    ionViewWillEnter() {
        this.myIndex = -1;
        this.iscoach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
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
                this.navCtrl.push("Type2NotificationSession", { UsersDeviceToken: sendTo, SessionDetails: session, MemberList: mlist });
            }
        }

    }


    //unusable code 
    //Need to remove this speghate of code
    //
    sentAnEmailToMember(session) {
        let isPresent = false;
        let sendTo = [];
        if (session.Member != undefined) {
            if (session.Member.length != 0) {
                let a = [];
                let mlist = [];
                a = this.commonService.convertFbObjectToArray(session.Member);
                for (let i = 0; i < a.length; i++) {
                    if (a[i].IsActive) {
                        a[i].SignedUpType = a[i].ClubKey == "" ? 2 : 1;
                        if (a[i].ParentKey != "") {
                            isPresent = false;
                            for (let j = 0; j < mlist.length; j++) {
                                if (mlist[j].Key == a[i].ParentKey) {
                                    isPresent = true;
                                    break;
                                }
                            }
                            if (!isPresent) {
                                // mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey, EmailID: a[i].EmailID });
                                mlist.push({
                                    Key: a[i].ParentKey,
                                    ClubKey: a[i].ClubKey,
                                    IsChild: a[i].IsChild,
                                    SignedUpType: a[i].SignedUpType,
                                    FirstName: a[i].FirstName,
                                    LastName: a[i].LastName,
                                    EmailID: a[i].EmailID,
                                    ParentClubKey: a[i].ParentClubKey,
                                    ParentKey: a[i].ParentKey
                                });
                            }
                        } else {
                            mlist.push(a[i]);
                        }


                    }
                }
                // for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
                //     for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
                //         if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
                //             sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
                //         }
                //     }
                // }
                // console.clear();
                //  console.log(mlist);
                if (mlist.length > 0) {
                    this.navCtrl.push("MailToMemberByAdminPage", { MemberList: mlist, SessionDetails: session, NavigateFrom: "Session" });
                } else {
                    this.showToast("No member in current session.");
                }
            }
        }

    }

    //----------------------
    //

    onChangeOfClub() {
        this.isShowMessage1 = false;
        this.isShowMessage2 = false;
        this.isShowMessage3 = false;
        this.isShowMessage4 = false;
        this.sessionObj = [];
        this.coaches = [];
        this.getSessionLists();
    }
    onChangeOfCoach() {
        this.isShowMessage1 = false;
        this.isShowMessage2 = false;
        this.isShowMessage3 = false;
        this.isShowMessage4 = false;
        this.sessionObj = [];
        this.getSessionLists();
    }


    //
    //get club list in group segment 
    //
    //calling from constructor
    //calling from sessionTabClick method click
    //


    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            this.MemberListsForDeviceToken = [];
            this.clubs = data;
            if (this.clubs.length != 0) {
                this.selectedClub = this.clubs[0].$key;
                for (let i = 0; i < data.length; i++) {
                    this.fb.getAll("/DeviceToken/Member/" + this.parentClubKey + "/" + this.clubs[i].$key + "/").subscribe((token) => {

                        for (let i = 0; i < token.length; i++) {
                            this.MemberListsForDeviceToken.push(token[i]);
                        }
                    });
                }

                this.getSessionLists()
            }
        });
    }

    //get coachlist accoridng to club list 
    //calling from getClubList method


    getSessionLists() {
        let monthArray = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedCoach + "/Group/").subscribe((data) => {
            this.sessionObj = [];
            this.sessionMemberLength = [];
            this.paidMemberLength = [];
            let past = [];
            let pre = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].IsActive) {
                    if (data[i].IsEnable == undefined || data[i].IsEnable == true) {
                        // this.showToast(this.commonService.getTodaysDate().toString());
                        if(!this.sessionType){
                            if ((new Date(data[i].EndDate).getTime()) > (new Date(this.commonService.getTodaysDate()).getTime())) {
                                let day = (data[i].StartDate).split("-");
                                data[i]["Day"] = day[2];
                                data[i]["Month"] = monthArray[(parseInt(day[1]) - 1)];
                                this.sessionObj.push(data[i]);
    
                            }
                        }
                        
                    }
                }
            }
            for (let i = 0; i < data.length; i++) {
                if (data[i].IsActive) {
                    if (data[i].IsEnable == undefined || data[i].IsEnable == true) {
                        // this.showToast(this.commonService.getTodaysDate().toString());
                        if(this.sessionType){
                            if ((new Date(data[i].EndDate).getTime()) <= (new Date(this.commonService.getTodaysDate()).getTime())) {
                                let day = (data[i].StartDate).split("-");
                                data[i]["Day"] = day[2];
                                data[i]["Month"] = monthArray[(parseInt(day[1]) - 1)];
                                this.sessionObj.push(data[i]);
    
                            }
                        }
                        
                    }
                }
            }

            this.sessionObj = this.commonservice.sortedObjectsByDays(this.sessionObj);


            for (let loop = 0; loop < this.sessionObj.length; loop++) {
                if (this.sessionObj[loop].Activity != undefined) {
                    this.sessionObj[loop]["ActivitieDetails"] = "";
                    let activity = this.commonservice.convertFbObjectToArray(this.sessionObj[loop].Activity);
                    for (let activityIndex = 0; activityIndex < activity.length; activityIndex++) {
                        if (activityIndex == 0 || activityIndex == activity.length) {
                            this.sessionObj[loop]["ActivitieDetails"] += activity[activityIndex].ActivityName;
                            let activitySubCategory = [];
                            //activitySubCategory= this.commonservice.convertFbObjectToArray()
                            if (activity[activityIndex].ActivityCategory != undefined) {
                                activitySubCategory = this.commonservice.convertFbObjectToArray(activity[activityIndex].ActivityCategory);
                                this.sessionObj[loop]["ActivitieDetails"] += " / " + activitySubCategory[0].ActivityCategoryName;
                            }

                        } else {
                            this.sessionObj[loop]["ActivitieDetails"] += activity[activityIndex].ActivityName + ", ";
                            let activitySubCategory = [];
                            if (activity[activityIndex].ActivityCategory != undefined) {
                                activitySubCategory = this.commonservice.convertFbObjectToArray(activity[activityIndex].ActivityCategory);
                                this.sessionObj[loop]["ActivitieDetails"] += " / " + activitySubCategory[0].ActivityCategoryName;
                            }

                        }
                    }
                }
                if (this.sessionObj[loop].Member != undefined) {
                    let j = 0;
                    let activeMemberLength = 0;
                    let paidMmebercount = 0;
                    let members = [];
                    members = this.commonService.convertFbObjectToArray(this.sessionObj[loop].Member);
                    
                    for (j = 0; j < members.length; j++) {
                        if (members[j].IsActive) {
                            activeMemberLength++;
                            if ((members[j].AmountPayStatus != "Due") && (members[j].AmountPayStatus != undefined)) {
                                paidMmebercount++;
                            }
                        }

                    }
                    this.sessionMemberLength.push(activeMemberLength);
                    this.paidMemberLength.push(paidMmebercount);
                } else {
                    this.sessionMemberLength.push(0);
                    this.paidMemberLength.push(0);
                }
            }

           
            if (this.sessionObj.length == 0) {
                this.isShowMessage1 = true;
            }
            //    this.showToast(this.sessionObj.length +" Sessions found");
            console.log(this.sessionObj);
            this.loading.dismiss().catch(() => { });
        });
    }

    editSession(sessionDetails) {
        // console.log(sessionDetails);
        this.navCtrl.push("Type2EditGroupSession", { SessionDetails: sessionDetails });
    }

    ///
    //           Group tab  Ends here
    ///
    ////





    ///
    //           1:1 tab  starts here
    ///
    ////






    //
    //get coach list and club list for one to one session
    //

    getClubListForOneToOne() {
        this.fb.getAll("/Club/Type2/" + this.parentClubKey).subscribe((data) => {
            this.clubsForOneToOne = data;
            if (this.clubsForOneToOne.length != 0) {
                this.selectedClubForOneToOne = this.clubs[0].$key;
                this.getCoachListsForOneToOne();
            }
        });
    }

    getCoachListsForOneToOne() {
        this.fb.getAll("/Coach/Type2/" + this.parentClubKey).subscribe((data) => {
            this.coachesForOneToOne = data;
            if (this.coachesForOneToOne.length != 0) {
                this.selectedCoachForOneToOne = this.coachesForOneToOne[0].$key;
                this.getSessionListsForOneToOne();
            }
        });
    }


    getSessionListsForOneToOne() {

        this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClubForOneToOne + "/" + this.selectedCoachForOneToOne + "/" + this.sessionStrength + "/").subscribe((data) => {
            this.sessionObjForOneToOne = data;
            if (this.sessionObjForOneToOne.length > 0) {
                this.onetooneSessionMember = [];
                for (let i = 0; i < this.sessionObjForOneToOne.length; i++) {
                    this.onetooneSessionMember.push(this.commonService.convertFbObjectToArray(this.sessionObjForOneToOne[i].Member));
                }
            }
            else {
                this.isShowMessage2 = true;
            }
        });

    }

    selectedType:boolean = true;
    changeType(val){
      this.selectedType = val;
      this.sessionType =  !val;
  
  }

    OnChangeClubOneToOne() {
        this.isShowMessage1 = false;
        this.isShowMessage2 = false;
        this.isShowMessage3 = false;
        this.sessionObjForOneToOne = [];
        this.getSessionListsForOneToOne();
        //console.log(this.sessionObjForOneToOne);
    }
    onChangeCoachOneToOne() {
        this.isShowMessage1 = false;
        this.isShowMessage2 = false;
        this.isShowMessage3 = false;
        this.sessionObjForOneToOne = [];
        this.getSessionListsForOneToOne();
        //console.log(this.sessionObjForOneToOne);
    }


    //  ----------   1:1 tab  ends here ---------------
    ///





    //  --------------  Family tab  starts here -----------------
    ///




    //
    //get coach list and club list for Family session
    //

    getClubListForFamily() {
        this.fb.getAll("/Club/Type2/" + this.parentClubKey).subscribe((data) => {
            this.clubsForFamily = data;
            // console.log(this.clubs);
            if (this.clubsForFamily.length != 0) {
                this.selectedClubForFamily = this.clubs[0].$key;
                this.getCoachListsForFamily();
            }
        });
    }

    getCoachListsForFamily() {
        this.fb.getAll("/Coach/Type2/" + this.parentClubKey).subscribe((data) => {
            this.coachesForFamily = data;
            if (this.coachesForFamily.length != 0) {
                this.selectedCoachForFamily = this.coachesForFamily[0].$key;
                this.getSessionListsForFamily();
            }
        });
    }


    getSessionListsForFamily() {

        this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClubForFamily + "/" + this.selectedCoachForFamily + "/" + this.sessionStrength + "/").subscribe((data) => {
            this.sessionObjForFamily = data;
            if (this.sessionObjForFamily.length > 0) {
                this.familySessionMember = [];
                for (let i = 0; i < this.sessionObjForFamily.length; i++) {
                    // console.clear();
                    // console.log(this.sessionObjForFamily);
                    this.familySessionMember.push(this.commonService.convertFbObjectToArray(this.sessionObjForFamily[i].Member));
                }
            }
            else {
                this.isShowMessage3 = true;
            }
        });

    }



    OnChangeClubFamily() {
        this.isShowMessage1 = false;
        this.isShowMessage2 = false;
        this.isShowMessage3 = false;
        this.sessionObjForFamily = [];
        this.getSessionListsForFamily();
        // console.log(this.sessionObjForOneToOne);
    }
    onChangeCoachFamily() {
        this.isShowMessage1 = false;
        this.isShowMessage2 = false;
        this.isShowMessage3 = false;
        this.sessionObjForFamily = [];
        this.getSessionListsForFamily();
        // console.log(this.sessionObjForOneToOne);
    }



    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }


    memberDetailsForGroup(index) {
        //console.clear();
        this.sessionMemberDetails = [];
        let listOfMembersInSession = this.commonService.convertFbObjectToArray(this.sessionObj[index].Member);

        for (let i = 0, j = 0; i < listOfMembersInSession.length; i++) {
            if (listOfMembersInSession[i].IsActive) {

                this.sessionMemberDetails.push(listOfMembersInSession[i]);
                let age = (new Date().getFullYear() - new Date(this.sessionMemberDetails[j].DOB).getFullYear());
                if (isNaN(age)) {
                    this.sessionMemberDetails[j].Age = "N.A";
                } else {
                    this.sessionMemberDetails[j].Age = age;
                }
                j++;
            }
        }
        // console.clear();
        // console.log(this.sessionMemberDetails);
        this.myIndex = (index == this.myIndex) ? -1 : index;
    }


    memberDetailsForFamily(index, sessionDetails) {
        this.familyMemberList = [];
        this.familyIndex = (index == this.familyIndex) ? -1 : index;
        let family = this.commonService.convertFbObjectToArray(sessionDetails.Member);

        // console.log("member list");
        this.fb.getAll("/Member/" + sessionDetails.ParentClubKey + "/" + sessionDetails.ClubKey + "/" + family[0].Key + "/FamilyMember/").subscribe((data) => {
            this.familyMemberList = data;
            // console.log(this.clubs);
            // if (data.length > 0) {
            //     this.selectedClubForFamily = this.clubs[0].$key;
            //     this.getCoachListsForFamily();
            // }

            // console.log(this.familyMemberList);
        });







    }
    // getFamilyMember() {

    // }




    gotoSession() {

        if (this.sessionStrength == "Group") {
            this.navCtrl.push("Type2Session", { sessionName: this.sessionStrength });
        }
        else if (this.sessionStrength == "OneToOne") {
            //this.navCtrl.push(Type2CreateOneToOneSession, { sessionName: this.sessionStrength });
        }
        else if (this.sessionStrength == "Family") {
            //this.navCtrl.push(Type2CreateFamilySession, { sessionName: this.sessionStrength });
        }
    }
    goToMonthlySession(){
        this.navCtrl.push("MonthlysessionPage");
    }


    sessionTabClick() {
        if (this.selectedTabValue != this.sessionStrength) {
            if (this.sessionStrength == "Group") {
                this.selectedTabValue = this.sessionStrength;
                this.getClubList();
            }
            else if (this.sessionStrength == "OneToOne") {
                this.selectedTabValue = this.sessionStrength;
                this.getClubListForOneToOne();
            }
            else if (this.sessionStrength == "Family") {
                this.selectedTabValue = this.sessionStrength;
                this.getClubListForFamily();
            }
        }

    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }


    sessionDetails(sessionDetailsForGroup) {
        this.navCtrl.push("Type2SessionDetails", { OldSessionDetails: sessionDetailsForGroup });
    }
    gotoCopySession() {
        this.navCtrl.push("CopySession");
    }


    removeSession(session) {

        let confirm = this.alertCtrl.create({
            title: 'Delete Session',
            message: 'Are you sure, You want to delete the session? ',
            buttons: [
                {
                    text: 'No',
                    handler: () => {
                        //console.log('Disagree clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.deleteSession(session);
                    }
                }
            ]
        });
        confirm.present();
    }
    showToast(m: string) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: 5000,
            position: 'bottom'
        });
        toast.present();
    }
    deleteSession(session) {
        let sMembers = [];
        this.fb.update(session.$key, "Session/" + session.ParentClubKey + "/" + session.ClubKey + "/" + session.CoachKey + "/" + session.SessionType + "/", { IsEnable: false });
        this.fb.update(session.$key, "/Coach/Type2/" + session.ParentClubKey + "/" + session.CoachKey + "/Session/", { IsEnable: false });

        if (session.Member != undefined) {
            sMembers = this.commonService.convertFbObjectToArray(session.Member);
        }
        for (let i = 0; i < sMembers.length; i++) {
            this.fb.update(session.$key, "Member/" + session.ParentClubKey + "/" + sMembers[i].ClubKey + "/" + sMembers[i].Key + "/Session/", { IsEnable: false });
        }

        let message = "Session removed successfully.";
        this.showToast(message);


    }



    goToSessionDetailsPage(session) {

        let clubName = "";
        for (let i = 0; i < this.clubs.length; i++) {
            if (this.selectedClub == this.clubs[i].$key) {
                clubName = this.clubs[i].ClubName;
                break;
            }
        }


        this.navCtrl.push("GroupsessiondetailsPage", { SessionDetails: session, "DeviceTokenOfMembers": this.MemberListsForDeviceToken, "ClubName": clubName });
        // this.presentActionSheet(session);
    }





}
