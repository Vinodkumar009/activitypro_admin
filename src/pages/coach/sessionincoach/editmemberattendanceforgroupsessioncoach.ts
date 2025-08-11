import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { ToastController, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'editmemberattendanceforgroupsessioncoach-page',
    templateUrl: 'editmemberattendanceforgroupsessioncoach.html'
})

export class CoachEditMemberAttendance {
    themeType: number;
    sessionDetails: any;
    choosenDate: any;
    selectedMembersForTheSession = [];
    isSelectAll = false;
    isUnselectAll = false;
    //returnKey: any;


    attendanceObj = {
        StartDate: '',
        EndDate: '',
        AttendanceStatus: ''
    }
    memberDetailsObj = {
        IsActive: false,
        ClubKey: '',
        DOB: '',
        EmailID: '',
        FirstName: '',
        Gender: '',
        IsChild: false,
        LastName: '',
        ParentClubKey: '',
        PhoneNumber: '',
        IsPresent: false
    }
    cancelReason = '';
    attendanceStatus = ""
    // constructor(private toastCtrl: ToastController, public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    //     this.themeType = sharedservice.getThemeType();
    //     this.sessionDetails = navParams.get('sessiondetails');
    //     this.choosenDate = navParams.get('ChoosenDate');
    //     let year = new Date(this.choosenDate.SessionOn).getFullYear();
    //     let month = new Date(this.choosenDate.SessionOn).getMonth() + 1;
    //     let date = new Date(this.choosenDate.SessionOn).getDate();
    //     let membersOnADate = this.convertFbObjectToArray(this.sessionDetails[year + "-" + month + "-" + date].Member);

    //     this.selectedMembersForTheSession = this.convertFbObjectToArray(this.sessionDetails.Member);

    //     for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
    //         for (let count = 0; count < membersOnADate.length; count++) {
    //             if (this.selectedMembersForTheSession[loop].Key == membersOnADate[count].Key) {
    //                 this.selectedMembersForTheSession[loop].isSelect = membersOnADate[count].IsPresent;
    //             }
    //         }
    //     }

    // }

   constructor(public commonService:CommonService,private toastCtrl: ToastController, public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
        this.sessionDetails = navParams.get('sessiondetails');
        this.choosenDate = navParams.get('ChoosenDate');
        let year = new Date(this.choosenDate.SessionOn).getFullYear();
        let month = new Date(this.choosenDate.SessionOn).getMonth() + 1;
        let date = new Date(this.choosenDate.SessionOn).getDate();
        let membersOnADate = this.commonService.convertFbObjectToArray(this.sessionDetails[year + "-" + month + "-" + date].Member);
        let att = this.sessionDetails[year + "-" + month + "-" + date];
        this.attendanceStatus = att.AttendanceStatus;
        if (att.AttendanceStatus == "Canceled") {
            this.cancelReason = att.CanceledReason;
        }
        this.selectedMembersForTheSession = this.commonService.convertFbObjectToArray(this.sessionDetails.Member);

        for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
            for (let count = 0; count < membersOnADate.length; count++) {
                if (this.selectedMembersForTheSession[loop].Key == membersOnADate[count].Key) {
                    this.selectedMembersForTheSession[loop].isSelect = membersOnADate[count].IsPresent;
                }
            }
        }

    }



    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }


   

    showToast(m: string, howLongToShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongToShow,
            position: 'bottom'
        });
        toast.present();
    }


    saveAttendanceDetails() {

        let year = new Date(this.choosenDate.SessionOn).getFullYear();
        let month = new Date(this.choosenDate.SessionOn).getMonth() + 1;
        let date = new Date(this.choosenDate.SessionOn).getDate();
        for (let i = 0; i < this.selectedMembersForTheSession.length; i++) {
            if (this.selectedMembersForTheSession[i].IsActive) {
                if (this.selectedMembersForTheSession[i].isSelect) {
                    this.fb.update(this.selectedMembersForTheSession[i].Key, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/" + year + "-" + month + "-" + date + "/" + "/Member/", { IsPresent: true });
                }
                else {
                    this.fb.update(this.selectedMembersForTheSession[i].Key, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/" + year + "-" + month + "-" + date + "/" + "/Member/", { IsPresent: false });
                }
            }
        }

      
        this.navCtrl.pop();
        this.navCtrl.pop();
        let message = "Attendance edited successfully.";
        this.showToast(message, 8000);

    }

    selectAllToggole() {

        if (this.isSelectAll) {
            this.isUnselectAll = false;
            for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
                this.selectedMembersForTheSession[loop].isSelect = true;
            }
        }
        else if (!this.isSelectAll) {
            for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
                this.selectedMembersForTheSession[loop].isSelect = false;
            }
        }
    }
    selectNoneToggole() {

        if (this.isUnselectAll) {
            this.isSelectAll = false;
            for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
                this.selectedMembersForTheSession[loop].isSelect = false;
            }
        }
    }
    changeMembers() {
        this.isSelectAll = false;
        this.isUnselectAll = false;
    }

}
