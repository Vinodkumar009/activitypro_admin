// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams, Platform } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'paymentdetailscoach-page',
    templateUrl: 'paymentdetailscoach.html'
})

export class CoachPaymentDetails {
    termKey: string;
    reportType = ""
    sessionFolder = [];
    themeType: number;
    loading: any;
    coachKey: any;
    parentClubKey: any;

    obj = {
        Message: ''
    }
    sessionDetails = [];
    clubs = [];
    selectedClub = "";
    coaches = [];
    selectedCoach = "";
    memberList = [];



    amountPaid = "0.00";
    amountDue = "0.00";

    coachType = "";
    isAndroid: boolean = false;

    paymentStatus = "Paid";




    paidMemberList = [];
    pendingVerificationMemberList = [];
    dueMemberList = [];
    paidMemberListtemp = [];
    pendingVerificationMemberListtemp = [];
    dueMemberListtemp = [];


    constructor(public commonService:CommonService,platform: Platform, public navParams: NavParams, public loadingCtrl: LoadingController, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
        this.obj.Message = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


        // this.loading.present();
        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
        this.selectedClub = navParams.get('SelectedClub');
        this.selectedCoach = navParams.get('SelectedCoach');
        this.sessionDetails = navParams.get('AllSessionLists');
        this.clubs = navParams.get('AllClubs');
        this.reportType = navParams.get('ReportType');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.coachKey = val.UserInfo[0].CoachKey;

                this.coachType = val.Type;
                //   this.getClubList();
            }
            if (this.reportType == "Current") {
                this.getCurrentPaidMemberList();
                this.getCurrentPendingVerficationMemberList();
                this.getCurrentDueMemberList();
            } else {
                this.getPaidMemberList();
                this.getPendingVerficationMemberList();
                this.getDueMemberList();
            }

            // this.loading.dismiss().catch(() => { });
        })

    }



    getPaidMemberList() {
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].AmountPayStatus == "Paid") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        break;
                                    }
                                }
                                memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();
                                this.paidMemberList.push(memberList[j]);
                                this.paidMemberListtemp.push(memberList[j]);

                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub && this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].AmountPayStatus == "Paid") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        break;
                                    }
                                }
                                memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();

                                this.paidMemberList.push(memberList[j]);
                                this.paidMemberListtemp.push(memberList[j]);

                            }
                        }
                    }
                }
            }
        }

    }


    getPendingVerficationMemberList() {
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {

                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].AmountPayStatus == "Pending Verification") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        break;
                                    }
                                }
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                this.pendingVerificationMemberList.push(memberList[j]);
                                this.pendingVerificationMemberListtemp.push(memberList[j]);

                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub && this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].AmountPayStatus == "Pending Verification") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        break;
                                    }
                                }
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                this.pendingVerificationMemberList.push(memberList[j]);
                                this.pendingVerificationMemberListtemp.push(memberList[j]);

                            }
                        }
                    }
                }
            }
        }

    }


    getDueMemberList() {
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    if (this.sessionDetails[i].CoachKey == this.selectedCoach) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].IsActive) {
                                if (memberList[j].AmountPayStatus == "Due") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            break;
                                        }
                                    }
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                    this.dueMemberList.push(memberList[j]);
                                    this.dueMemberListtemp.push(memberList[j]);

                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub && this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].IsActive) {
                                if (memberList[j].AmountPayStatus == "Due") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            break;
                                        }
                                    }
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                    this.dueMemberList.push(memberList[j]);
                                    this.dueMemberListtemp.push(memberList[j]);

                                }
                            }
                        }
                    }
                }
            }
        }

    }

    getCurrentPaidMemberList() {
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        for (let k = 0; k < this.clubs.length; k++) {
                            if (this.clubs[k].CurrentTermKey != undefined) {
                                if (this.sessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
                                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                                    for (let j = 0; j < memberList.length; j++) {
                                        memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                        if (memberList[j].AmountPayStatus == "Paid") {
                                            for (let k = 0; k < this.clubs.length; k++) {
                                                if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                    memberList[j].ClubName = this.clubs[k].ClubName;
                                                    break;
                                                }
                                            }
                                            memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                            memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                            memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                            let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                            memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();
                                            this.paidMemberList.push(memberList[j]);
                                            this.paidMemberListtemp.push(memberList[j]);

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All") {
            this.termKey = "";
            for (var index = 0; index < this.clubs.length; index++) {
                if (this.clubs[index].$key == this.selectedClub) {
                    this.termKey = this.clubs[index].CurrentTermKey;
                }

            }
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub && this.sessionDetails[i].CoachKey == this.selectedCoach) {

                    if (this.sessionDetails[i].Member != undefined) {
                        if (this.sessionDetails[i].TermKey == this.termKey) {
                            let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                            for (let j = 0; j < memberList.length; j++) {
                                memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                if (memberList[j].AmountPayStatus == "Paid") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            break;
                                        }
                                    }
                                    memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();

                                    this.paidMemberList.push(memberList[j]);
                                    this.paidMemberListtemp.push(memberList[j]);

                                }
                            }
                        }
                    }
                }
            }
        }

    }


    getCurrentPendingVerficationMemberList() {
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        for (let k = 0; k < this.clubs.length; k++) {
                            if (this.clubs[k].CurrentTermKey != undefined) {
                                if (this.sessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
                                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                                    for (let j = 0; j < memberList.length; j++) {
                                        memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                        if (memberList[j].AmountPayStatus == "Pending Verification") {
                                            for (let k = 0; k < this.clubs.length; k++) {
                                                if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                    memberList[j].ClubName = this.clubs[k].ClubName;
                                                    break;
                                                }
                                            }
                                            memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                            memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                            this.pendingVerificationMemberList.push(memberList[j]);
                                            this.pendingVerificationMemberListtemp.push(memberList[j]);

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All") {
            this.termKey = "";
            for (var index = 0; index < this.clubs.length; index++) {
                if (this.clubs[index].$key == this.selectedClub) {
                    this.termKey = this.clubs[index].CurrentTermKey;
                }

            }
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub && this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        if (this.sessionDetails[i].TermKey == this.termKey) {
                            for (let j = 0; j < memberList.length; j++) {
                                memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                if (memberList[j].AmountPayStatus == "Pending Verification") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            break;
                                        }
                                    }
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    this.pendingVerificationMemberList.push(memberList[j]);
                                    this.pendingVerificationMemberListtemp.push(memberList[j]);

                                }
                            }
                        }
                    }
                }
            }
        }

    }


    getCurrentDueMemberList() {
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    if (this.sessionDetails[i].CoachKey == this.selectedCoach) {
                        for (let k = 0; k < this.clubs.length; k++) {
                            if (this.clubs[k].CurrentTermKey != undefined) {
                                if (this.sessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
                                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                                    for (let j = 0; j < memberList.length; j++) {
                                        memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                        if (memberList[j].IsActive) {
                                            if (memberList[j].AmountPayStatus == "Due") {
                                                for (let k = 0; k < this.clubs.length; k++) {
                                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                                        break;
                                                    }
                                                }
                                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                                memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                                this.dueMemberList.push(memberList[j]);
                                                this.dueMemberListtemp.push(memberList[j]);

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All") {
            this.termKey = "";
            for (var index = 0; index < this.clubs.length; index++) {
                if (this.clubs[index].$key == this.selectedClub) {
                    this.termKey = this.clubs[index].CurrentTermKey;
                }

            }
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub && this.sessionDetails[i].CoachKey == this.selectedCoach) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        if (this.sessionDetails[i].TermKey == this.termKey) {
                            for (let j = 0; j < memberList.length; j++) {
                                memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                if (memberList[j].IsActive) {
                                    if (memberList[j].AmountPayStatus == "Due") {
                                        for (let k = 0; k < this.clubs.length; k++) {
                                            if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                memberList[j].ClubName = this.clubs[k].ClubName;
                                                break;
                                            }
                                        }
                                        memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                        memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                        memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                        this.dueMemberList.push(memberList[j]);
                                        this.dueMemberListtemp.push(memberList[j]);

                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    }


    paymentTabClick() {

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

    getFilterItemsPaid(ev: any) {

        try {
            // Reset items back to all of the items
            //  this.initializeItems();
            this.paidMemberList = this.paidMemberListtemp;
            // set val to the value of the searchbar
            let val = ev.target.value;

            // if the value is an empty string don't filter the items
            if (val && val.trim() != '') {
                this.paidMemberList = this.paidMemberList.filter((item) => {
                    if (item.DisplayName != undefined) {
                        if (item.DisplayName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                            return true;
                        }

                    }
                })
            }
        }
        catch (ex) {
            //   let msg = "Some error occured! Pls. contact support";
            //this.showToast(msg, 5000);
        }

        // this.loading.dismiss().catch(() => { });

    }
    getFilterItemsPending(ev: any) {


        try {
            // Reset items back to all of the items
            //  this.initializeItems();
            this.pendingVerificationMemberList = this.pendingVerificationMemberListtemp;
            // set val to the value of the searchbar
            let val = ev.target.value;

            // if the value is an empty string don't filter the items
            if (val && val.trim() != '') {
                this.pendingVerificationMemberList = this.pendingVerificationMemberList.filter((item) => {
                    if (item.DisplayName != undefined) {
                        if (item.DisplayName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                            return true;
                        }

                    }
                })
            }
        }
        catch (ex) {
            //   let msg = "Some error occured! Pls. contact support";
            //this.showToast(msg, 5000);
        }

        // this.loading.dismiss().catch(() => { });

    }
    getFilterItemsDue(ev: any) {


        try {
            // Reset items back to all of the items
            //  this.initializeItems();
            this.dueMemberList = this.dueMemberListtemp;
            // set val to the value of the searchbar
            let val = ev.target.value;

            // if the value is an empty string don't filter the items
            if (val && val.trim() != '') {
                this.dueMemberList = this.dueMemberList.filter((item) => {
                    if (item.DisplayName != undefined) {
                        if (item.DisplayName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                            return true;
                        }

                    }
                })
            }
        }
        catch (ex) {
            //   let msg = "Some error occured! Pls. contact support";
            //this.showToast(msg, 5000);
        }

        // this.loading.dismiss().catch(() => { });

    }


    // sessionDetails(sessionDetailsForGroup) {
    //     this.navCtrl.push(Type2SessionDetails, { OldSessionDetails: sessionDetailsForGroup });
    // }



}

   // this.getSessionDetailsAcccordingToClub();













