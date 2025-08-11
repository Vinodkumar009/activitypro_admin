import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
//import { PopoverPage } from '../../popover/popover';
//import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
//import { Type2AddActivityFeesList } from './addactivityfees';
//import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';


@IonicPage()
@Component({
    selector: 'activityfeeslist-page',
    templateUrl: 'activityfeeslist.html'
})

export class Type2ActivityFeesList {
    themeType: number;
    parentClubKey: string;
    allClub: any;
    selectedClub: any;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        WebIcon:string;
        MobCloudImage: string; 
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number}>;
    activityList = [];
    activityfolder = [];
    selectedActivity = "";
    clubArrList = [];
    allClubFromParentClub = [];
    orgClubArr = [];
    allActivityFeesdata = [];
    specificActivityFeesdata = [];
    constructor(public commonService:CommonService,public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getActivityList();
                }
        })
    }

    //   getSchoolLists() {
    //     this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
    //       this.schools = data;

    //     });

    //   }

    goTo(obj) {







        console.log(obj);

        this.navCtrl.push(obj.component);
    }
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });
    }
    goToAddActivityFees() {
        this.navCtrl.push('Type2AddActivityFeesList');
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot('Dashboard');
    }

    getActivityList() {
        this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
            if (data.length > 0) {
                this.activityfolder = data;
                this.activityList = [];
                for (let j = 0; j < data.length; j++) {
                    let ActivityList = this.commonService.convertFbObjectToArray(data[j]);
                    for (let k = 0; k < ActivityList.length; k++) {
                        let flag = true;
                        for (let i = 0; i < this.activityList.length; i++) {
                            if (ActivityList[k].IsEnable) {
                                if (ActivityList[k].Key == this.activityList[i].Key) {
                                    flag = false;
                                    break;
                                }
                            }
                        }
                        if (flag) {
                            this.activityList.push(ActivityList[k]);
                            this.selectedActivity = this.activityList[0].Key;
                            flag = false;
                        }
                    }

                }
            }
            console.log(this.activityList);
            this.getClubList();
        });

    }

    getClubList() {
        this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
            if (data.length > 0) {
                this.clubArrList = [];
                this.allClub = data;
                if (this.activityList.length > 0) {
                    let flag = false;
                    for (let i = 0; i < this.allClub.length; i++) {
                        let clubList = this.commonService.convertFbObjectToArray(this.allClub[i]);
                        for (let j = 0; j < clubList.length; j++) {
                            //for (let k = 0; k < this.activityList.length; k++) {
                            //if (clubList[j].Key == this.activityList[k].Key) {
                            if (clubList[j].Key == this.selectedActivity) {
                                flag = true;
                                break;
                            }
                            //}
                        }
                        if (flag) {
                            this.clubArrList.push(this.allClub[i]);
                        }
                        flag = false;
                    }
                }
            }
            console.log(this.allClub);
            console.log(this.clubArrList);
            this.compareWithClub();

        })
    }

    compareWithClub() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data1) => {
            if (data1.length > 0) {
                this.allClubFromParentClub = data1;
                this.orgClubArr = [];
                if (this.clubArrList.length > 0) {
                    for (let clubIndex = 0; clubIndex < this.clubArrList.length; clubIndex++) {
                        for (let orgClubIndex = 0; orgClubIndex < this.allClubFromParentClub.length; orgClubIndex++) {
                            if (this.clubArrList[clubIndex].$key == this.allClubFromParentClub[orgClubIndex].$key) {
                                this.orgClubArr.push(this.allClubFromParentClub[orgClubIndex]);
                            }
                        }
                    }
                }
            }
            console.log(this.allClubFromParentClub);
            console.log(this.orgClubArr);
            this.selectedClub = this.orgClubArr[0].$key;
            this.getActivityFeesList();
        })
    }


    onChangeActivity() {
        this.getClubList();
    }

    getActivityFeesList() {
        this.specificActivityFeesdata = [];
        this.fb.getAll("/ActivityFees/Type2/").subscribe((data) => {
            if (data.length > 0) {
                this.allActivityFeesdata = data;
                console.log(this.allActivityFeesdata);
                if (this.selectedClub == "All") {
                    if (this.allActivityFeesdata.length > 0) {
                        for (let i = 0; i < this.allActivityFeesdata.length; i++) {
                            if (this.selectedActivity == this.allActivityFeesdata[i].ActivityKey) {
                                this.specificActivityFeesdata.push(this.allActivityFeesdata[i]);
                            }
                        }
                        console.log(this.specificActivityFeesdata);
                        if(this.specificActivityFeesdata.length > 0 && this.activityList.length > 0){
                            for(let j = 0; j < this.activityList.length; j++){
                                for(let k=0; k<this.specificActivityFeesdata.length; k++){
                                    if(this.specificActivityFeesdata[k].ActivityKey == this.activityList[j].Key){
                                        this.specificActivityFeesdata[k].ActivityName = this.activityList[j].ActivityName;
                                    }
                                }
                            }
                        }

                        if(this.specificActivityFeesdata.length > 0 && this.allClubFromParentClub.length > 0){
                            for(let l = 0; l < this.allClubFromParentClub.length; l++){
                                for(let m=0; m<this.specificActivityFeesdata.length; m++){
                                    if(this.specificActivityFeesdata[m].ClubKey == this.allClubFromParentClub[l].$key){
                                        this.specificActivityFeesdata[m].ClubName = this.allClubFromParentClub[l].ClubName;
                                    }
                                }
                            }
                        }
                        console.log(this.specificActivityFeesdata);
                    }
                }
                else {
                    if (this.allActivityFeesdata.length > 0) {
                        for (let i = 0; i < this.allActivityFeesdata.length; i++) {
                            if (this.selectedActivity == this.allActivityFeesdata[i].ActivityKey && this.selectedClub == this.allActivityFeesdata[i].ClubKey) {
                                this.specificActivityFeesdata.push(this.allActivityFeesdata[i]);
                            }
                        }
                        console.log(this.specificActivityFeesdata);
                        if(this.specificActivityFeesdata.length > 0 && this.activityList.length > 0){
                            for(let j = 0; j < this.activityList.length; j++){
                                for(let k=0; k<this.specificActivityFeesdata.length; k++){
                                    if(this.specificActivityFeesdata[k].ActivityKey == this.activityList[j].Key){
                                        this.specificActivityFeesdata[k].ActivityName = this.activityList[j].ActivityName;
                                    }
                                }
                            }
                        }

                        if(this.specificActivityFeesdata.length > 0 && this.allClubFromParentClub.length > 0){
                            for(let l = 0; l < this.allClubFromParentClub.length; l++){
                                for(let m=0; m<this.specificActivityFeesdata.length; m++){
                                    if(this.specificActivityFeesdata[m].ClubKey == this.allClubFromParentClub[l].$key){
                                        this.specificActivityFeesdata[m].ClubName = this.allClubFromParentClub[l].ClubName;
                                    }
                                }
                            }
                        }
                        console.log(this.specificActivityFeesdata);
                    }
                }
            }
        })


    }





}
