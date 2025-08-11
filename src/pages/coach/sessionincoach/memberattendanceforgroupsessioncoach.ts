import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { AlertController, ToastController, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'memberattendanceforgroupsessioncoach-page',
    templateUrl: 'memberattendanceforgroupsessioncoach.html'
})

export class CoachMemberAttendance {
    themeType: number;
    sessionDetails: any;
    choosenDate: any;
    selectedMembersForTheSession = [];
    isSelectAll = false;
    isUnselectAll = false;


    attendanceObj = {
        StartDate: '',
        EndDate: '',
        AttendanceStatus: '',
        CanceledReason: ''
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

    isDisabled = false;
    cancelReason = '';
    constructor(public commonService:CommonService,public alertCtrl: AlertController, private toastCtrl: ToastController, public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
        this.sessionDetails = navParams.get('sessiondetails');
        this.choosenDate = navParams.get('ChoosenDate');

        let today = new Date(new Date().getFullYear() + "-" + ((new Date().getMonth()) + 1) + "-" + new Date().getDate()).getTime();
        let chdate = new Date(new Date(this.choosenDate.SessionOn).getFullYear() + "-" + ((new Date(this.choosenDate.SessionOn).getMonth()) + 1) + "-" + new Date(this.choosenDate.SessionOn).getDate()).getTime();
        let timeDif = today - chdate;
        if (timeDif >= 0) {
            this.isDisabled = false;
        } else {
            this.isDisabled = true;
        }
        this.selectedMembersForTheSession = this.commonService.convertFbObjectToArray(this.sessionDetails.Member);

        for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
            this.selectedMembersForTheSession[loop].isSelect = false;
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
        let prompt = this.alertCtrl.create({
            title: 'Attendance Confirm',
            message: "Are you sure? You want to save the attendance.",

            buttons: [
                {
                    text: 'No',
                    handler: data => {

                    }
                },
                {
                    text: 'Yes',
                    handler: data => {
                        this.saveAttendance();
                    }
                }
            ]
        });
        prompt.present();
    }

    saveAttendance() {
        let year = new Date(this.choosenDate.SessionOn).getFullYear();
        let month = new Date(this.choosenDate.SessionOn).getMonth() + 1;
        let date = new Date(this.choosenDate.SessionOn).getDate();

        this.attendanceObj.StartDate = this.sessionDetails.StartDate;
        this.attendanceObj.EndDate = this.sessionDetails.EndDate;
        this.attendanceObj.AttendanceStatus = "Done";

        //this.returnKey = this.fb.saveReturningKey("/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/" + year + "-" + month + "-" + date + "/", this.attendanceObj);
        this.fb.update(year + "-" + month + "-" + date, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/", this.attendanceObj);
        for (let i = 0; i < this.selectedMembersForTheSession.length; i++) {
            this.memberDetailsObj.IsActive = this.selectedMembersForTheSession[i].IsActive;
            this.memberDetailsObj.ClubKey = this.selectedMembersForTheSession[i].ClubKey;
            this.memberDetailsObj.DOB = this.selectedMembersForTheSession[i].DOB;
            this.memberDetailsObj.EmailID = this.selectedMembersForTheSession[i].EmailID;
            this.memberDetailsObj.FirstName = this.selectedMembersForTheSession[i].FirstName;
            this.memberDetailsObj.Gender = this.selectedMembersForTheSession[i].Gender;
            this.memberDetailsObj.IsChild = this.selectedMembersForTheSession[i].IsChild;
            this.memberDetailsObj.LastName = this.selectedMembersForTheSession[i].LastName;
            this.memberDetailsObj.ParentClubKey = this.selectedMembersForTheSession[i].ParentClubKey;
            this.memberDetailsObj.PhoneNumber = this.selectedMembersForTheSession[i].PhoneNumber;
            if (this.selectedMembersForTheSession[i].IsActive) {
                this.memberDetailsObj.IsPresent = this.selectedMembersForTheSession[i].isSelect;
            }
            else {
                this.memberDetailsObj.IsPresent = false;
            }
            this.fb.update(this.selectedMembersForTheSession[i].Key, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/" + year + "-" + month + "-" + date + "/" + "/Member/", this.memberDetailsObj);
            //keeping attandance data in member folder
            this.fb.saveReturningKey("/Member/" + this.memberDetailsObj.ParentClubKey + "/" + this.memberDetailsObj.ClubKey + "/" + this.selectedMembersForTheSession[i].Key + "/Session/" + this.sessionDetails.$key + "/Attendance/", { AttendanceOn: year + "-" + month + "-" + date, AttendanceStatus: "Done", IsPresent: this.selectedMembersForTheSession[i].isSelect });
        }
        this.navCtrl.pop();
        this.navCtrl.pop();
        let message = "Attendance saved successfully.";
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

    onChangeCancel() {
        if (this.cancelReason != "") {
            let prompt = this.alertCtrl.create({
                title: 'Cancel Session',
                message: "Are you sure you want to Cancel the session?",

                buttons: [
                    {
                        text: 'No',
                        handler: data => {
                            this.cancelReason = "";
                        }
                    },
                    {
                        text: 'Yes',
                        handler: data => {


                            this.cancelSession();
                        }
                    }
                ]
            });
            prompt.present();
        }
    }



    cancelSession() {

        let year = new Date(this.choosenDate.SessionOn).getFullYear();
        let month = new Date(this.choosenDate.SessionOn).getMonth() + 1;
        let date = new Date(this.choosenDate.SessionOn).getDate();

        this.attendanceObj.StartDate = this.sessionDetails.StartDate;
        this.attendanceObj.EndDate = this.sessionDetails.EndDate;
        this.attendanceObj.AttendanceStatus = "Canceled";
        this.attendanceObj.CanceledReason = this.cancelReason;
        this.fb.update(year + "-" + month + "-" + date, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/", this.attendanceObj);
        for (let i = 0; i < this.selectedMembersForTheSession.length; i++) {
            this.memberDetailsObj.IsActive = this.selectedMembersForTheSession[i].IsActive;
            this.memberDetailsObj.ClubKey = this.selectedMembersForTheSession[i].ClubKey;
            this.memberDetailsObj.DOB = this.selectedMembersForTheSession[i].DOB;
            this.memberDetailsObj.EmailID = this.selectedMembersForTheSession[i].EmailID;
            this.memberDetailsObj.FirstName = this.selectedMembersForTheSession[i].FirstName;
            this.memberDetailsObj.Gender = this.selectedMembersForTheSession[i].Gender;
            this.memberDetailsObj.IsChild = this.selectedMembersForTheSession[i].IsChild;
            this.memberDetailsObj.LastName = this.selectedMembersForTheSession[i].LastName;
            this.memberDetailsObj.ParentClubKey = this.selectedMembersForTheSession[i].ParentClubKey;
            this.memberDetailsObj.PhoneNumber = this.selectedMembersForTheSession[i].PhoneNumber;
            // if (this.selectedMembersForTheSession[i].IsActive) {
            //     this.memberDetailsObj.IsPresent = this.selectedMembersForTheSession[i].isSelect;
            // }
            // else {
            this.memberDetailsObj.IsPresent = false;
            // }
            this.fb.update(this.selectedMembersForTheSession[i].Key, "/Session/" + this.sessionDetails.ParentClubKey + "/" + this.sessionDetails.ClubKey + "/" + this.sessionDetails.CoachKey + "/" + this.sessionDetails.SessionType + "/" + this.sessionDetails.$key + "/" + year + "-" + month + "-" + date + "/" + "/Member/", this.memberDetailsObj);

            //keeping attandance data in member folder
            this.fb.saveReturningKey("/Member/" + this.memberDetailsObj.ParentClubKey + "/" + this.memberDetailsObj.ClubKey + "/" + this.selectedMembersForTheSession[i].Key + "/Session/" + this.sessionDetails.$key + "/Attendance/", { AttendanceOn: year + "-" + month + "-" + date, AttendanceStatus: this.attendanceObj.AttendanceStatus, IsPresent: this.memberDetailsObj.IsPresent, CanceledReason: this.cancelReason });
        }
        this.navCtrl.pop();
        this.navCtrl.pop();
        let message = "Attendance saved successfully.";
        this.showToast(message, 8000);
    }







}
