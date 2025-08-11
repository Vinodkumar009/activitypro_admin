// session creation for private and one to one

import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
//import { AddMemberOneToOneSession } from './addmemberonetoone';
// import { Type2AddMemberFamilySession } from './addfamilymember';
// import { AddMembershipSession } from './addmembershipsession';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'createfamilysession-page',
    templateUrl: 'createfamilysession.html'
})

export class Type2CreateFamilySession {

    themeType: number;

    //VARIABLE DECLARARTION
    sessionName: any;
    selectedClub: any;
    clubs: any;
    parentClubKey: any;
    types: any;
    coachs: any;
    selectedActivityType: any;
    selectedCoach: any;

    sessionDetails = {
        SessionName: '',
        StartDate: '',
        StartTime: '',
        Duration: '',
        SessionFee: '',
        Notes: '',
        RefferdBy: '',
        CoachKey: '',
        ClubKey: '',
        ParentClubKey: '',
        CoachName: '',
        SessionType: '',
        ActivityKey: '',
        ActivityCategoryKey: ''
    };
    returnKey: any; selectedCoachName: any;

    activityCategoryObj: any;
    selectActivityCategory: any;
    activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: false, IsEnable: false, IsExistActivityCategory: false };
    activityCategoryList = [];

    constructor(public commonService:CommonService,public navParams: NavParams, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
        this.sessionName = navParams.get('sessionName');

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.getClubList();
                // this.getActivityList();
                // this.getFinancialYearList();
                //this.getCoachList();
            }
        })

    }


    //called from getActivityList 
    //comming data according to the activity selected of a venue
    //showing coach accroding to the activity table
    //Done
    getCoachList() {

        this.coachs = [];
        if (this.activityObj.Coach != undefined) {
            this.coachs = this.commonService.convertFbObjectToArray(this.activityObj.Coach);
            this.selectedCoach = this.coachs[0].CoachKey;
            this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].MiddleName + " " + this.coachs[0].LastName;
        }
        else {
            this.selectedCoach = "";
            this.selectedCoachName = "";
            this.coachs = [];
        }
    }


cancelSessionCreation(){
    this.navCtrl.pop();
}


    // //
    // getCoachList() {
    //     this.fb.getAll("/Coach/Type2/" + this.parentClubKey).subscribe((data) => {
    //         this.coachs = data;
    //         if (this.coachs.length != 0) {
    //             this.selectedCoach = this.coachs[0].$key;
    //             this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].MiddleName + " " + this.coachs[0].LastName;

    //         }
    //     });
    // }


    //called from club memthod
    //Done
    getActivityList() {
        this.types = [];
        const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            activity$Obs.unsubscribe();
            this.types = data;
            if (this.types.length != 0) {
                this.selectedActivityType = this.types[0].$key;
                this.activityObj = this.types[0];
                this.getCoachList();
                if (this.activityObj.IsExistActivityCategory) {
                    this.getActivityCategoryList();
                }
            }
        });
    }




    //get activity category according to activity list
    //calling from getActivityList method
    //Done
    getActivityCategoryList() {
        this.activityCategoryList = [];
        if (this.activityObj.ActivityCategory != undefined) {
            this.activityCategoryList = this.commonService.convertFbObjectToArray(this.activityObj.ActivityCategory).filter(cat => cat.IsActive);
            this.selectActivityCategory = this.activityCategoryList[0].Key;
            this.activityCategoryObj = this.activityCategoryList[0];
        }
        else {
            this.selectedCoach = "";
            this.selectedCoachName = "";
            this.coachs = [];
        }
    }


    //get club list  according to parentClubKey
    //Done 
    getClubList() {
        const club$Obs = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            club$Obs.unsubscribe();
            this.clubs = data;
            if (this.clubs.length != 0) {
                this.selectedClub = this.clubs[0].$key;
                this.getActivityList();
            }
        });
    }

    // onChangeOfClub method calls when we changing venue
    //Done
    onChangeOfClub() {
        this.getActivityList();
    }

    //onchange of activity type this method will call
    //Done
    onChangeActivity() {
        this.types.forEach(element => {
            if (element.$key == this.selectedActivityType) {
                this.activityObj = element;
                this.getCoachList();
                if (this.activityObj.IsExistActivityCategory) {
                    this.getActivityCategoryList();
                }
            }
        });
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

    onChangeCoach() {
        this.coachs.forEach(element => {
            if (element.CoachKey == this.selectedCoach) {
                this.selectedCoachName = element.FirstName + " " + element.MiddleName + " " + element.LastName;
            }
            //this.selectedCoach = element.$key;
        });
    }


    onChangeActivityCategory() {
        this.activityCategoryList.forEach(element => {
            if (element.$key == this.selectActivityCategory) {
                this.activityCategoryObj = element;
            }
        });
    }

    

    createSession() {
        let obj = { ActivityCode: '', ActivityName: '', AliasName: '' };
        let activityCategoryDetails = { ActivityCategoryCode: '', ActivityCategoryName: '' };

        this.sessionDetails.ParentClubKey = this.parentClubKey;
        this.sessionDetails.ClubKey = this.selectedClub;
        this.sessionDetails.CoachKey = this.selectedCoach;
        this.sessionDetails.CoachName = this.selectedCoachName;
        this.sessionDetails.SessionType = "Family";
        this.sessionDetails.ActivityKey = this.activityObj.$key;
        this.sessionDetails.ActivityCategoryKey = this.selectActivityCategory;

        //Activity details
        obj.ActivityCode = this.activityObj.ActivityCode;
        obj.AliasName = this.activityObj.AliasName;
        obj.ActivityName = this.activityObj.ActivityName;

        //Activity category details
        if (this.activityObj.IsExistActivityCategory) {
            activityCategoryDetails.ActivityCategoryCode = this.activityCategoryObj.ActivityCategoryCode;
            activityCategoryDetails.ActivityCategoryName = this.activityCategoryObj.ActivityCategoryName;
        }



        //session create
        this.returnKey = this.fb.saveReturningKey("/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/", this.sessionDetails);

        //keeping session detials in coachfolder
        if (this.returnKey != undefined) {

            //keeping the activity data in session table
            this.fb.update(this.activityObj.$key, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.returnKey + "/Activity/", obj);

            //keeping the activity category in session/activity/activitycategory
            //if actvityvity category present 
            if (this.activityObj.IsExistActivityCategory) {
                this.fb.update(this.activityCategoryObj.Key, "/Session/" + this.parentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionName + "/" + this.returnKey + "/Activity/" + this.activityObj.$key + "/ActivityCategory/", activityCategoryDetails);
            }

            //keep the session in coach folder
            this.fb.update(this.returnKey, "/Coach/Type2/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.CoachKey + "/Session/", this.sessionDetails);
        }


        //Not needed to push term as pushed in private session booking

        //navigate to add member to session
        this.navCtrl.push("Type2AddMemberFamilySession", { ParentClubKey: this.sessionDetails.ParentClubKey, ClubKey: this.sessionDetails.ClubKey, CoachKey: this.sessionDetails.CoachKey, SessionKey: this.returnKey, SessionName: this.sessionDetails.SessionType, SessionDetials: this.sessionDetails });
        //  this.selectedTerm = undefined;
        this.sessionDetails = {
            SessionName: '',
            StartDate: '',
            StartTime: '',
            Duration: '',
            SessionFee: '',
            Notes: '',
            RefferdBy: '',
            CoachKey: '',
            ClubKey: '',
            ParentClubKey: '',
            CoachName: '',
            SessionType: '',
            ActivityKey: '',
            ActivityCategoryKey: ''
        };


    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}

