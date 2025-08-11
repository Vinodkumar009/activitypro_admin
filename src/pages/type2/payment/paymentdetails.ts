// import { Type2PaymentDetailsForGroup } from './../session/updatepaymentdetailsforgroup';
import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';

import { IonicPage, ActionSheetController, AlertController, ToastController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'paymentdetails-page',
    templateUrl: 'paymentdetails.html'
})

export class PaymentDetails {
    LangObj:any = {};//by vinod
    ddddddd: string;
    ccccccccccccc: string;
    termKey = "";
    reportType = "";
    selectedDatesInSeconds = [];
    themeType: number;
    isAndroid: boolean = false;

    paymentStatus = "Paid";
    parentClubKey = "";
    sessionDetails = [];
    clubs = [];
    selectedClub = "";
    selectedCoach = "";



    paidMemberList = [];
    pendingVerificationMemberList = [];
    dueMemberList = [];
    paidMemberListtemp = [];
    pendingVerificationMemberListtemp = [];
    dueMemberListtemp = [];

    paidMemberSessionList = [];
    pendingVerificationMemberSessionList = [];
    dueMemberSessionList = [];


    currencyDetails = {
        CurrencySymbol: "",
    };
    showTypeVal:any = "paid"
    constructor(public events: Events, private toastCtrl: ToastController, private alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public commonService: CommonService, public navParams: NavParams, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, private platform: Platform, public popoverCtrl: PopoverController) {

        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        }).catch(error => {
        });

        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');


        this.selectedClub = navParams.get('SelectedClub');
        this.selectedCoach = navParams.get('SelectedCoach');
        this.sessionDetails = navParams.get('AllSessionLists');
        this.reportType = navParams.get('ReportType');
        this.termKey = navParams.get('TermKey');
        this.clubs = navParams.get('AllClubs');

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;

            }
        });




        if (this.reportType == "CurrentTerm") {
            this.getPaidMemberListForCurrent();
            this.getPendingVerficationMemberListForCurrent();
            this.getDueMemberListForCurrent();
        } else {
            this.getPaidMemberList();

            this.getPendingVerficationMemberList();
            this.getDueMemberList();
        }

    }

    ionViewDidLoad() {
        this.getLanguage();
        this.events.subscribe('language', (res) => {
            this.getLanguage();
        });
    }
    getLanguage(){
        this.storage.get("language").then((res)=>{
          console.log(res["data"]);
         this.LangObj = res.data;
        })
    }





    getPaidMemberList() {



        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                    for (let j = 0; j < memberList.length; j++) {
                        memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                        if (memberList[j].AmountPayStatus == "Paid") {
                            for (let k = 0; k < this.clubs.length; k++) {
                                if (memberList[j].ClubKey == this.clubs[k].$key) {
                                    memberList[j].ClubName = this.clubs[k].ClubName;
                                    memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                    break;
                                }
                            }
                            memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                            memberList[j].CoachName = this.sessionDetails[i].CoachName;
                            memberList[j].SessionName = this.sessionDetails[i].SessionName;
                            this.paidMemberList.push(memberList[j]);
                            this.paidMemberListtemp.push(memberList[j]);

                            this.paidMemberSessionList.push(this.sessionDetails[i]);
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].AmountPayStatus == "Paid") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                        break;
                                    }
                                }
                                memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;

                                this.paidMemberList.push(memberList[j]);
                                this.paidMemberListtemp.push(memberList[j]);


                                this.paidMemberSessionList.push(this.sessionDetails[i]);

                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach != "All") {
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
                                        memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                        break;
                                    }
                                }
                                memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;

                                // //added by abinash
                                // memberList[i]["DiscountAmountIncludingCharges"] = (parseFloat(memberList[j].TotalFeesAmount) - parseFloat(memberList[j].AmountPaid));
                                // //end


                                let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                                this.paidMemberList.push(memberList[j]);
                                this.paidMemberListtemp.push(memberList[j]);

                                this.paidMemberSessionList.push(this.sessionDetails[i]);
                            }
                        }
                    }
                }
            }
        }
        for (let j = 0; j < this.paidMemberList.length; j++) {

            if (this.paidMemberList[j].TransactionDate != undefined && this.paidMemberList[j].TransactionDate != "") {
                let dateArray = (this.paidMemberList[j].TransactionDate).split("-");
                if (dateArray.length == 3) {
                    // dateArray[1] = (dateArray[1].length < 2) ? "0" + dateArray[1] : dateArray[1];
                    // dateArray[2] = (dateArray[2].length < 2) ? "0" + dateArray[2] : dateArray[2];
                    // this.paidMemberList[j].TransactionDate = "";
                    // this.paidMemberList[j].TransactionDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];


                    // this.paidMemberList[j].TransactionDate = new Date(this.paidMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.paidMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.paidMemberList[j].TransactionDate).getFullYear();
                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    if (dateArray[1].length < 3) {
                        this.paidMemberList[j].TransactionDate = dateArray[2] + "-" + arr[(parseInt(dateArray[1]) - 1)] + "-" + dateArray[0];
                    }
                }
                else if (dateArray.length == 1) {
                    let dd = new Date(dateArray).getDate().toString();
                    let mm = (new Date(dateArray).getMonth()).toString();
                    let yy = (new Date(dateArray).getFullYear()).toString();

                    dd = (dd.length < 2) ? "0" + dd : dd;
                    mm = (mm.length < 2) ? "0" + mm : mm;


                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    this.paidMemberList[j].TransactionDate = "";
                    this.paidMemberList[j].TransactionDate = dd + "-" + arr[parseInt(mm)] + "-" + yy;

                }

                //added by abinash
                this.paidMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.paidMemberList[j].TotalFeesAmount) - parseFloat(this.paidMemberList[j].AmountPaid))).toFixed(2);
                //end
            }

            // this.paidMemberList=this.commonService.sortingObjects(this.paidMemberList,"TransactionDate")
        }
        this.paidMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());
        this.showType('Paid')
    }

    showToast(m: string) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: 5000,
            position: 'bottom'
        });
        toast.present();
    }


    getPendingVerficationMemberList() {
        this.pendingVerificationMemberList = [];

        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                    for (let j = 0; j < memberList.length; j++) {
                        memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                        if (memberList[j].AmountPayStatus == "Pending Verification") {
                            for (let k = 0; k < this.clubs.length; k++) {
                                if (memberList[j].ClubKey == this.clubs[k].$key) {
                                    memberList[j].ClubName = this.clubs[k].ClubName;
                                    memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                    break;
                                }
                            }
                            memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                            memberList[j].CoachName = this.sessionDetails[i].CoachName;
                            memberList[j].SessionName = this.sessionDetails[i].SessionName;



                            //added on 02-11-2017 by Abinash
                            memberList[j].SessionKey = this.sessionDetails[i].Key;
                            memberList[j].Days = this.sessionDetails[i].Days;
                            memberList[j].StartTime = this.sessionDetails[i].StartTime;
                            // ends here
                            this.pendingVerificationMemberList.push(memberList[j]);
                            this.pendingVerificationMemberListtemp.push(memberList[j]);
                            this.pendingVerificationMemberSessionList.push(this.sessionDetails[i]);

                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].AmountPayStatus == "Pending Verification") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                        break;
                                    }
                                }
                                memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                //added on 02-11-2017 by Abinash
                                memberList[j].SessionKey = this.sessionDetails[i].Key;
                                memberList[j].Days = this.sessionDetails[i].Days;
                                memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                // ends here
                                this.pendingVerificationMemberList.push(memberList[j]);
                                this.pendingVerificationMemberListtemp.push(memberList[j]);
                                this.pendingVerificationMemberSessionList.push(this.sessionDetails[i]);

                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach != "All") {
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
                                        memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                        break;
                                    }
                                }
                                memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                //added on 02-11-2017 by Abinash
                                memberList[j].SessionKey = this.sessionDetails[i].Key;
                                memberList[j].Days = this.sessionDetails[i].Days;
                                memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                // ends here
                                this.pendingVerificationMemberList.push(memberList[j]);
                                this.pendingVerificationMemberListtemp.push(memberList[j]);
                                this.pendingVerificationMemberSessionList.push(this.sessionDetails[i]);
                            }
                        }
                    }
                }
            }
        }
        for (let j = 0; j < this.pendingVerificationMemberList.length; j++) {
            let dateArray = (this.pendingVerificationMemberList[j].TransactionDate).split("-");
            dateArray[1] = (dateArray[1].length < 2) ? "0" + dateArray[1] : dateArray[1];
            dateArray[2] = (dateArray[2].length < 2) ? "0" + dateArray[2] : dateArray[2];
            this.pendingVerificationMemberList[j].TransactionDate = "";
            this.pendingVerificationMemberList[j].TransactionDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];


            let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            this.pendingVerificationMemberList[j].TransactionDate = new Date(this.pendingVerificationMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.pendingVerificationMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.pendingVerificationMemberList[j].TransactionDate).getFullYear();

            //added by abinash
            this.pendingVerificationMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.pendingVerificationMemberList[j].TotalFeesAmount) - parseFloat(this.pendingVerificationMemberList[j].AmountPaid))).toFixed(2);
            //end

        }
        this.pendingVerificationMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());

        // for (let j = 0; j < this.pendingVerificationMemberList.length; j++) {

        //     let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        //     this.pendingVerificationMemberList[j].TransactionDate = new Date(this.pendingVerificationMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.pendingVerificationMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.pendingVerificationMemberList[j].TransactionDate).getFullYear();
        // }
    }


    getDueMemberList() {


        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                    for (let j = 0; j < memberList.length; j++) {
                        memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                        if (memberList[j].IsActive) {
                            if (memberList[j].AmountPayStatus == "Due") {
                                for (let k = 0; k < this.clubs.length; k++) {
                                    if (memberList[j].ClubKey == this.clubs[k].$key) {
                                        memberList[j].ClubName = this.clubs[k].ClubName;
                                        memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                        break;
                                    }
                                }
                                memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                memberList[j].Days = this.sessionDetails[i].Days;
                                memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                this.dueMemberList.push(memberList[j]);
                                this.dueMemberListtemp.push(memberList[j]);
                                this.dueMemberSessionList.push(this.sessionDetails[i]);

                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach == "All") {

            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                            if (memberList[j].IsActive) {
                                if (memberList[j].AmountPayStatus == "Due") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                            break;
                                        }
                                    }
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                    memberList[j].Days = this.sessionDetails[i].Days;
                                    memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                    this.dueMemberList.push(memberList[j]);
                                    this.dueMemberListtemp.push(memberList[j]);
                                    this.dueMemberSessionList.push(this.sessionDetails[i]);

                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach != "All") {
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
                                            memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                            break;
                                        }
                                    }
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                    memberList[j].Days = this.sessionDetails[i].Days;
                                    memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                    this.dueMemberList.push(memberList[j]);
                                    this.dueMemberListtemp.push(memberList[j]);
                                    this.dueMemberSessionList.push(this.sessionDetails[i]);
                                }
                            }
                        }
                    }
                }

            }
        }
    }

    getPaidMemberListForCurrent() {


        //  this.ccccccccccccc = "0.00";
        // this.ddddddd = "0.00";
        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                    for (let k = 0; k < this.clubs.length; k++) {
                        if (this.clubs[k].CurrentTermKey != undefined) {
                            if (this.sessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
                                for (let j = 0; j < memberList.length; j++) {
                                    memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                    if (memberList[j].AmountPayStatus == "Paid") {
                                        for (let k = 0; k < this.clubs.length; k++) {
                                            if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                memberList[j].ClubName = this.clubs[k].ClubName;
                                                memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                                break;
                                            }
                                        }




                                        memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                        memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                        memberList[j].SessionName = this.sessionDetails[i].SessionName;





                                        // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                        // memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();
                                        this.paidMemberList.push(memberList[j]);
                                        this.paidMemberListtemp.push(memberList[j]);


                                        this.paidMemberSessionList.push(this.sessionDetails[i]);
                                    }
                                }
                            }
                        }
                    }


                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach == "All") {
            //  this.ccccccccccccc = "0.00";
            this.termKey = "";
            for (let index = 0; index < this.clubs.length; index++) {
                if (this.clubs[index].$key == this.selectedClub) {
                    this.termKey = this.clubs[index].CurrentTermKey;
                }

            }
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        if (this.sessionDetails[i].TermKey == this.termKey) {
                            for (let j = 0; j < memberList.length; j++) {
                                memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                if (memberList[j].AmountPayStatus == "Paid") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                            break;
                                        }
                                    }



                                    memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    // memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();

                                    this.paidMemberList.push(memberList[j]);
                                    this.paidMemberListtemp.push(memberList[j]);



                                    this.paidMemberSessionList.push(this.sessionDetails[i]);

                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach != "All") {
            this.termKey = "";
            for (let index = 0; index < this.clubs.length; index++) {
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
                                if (memberList[j].AmountPayStatus == "Paid") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                            break;
                                        }
                                    }


                                    memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    // // memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();
                                    // memberList[j].TransactionDate = new Date(memberList[j].TransactionDate);
                                    this.paidMemberList.push(memberList[j]);
                                    this.paidMemberListtemp.push(memberList[j]);


                                    this.paidMemberSessionList.push(this.sessionDetails[i]);
                                }
                            }
                        }
                    }
                }
            }
        }

        // this.paidMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());

        // for (let j = 0; j < this.paidMemberList.length; j++) {

        //     let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        //     this.paidMemberList[j].TransactionDate = new Date(this.paidMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.paidMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.paidMemberList[j].TransactionDate).getFullYear();
        // }

        this.paidMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());
        for (let j = 0; j < this.paidMemberList.length; j++) {

            if (this.paidMemberList[j].TransactionDate != undefined && this.paidMemberList[j].TransactionDate != "") {
                let dateArray = (this.paidMemberList[j].TransactionDate).split("-");
                if (dateArray.length == 3) {
                    // dateArray[1] = (dateArray[1].length < 2) ? "0" + dateArray[1] : dateArray[1];
                    // dateArray[2] = (dateArray[2].length < 2) ? "0" + dateArray[2] : dateArray[2];
                    // this.paidMemberList[j].TransactionDate = "";
                    // this.paidMemberList[j].TransactionDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];

                    // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    // this.paidMemberList[j].TransactionDate = new Date(this.paidMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.paidMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.paidMemberList[j].TransactionDate).getFullYear();

                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    if (dateArray[1].length < 3) {
                        this.paidMemberList[j].TransactionDate = dateArray[2] + "-" + arr[(parseInt(dateArray[1]) - 1)] + "-" + dateArray[0];
                    }
                }
                else if (dateArray.length == 1) {
                    let dd = new Date(dateArray).getDate().toString();
                    let mm = (new Date(dateArray).getMonth()).toString();
                    let yy = (new Date(dateArray).getFullYear()).toString();

                    dd = (dd.length < 2) ? "0" + dd : dd;
                    mm = (mm.length < 2) ? "0" + mm : mm;


                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    this.paidMemberList[j].TransactionDate = "";
                    this.paidMemberList[j].TransactionDate = dd + "-" + arr[parseInt(mm)] + "-" + yy;

                }

                //added by abinash
                this.paidMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.paidMemberList[j].TotalFeesAmount) - parseFloat(this.paidMemberList[j].AmountPaid))).toFixed(2);
                //end
            }

        }

        // for (let j = 0; j < this.paidMemberList.length; j++) {


        //     let dateArray = (this.paidMemberList[j].TransactionDate).split("-");
        //     dateArray[1] = (dateArray[1].length < 2) ? "0" + dateArray[1] : dateArray[1];
        //     dateArray[2] = (dateArray[2].length < 2) ? "0" + dateArray[2] : dateArray[2];
        //     this.paidMemberList[j].TransactionDate = "";
        //     this.paidMemberList[j].TransactionDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];


        //     let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        //     this.paidMemberList[j].TransactionDate = new Date(this.paidMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.paidMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.paidMemberList[j].TransactionDate).getFullYear();
        //     //  this.paidMemberList[j].TransactionDate = this.commonService.convertDatetoDDMMYYYY.apply(this.paidMemberList[j].TransactionDate);
        //     //this.paidMemberList[j].TransactionDate = this.commonService.getDateIn_DD_MMM_YYYY_Format(this.paidMemberList[j].TransactionDate);
        // }
        // this.paidMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());
    }



    getPendingVerficationMemberListForCurrent() {
        this.pendingVerificationMemberList = [];

        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                    for (let k = 0; k < this.clubs.length; k++) {
                        if (this.clubs[k].CurrentTermKey != undefined) {
                            if (this.sessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
                                for (let j = 0; j < memberList.length; j++) {
                                    memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                    if (memberList[j].AmountPayStatus == "Pending Verification") {
                                        for (let k = 0; k < this.clubs.length; k++) {
                                            if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                memberList[j].ClubName = this.clubs[k].ClubName;
                                                memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                                break;
                                            }
                                        }
                                        memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                        memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                        memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                        //added on 02-11-2017 by Abinash
                                        memberList[j].SessionKey = this.sessionDetails[i].Key;
                                        memberList[j].Days = this.sessionDetails[i].Days;
                                        memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                        // ends here

                                        this.pendingVerificationMemberList.push(memberList[j]);
                                        this.pendingVerificationMemberListtemp.push(memberList[j]);
                                        this.pendingVerificationMemberSessionList.push(this.sessionDetails[i]);

                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach == "All") {
            this.termKey = "";
            for (let index = 0; index < this.clubs.length; index++) {
                if (this.clubs[index].$key == this.selectedClub) {
                    this.termKey = this.clubs[index].CurrentTermKey;
                }

            }
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub) {
                    if (this.sessionDetails[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                        if (this.sessionDetails[i].TermKey == this.termKey) {
                            for (let j = 0; j < memberList.length; j++) {
                                memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                if (memberList[j].AmountPayStatus == "Pending Verification") {
                                    for (let k = 0; k < this.clubs.length; k++) {
                                        if (memberList[j].ClubKey == this.clubs[k].$key) {
                                            memberList[j].ClubName = this.clubs[k].ClubName;
                                            memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                            break;
                                        }
                                    }
                                    memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    //added on 02-11-2017 by Abinash
                                    memberList[j].SessionKey = this.sessionDetails[i].Key;
                                    memberList[j].Days = this.sessionDetails[i].Days;
                                    memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                    // ends here
                                    this.pendingVerificationMemberList.push(memberList[j]);
                                    this.pendingVerificationMemberListtemp.push(memberList[j]);
                                    this.pendingVerificationMemberSessionList.push(this.sessionDetails[i]);

                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach != "All") {
            this.termKey = "";
            for (let index = 0; index < this.clubs.length; index++) {
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
                                            memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                            break;
                                        }
                                    }
                                    memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                                    memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                    memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                    //added on 02-11-2017 by Abinash
                                    memberList[j].SessionKey = this.sessionDetails[i].Key;
                                    memberList[j].Days = this.sessionDetails[i].Days;
                                    memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                    // ends here
                                    this.pendingVerificationMemberList.push(memberList[j]);
                                    this.pendingVerificationMemberListtemp.push(memberList[j]);
                                    this.pendingVerificationMemberSessionList.push(this.sessionDetails[i]);
                                }
                            }
                        }
                    }
                }
            }

        }
        for (let j = 0; j < this.pendingVerificationMemberList.length; j++) {
            let dateArray = (this.pendingVerificationMemberList[j].TransactionDate).split("-");
            if (dateArray.length == 3) {
                // dateArray[1] = (dateArray[1].length < 2) ? "0" + dateArray[1] : dateArray[1];
                // dateArray[2] = (dateArray[2].length < 2) ? "0" + dateArray[2] : dateArray[2];
                // this.pendingVerificationMemberList[j].TransactionDate = "";
                // this.pendingVerificationMemberList[j].TransactionDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];
                // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                // this.pendingVerificationMemberList[j].TransactionDate = new Date(this.pendingVerificationMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.pendingVerificationMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.pendingVerificationMemberList[j].TransactionDate).getFullYear();

                let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                if (dateArray[1].length < 3) {
                    this.pendingVerificationMemberList[j].TransactionDate = dateArray[2] + "-" + arr[(parseInt(dateArray[1]) - 1)] + "-" + dateArray[0];
                }


            } else if (dateArray.length == 1) {
                this.showToast(new Date(dateArray).toString());
            }

            //added by abinash
            this.pendingVerificationMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.pendingVerificationMemberList[j].TotalFeesAmount) - parseFloat(this.pendingVerificationMemberList[j].AmountPaid))).toFixed(2);
            //end

            //  this.paidMemberList[j].TransactionDate = this.commonService.convertDatetoDDMMYYYY.apply(this.paidMemberList[j].TransactionDate);
            //this.paidMemberList[j].TransactionDate = this.commonService.getDateIn_DD_MMM_YYYY_Format(this.paidMemberList[j].TransactionDate);



        }
        this.pendingVerificationMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());

        // for (let j = 0; j < this.pendingVerificationMemberList.length; j++) {

        //     let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        //     this.pendingVerificationMemberList[j].TransactionDate = new Date(this.pendingVerificationMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.pendingVerificationMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.pendingVerificationMemberList[j].TransactionDate).getFullYear();
        // }
    }


    getDueMemberListForCurrent() {
        // this.ddddddd = "0.00";

        if (this.selectedClub == "All") {
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].Member != undefined) {
                    let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
                    for (let k = 0; k < this.clubs.length; k++) {
                        if (this.clubs[k].CurrentTermKey != undefined) {
                            if (this.sessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
                                for (let j = 0; j < memberList.length; j++) {
                                    memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                                    if (memberList[j].IsActive) {
                                        if (memberList[j].AmountPayStatus == "Due") {
                                            for (let k = 0; k < this.clubs.length; k++) {
                                                if (memberList[j].ClubKey == this.clubs[k].$key) {
                                                    memberList[j].ClubName = this.clubs[k].ClubName;
                                                    memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                                    break;
                                                }
                                            }
                                            //  this.ddddddd = (parseFloat(this.ddddddd) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                                            memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                            memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                            memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                            memberList[j].Days = this.sessionDetails[i].Days;
                                            memberList[j].StartTime = this.sessionDetails[i].StartTime;
                                            this.dueMemberList.push(memberList[j]);
                                            this.dueMemberListtemp.push(memberList[j]);
                                            this.dueMemberSessionList.push(this.sessionDetails[i]);

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach == "All") {
            this.termKey = "";
            for (let index = 0; index < this.clubs.length; index++) {
                if (this.clubs[index].$key == this.selectedClub) {
                    this.termKey = this.clubs[index].CurrentTermKey;
                }

            }
            for (let i = 0; i < this.sessionDetails.length; i++) {
                if (this.sessionDetails[i].ClubKey == this.selectedClub) {
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
                                                memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                                break;
                                            }
                                        }
                                        //  this.ddddddd = (parseFloat(this.ddddddd) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                                        memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                        memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                        memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                        this.dueMemberList.push(memberList[j]);
                                        this.dueMemberListtemp.push(memberList[j]);
                                        this.dueMemberSessionList.push(this.sessionDetails[i]);

                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (this.selectedClub != "All" && this.selectedCoach != "All") {
            this.termKey = "";
            for (let index = 0; index < this.clubs.length; index++) {
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
                                                memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                                                break;
                                            }
                                        }
                                        // this.ddddddd = (parseFloat(this.ddddddd) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                                        memberList[j].CoachName = this.sessionDetails[i].CoachName;
                                        memberList[j].SessionName = this.sessionDetails[i].SessionName;
                                        memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);
                                        this.dueMemberList.push(memberList[j]);
                                        this.dueMemberListtemp.push(memberList[j]);
                                        this.dueMemberSessionList.push(this.sessionDetails[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }
    }

    sortTheDates(arrValuesToBeSort = []): Array<number> {

        let arr = arrValuesToBeSort;
        let iteration = arr.length;
        let sortedArray = [];
        let currentSmallElementIndex = 0;
        let currentElement;

        for (let count = 0; count < iteration; count++) {
            currentElement = arr[0];
            currentSmallElementIndex = 0;
            for (let loop = 1; loop < arr.length; loop++) {
                if (currentElement < arr[loop]) {
                    currentSmallElementIndex = loop;
                    currentElement = arr[loop];
                }
            }
            sortedArray.push(new Date(currentElement));
            arr.splice(currentSmallElementIndex, 1);
        }
        return sortedArray;

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
            // let msg = "Some error occured! Pls. contact support";
            // this.showToast(msg, 5000);
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
            // let msg = "Some error occured! Pls. contact support";
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
            // let msg = "Some error occured! Pls. contact support";
            //this.showToast(msg, 5000);
        }

        // this.loading.dismiss().catch(() => { });

    }

    update(member, index) {

        for (let i = 0; i < this.pendingVerificationMemberSessionList.length; i++) {
            if (this.pendingVerificationMemberSessionList[i].Key == member.SessionKey) {
                this.navCtrl.push("Type2PaymentDetailsForGroup", { SelectedMember: member, SessionDetails: this.pendingVerificationMemberSessionList[i] });
                break;
            }
        }

    }
    // updateDueMember(member, index) {
    //     this.navCtrl.push("Type2PaymentDetailsForGroup", { SelectedMember: member, SessionDetails: this.dueMemberSessionList[index] });
    // }
    notify(member, pagename) {
        this.navCtrl.push("Type2PaymentNotification", { MemberDetails: member, PageName: pagename });
    }


    presentActionSheetForPendingVerification(record, index) {
        // this.myIndex = -1;
        console.log(record);



        let actionSheet
        if (this.platform.is('android')) {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Verify',
                        icon: 'clipboard',
                        handler: () => {
                            this.update(record, index);
                        }
                    },
                    {
                        text: 'Notify',
                        icon: 'md-notifications',
                        handler: () => {
                            this.notify(record, "");
                        }
                    },
                    {
                        text: 'Email',
                        icon: 'mail',
                        handler: () => {
                            //this.notifyMeber(session)
                        }
                    },
                    {
                        text: 'Print',
                        icon: 'print',
                        handler: () => {
                            //this.sessionDetails(session)
                        }
                    }, {
                        text: 'Cancel',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        }
        else {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Verify',
                        icon: 'clipboard',
                        handler: () => {
                            this.update(record, index);
                        }
                    },
                    {
                        text: 'Notify',
                        icon: 'md-notifications',
                        handler: () => {
                            this.notify(record, "");
                        }
                    },
                    {
                        text: 'Email',
                        icon: 'mail',
                        handler: () => {
                            //this.notifyMeber(session)
                        }
                    },
                    {
                        text: 'Print',
                        icon: 'print',
                        handler: () => {
                            //this.sessionDetails(session)
                        }
                    }, {
                        text: 'Cancel',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        }
    }


    presentActionSheetForDue(record, index) {
        // this.myIndex = -1;
        let actionSheet
        if (this.platform.is('android')) {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Notify',
                        icon: 'md-notifications',
                        handler: () => {
                            this.notify(record, "Due");
                        }
                    },
                    {
                        text: 'Email',
                        icon: 'mail',
                        handler: () => {
                            //this.notifyMeber(session)
                        }
                    },
                    {
                        text: 'Print',
                        icon: 'print',
                        handler: () => {
                            //this.sessionDetails(session)
                        }
                    }, {
                        text: 'Cancel',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        }
        else {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Notify',
                        icon: 'md-notifications',
                        handler: () => {
                            this.notify(record, "Due");
                        }
                    },
                    {
                        text: 'Email',
                        icon: 'mail',
                        handler: () => {
                            //this.notifyMeber(session)
                        }
                    },
                    {
                        text: 'Print',
                        icon: 'print',
                        handler: () => {
                            //this.sessionDetails(session)
                        }
                    }, {
                        text: 'Cancel',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();

        }

    }


    sendMail() {
        // let alert = this.alertCtrl.create({
        //     // title: 'Confirm purchase',
        //     subTitle: 'Send Mail',
        //     message: 'Do you want to send the report as an email?',
        //     buttons: [
        //         {
        //             text: 'No',
        //             role: 'cancel',
        //             handler: () => {
        //                 console.log('Cancel clicked');
        //             }
        //         },
        //         {
        //             text: 'Yes',
        //             handler: () => {
                        
        //             }
        //         }
        //     ]
        // });
        // alert.present();
        this.goToPrint();
    }
    
    slectedList:Array<any> = [];
    showType(val){
        if(val == 'Paid')  {
            this.showTypeVal = ShowType.Paid;
            this.slectedList = JSON.parse(JSON.stringify(this.paidMemberList));
            this.slectedList.push(JSON.parse(JSON.stringify(this.pendingVerificationMemberList)));
        }else if(val == 'Due'){
            this.showTypeVal = ShowType.Due;
            this.slectedList = this.dueMemberList;
        }
    }
    goToPrint(){
        this.navCtrl.push('PaidmemberstatusPage',{
            showType:this.showTypeVal,
            memberList:this.slectedList,
            parentClubKey :this.parentClubKey,
            termKey : this.termKey,
            reportType:this.reportType
        })
    }
}
enum ShowType{
    Paid = 'paid',
    Due = "due",
    Pending = "pending"
}