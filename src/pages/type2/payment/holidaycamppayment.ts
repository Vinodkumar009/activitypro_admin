// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, Platform, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';

// import { PaymentDetails } from './paymentdetails';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'holidaycamppayment-page',
    templateUrl: 'holidaycamppayment.html'
})

export class HolidayCampPayment {
    holidayCampFolderOveral: any[];
    currentFinacialYearTermList = [];
    financialYear1Key: any;
    financialYear1: any;
    termKey = "";
    themeType: number;
    isAndroid: boolean = false;

    reportType = "Overall";
    loading: any;
    coachKey: any;
    parentClubKey: any;

    obj = {
        Message: ''
    }
    holidayCampFolder = [];
    clubs = [];
    selectedClub = "";
    selectedHolidaycamp = "";
    selectedCurrentHolidaycamp = "";
    selectedCurrentClub = "";
    coaches = [];
    selectedCoach = "";
    selectedCurrentCoach = "";
    memberList = [];
    sessionDetails = [];
    holidayCampFolderCurrentTerm = [];
    amountPaid = "0.00";
    amountDue = "0.00";
    currentAmountPaid = "0.00";
    currentAmountDue = "0.00";
    duecount: number;
    paidcount: number;



    constructor(public commonService:CommonService,public loadingCtrl: LoadingController, platform: Platform, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
            }

        })

    }






    ionViewDidLoad() {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });

        this.loading.present().then(() => {
            this.getHolidayCampDetails();
            this.getClubList();
        });
    }


    cancel() {
        this.navCtrl.pop();
    }
    pay() {

    }
    paymentTabClick(type: string) {
        if (type == "Current") {
            this.loading = this.loadingCtrl.create({
                content: 'Please wait...'
            });

            this.loading.present().then(() => {
                this.coaches = [];
                this.getFinancialYear();
                //  this.calculateCurrentAmount();
                // this.getFinancialYear();

            });
        } else {
            this.coaches = [];
        }

    }
    getFinancialYear() {
        this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {
            if (data.length > 0) {
                this.financialYear1 = data[0];
                this.financialYear1Key = data[0].$key;
                this.selectedCurrentClub = "All";
                for (let i = 0; i < this.clubs.length; i++) {
                    this.fb.getAll("/Term/Type2/" + this.parentClubKey + "/" + this.clubs[i].$key + "/" + this.financialYear1Key + "/").subscribe((data1) => {
                        this.currentFinacialYearTermList = [];
                        if (data1.length > 0) {
                            this.currentFinacialYearTermList = data1;

                            for (let l = 0; l < data1.length; l++) {
                                if (new Date().getTime() > new Date(data1[l].TermStartDate).getTime() && new Date(data1[l].TermEndDate).getTime() > new Date().getTime()) {
                                    this.clubs[i].CurrentTermKey = data1[l].$key;
                                    this.clubs[i].CurrentTermStartDate = data1[l].TermStartDate;
                                    this.clubs[i].CurrentTermEndDate = data1[l].TermEndDate;

                                }
                            };
                        }
                        if (i == this.clubs.length - 1) {
                            this.loading.dismiss();
                            this.calculateCurrentAmount();
                        }
                    });

                }

            }
        });
    }

    getHolidayCampDetails() {
        this.fb.getAll("/HolidayCamp/" + this.parentClubKey + "/").subscribe((data) => {
            this.holidayCampFolder = data;
            this.loading.dismiss();
            this.calculateAmount();

        });
    }
    onChangeOfHolidayCamp() {
        this.amountDue = "0.00";
        this.amountPaid = "0.00";
        let groupHolidayCamp = [];
        this.holidayCampFolderOveral = [];
        if (this.selectedHolidaycamp != "All") {
            for (let i = 0; i < this.holidayCampFolder.length; i++) {
                if (this.holidayCampFolder[i].$key == this.selectedHolidaycamp) {
                    if (this.holidayCampFolder[i].Member != undefined) {
                        this.holidayCampFolderOveral.push(this.holidayCampFolder[i]);
                        let memberList = this.commonService.convertFbObjectToArray(this.holidayCampFolder[i].Member);
                        for (let j = 0; j < memberList.length; j++) {
                            // if (memberList[j].IsActive) {
                            this.duecount = this.duecount + 1;
                            this.paidcount = this.paidcount + 1;
                            if (memberList[j].AmountPayStatus == "Due") {
                                this.amountDue = (parseFloat(this.amountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                            } else {
                                this.amountPaid = (parseFloat(this.amountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);
                            }
                            //  }
                        }
                    }
                    break;
                }
            }
        } else {
            this.calculateAmount();
        }
    }

    calculateAmount() {
        this.amountDue = "0.00";
        this.amountPaid = "0.00";
        let groupHolidayCamp = [];
        this.holidayCampFolderOveral = [];
        // for (let i = 0; i < this.holidayCampFolder.length; i++) {
        //     let x = this.convertFbObjectToArray(this.holidayCampFolder[i]);
        //     for (let j = 0; j < x.length; j++) {
        //         if (x[j].Group != undefined) {
        //             groupHolidayCamp.push(x[j].Group);
        //         }
        //     }
        // }
        // for (let index = 0; index < groupHolidayCamp.length; index++) {
        //     let gs = this.convertFbObjectToArray(groupHolidayCamp[index]);
        //     for (let sessionIndex = 0; sessionIndex < gs.length; sessionIndex++) {
        //         if (gs[sessionIndex].IsActive) {
        //             this.sessionDetails.push(gs[sessionIndex]);
        //         }
        //     }
        // }
       
        for (let i = 0; i < this.holidayCampFolder.length; i++) {
            if (this.holidayCampFolder[i].Member != undefined) {
                let memberList = this.commonService.convertFbObjectToArray(this.holidayCampFolder[i].Member);
                this.holidayCampFolderOveral.push(this.holidayCampFolder[i]);
                for (let j = 0; j < memberList.length; j++) {
                    // if (memberList[j].IsActive) {
                    this.duecount = this.duecount + 1;
                    this.paidcount = this.paidcount + 1;
                    if (memberList[j].AmountPayStatus == "Due") {
                        this.amountDue = (parseFloat(this.amountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                    } else {
                        this.amountPaid = (parseFloat(this.amountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);
                    }
                    //  }
                }
            }
        }
    }

    calculateCurrentAmount() {

        this.currentAmountDue = "0.00";
        this.currentAmountPaid = "0.00";
        let groupHolidayCamp = [];
        this.holidayCampFolderCurrentTerm = [];

        for (let i = 0; i < this.holidayCampFolder.length; i++) {
            if (this.holidayCampFolder[i].Member != undefined) {
                let memberList = this.commonService.convertFbObjectToArray(this.holidayCampFolder[i].Member);
                for (let k = 0; k < this.clubs.length; k++) {
                    if (this.holidayCampFolder[i].ClubKey == this.clubs[k].$key) {


                        if (this.clubs[k].CurrentTermKey != undefined) {
                            if (new Date(this.holidayCampFolder[i].StartDate).getTime() >= new Date(this.clubs[k].CurrentTermStartDate).getTime() && new Date(this.holidayCampFolder[i].EndDate).getTime() <= new Date(this.clubs[k].CurrentTermEndDate).getTime()) {
                                this.holidayCampFolderCurrentTerm.push(this.holidayCampFolder[i]);
                                for (let j = 0; j < memberList.length; j++) {

                                    this.duecount = this.duecount + 1;

                                    if (memberList[j].AmountPayStatus == "Due") {

                                        this.currentAmountDue = (parseFloat(this.currentAmountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);

                                    } else {
                                        this.currentAmountPaid = (parseFloat(this.currentAmountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);

                                    }

                                }
                            }
                        }
                    }
                }
            }
        }

    }
    onChangeOfCurrentHolidayCamp() {
        this.currentAmountDue = "0.00";
        this.currentAmountPaid = "0.00";
        let groupHolidayCamp = [];
        this.holidayCampFolderCurrentTerm = [];
        if (this.selectedCurrentHolidaycamp != "All") {
            for (let i = 0; i < this.holidayCampFolder.length; i++) {
                if (this.holidayCampFolder[i].$key == this.selectedCurrentHolidaycamp) {
                    if (this.holidayCampFolder[i].Member != undefined) {
                        let memberList = this.commonService.convertFbObjectToArray(this.holidayCampFolder[i].Member);

                        for (let k = 0; k < this.clubs.length; k++) {
                            if (this.holidayCampFolder[i].ClubKey == this.clubs[k].$key) {


                                if (this.clubs[k].CurrentTermKey != undefined) {
                                    if (new Date(this.holidayCampFolder[i].StartDate).getTime() >= new Date(this.clubs[k].CurrentTermStartDate).getTime() && new Date(this.holidayCampFolder[i].EndDate).getTime() <= new Date(this.clubs[k].CurrentTermEndDate).getTime()) {
                                        this.holidayCampFolderCurrentTerm.push(this.holidayCampFolder[i]);
                                        for (let j = 0; j < memberList.length; j++) {

                                            this.duecount = this.duecount + 1;

                                            if (memberList[j].AmountPayStatus == "Due") {

                                                this.currentAmountDue = (parseFloat(this.currentAmountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);

                                            } else {

                                                this.currentAmountPaid = (parseFloat(this.currentAmountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);

                                            }

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            this.calculateCurrentAmount();
        }



    }
    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            this.clubs = data;
            if (this.clubs.length != 0) {
                this.selectedClub = "All";
                this.selectedCurrentClub = "All";
            }
        });
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

    goToPaymentDetailsListPage() {
       
        this.navCtrl.push("HolidayCampPaymentDetails", { AllHolidayCampLists: this.holidayCampFolderOveral });
    }

    goToCurrentPaymentDetailsListPage() {
        this.navCtrl.push("HolidayCampPaymentDetails", { AllHolidayCampLists: this.holidayCampFolderCurrentTerm});
    }

}




