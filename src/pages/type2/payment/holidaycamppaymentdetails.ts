// import { Type2PaymentDetailsForGroup } from './../session/updatepaymentdetailsforgroup';
import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';

import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'holidaycamppaymentdetails-page',
    templateUrl: 'holidaycamppaymentdetails.html'
})

export class HolidayCampPaymentDetails {
    ddddddd: string;
    ccccccccccccc: string;
    termKey = "";
    reportType = "";
    selectedDatesInSeconds = [];
    themeType: number;
    isAndroid: boolean = false;

    paymentStatus = "Paid";
    parentClubKey = "";
    allHolidayCampLists = [];
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



    constructor(private alertCtrl: AlertController, public commonService: CommonService, public navParams: NavParams, public fb: FirebaseService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
        storage.get('Currency').then((val) => {
            console.log(val);
            this.currencyDetails = JSON.parse(val);
            // let x = this.circleTitle;
            // this.circleTitle = "";
            // this.circleTitle = this.currencyDetails.CurrencySymbol + "" + x;
            // this.subtitle=this.currencyDetails.CurrencySymbol+this.subtitle ;
        }).catch(error => {
        });

        // this.selectedClub = navParams.get('SelectedClub');
        // this.selectedCoach = navParams.get('SelectedCoach');
        this.allHolidayCampLists = navParams.get('AllHolidayCampLists');
        // this.reportType = navParams.get('ReportType');
        // this.termKey = navParams.get('TermKey');
        // this.clubs = navParams.get('AllClubs');

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;

            }
        })

        this.getPaidMemberList();
        this.getPendingVerficationMemberList();
        this.getDueMemberList();


    }





    getPaidMemberList() {



      
        for (let i = 0; i < this.allHolidayCampLists.length; i++) {
            if (this.allHolidayCampLists[i].Member != undefined) {
           
                let memberList = this.commonService.convertFbObjectToArray(this.allHolidayCampLists[i].Member);
                for (let j = 0; j < memberList.length; j++) {
                    memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                    if (memberList[j].AmountPayStatus == "Paid") {
                    
                        
                        memberList[j].VenueName = this.allHolidayCampLists[i].VenueName;
                        memberList[j].HolidayCampName = this.allHolidayCampLists[i].CampName;
                        memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
     
                        
                     
                       
                       
                       
                        // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        // memberList[j].TransactionDate = new Date(memberList[j].TransactionDate).getDate() + "-" + arr[new Date(memberList[j].TransactionDate).getMonth()] + "-" + new Date(memberList[j].TransactionDate).getFullYear();
                        this.paidMemberList.push(memberList[j]);
                        this.paidMemberListtemp.push(memberList[j]);
                        
                    }
                }
            }
        }

        
        this.paidMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());

        for (let j = 0; j < this.paidMemberList.length; j++) {




            //added by abinash
            this.paidMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.paidMemberList[j].AmountToShow) - parseFloat(this.paidMemberList[j].AmountPaid))).toFixed(2);
            //end


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
                        this.paidMemberList[j].TransactionDate = dateArray[2] + "-" + arr[(parseInt(dateArray[1])-1)] + "-" + dateArray[0];
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
                this.paidMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.paidMemberList[j].AmountToShow) - parseFloat(this.paidMemberList[j].AmountPaid))).toFixed(2);
                //end
            }


            // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            // this.paidMemberList[j].TransactionDate = new Date(this.paidMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.paidMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.paidMemberList[j].TransactionDate).getFullYear();
        }
    }



    getPendingVerficationMemberList() {



        for (let i = 0; i < this.allHolidayCampLists.length; i++) {
            if (this.allHolidayCampLists[i].Member != undefined) {
                let memberList = this.commonService.convertFbObjectToArray(this.allHolidayCampLists[i].Member);
                for (let j = 0; j < memberList.length; j++) {
                    memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                    if (memberList[j].AmountPayStatus == "Pending Verification") {
                     
                        memberList[j].AmountPaid = parseFloat(memberList[j].AmountPaid).toFixed(2);
                        memberList[j].VenueName = this.allHolidayCampLists[i].VenueName;
                        memberList[j].HolidayCampName = this.allHolidayCampLists[i].CampName;
                        this.pendingVerificationMemberList.push(memberList[j]);
                        this.pendingVerificationMemberListtemp.push(memberList[j]);
                       

                    }
                }
            }
        }


        this.pendingVerificationMemberList.sort((d1, d2) => new Date(d2.TransactionDate).getTime() - new Date(d1.TransactionDate).getTime());

        for (let j = 0; j < this.pendingVerificationMemberList.length; j++) {
            //added by abinash
            this.pendingVerificationMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.pendingVerificationMemberList[j].AmountToShow) - parseFloat(this.pendingVerificationMemberList[j].AmountPaid))).toFixed(2);
            //end

            // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            // this.pendingVerificationMemberList[j].TransactionDate = new Date(this.pendingVerificationMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.pendingVerificationMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.pendingVerificationMemberList[j].TransactionDate).getFullYear();
          


            // let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            // this.pendingVerificationMemberList[j].TransactionDate = new Date(this.pendingVerificationMemberList[j].TransactionDate).getDate() + "-" + arr[new Date(this.pendingVerificationMemberList[j].TransactionDate).getMonth()] + "-" + new Date(this.pendingVerificationMemberList[j].TransactionDate).getFullYear();


            if (this.pendingVerificationMemberList[j].TransactionDate != undefined && this.pendingVerificationMemberList[j].TransactionDate != "") {
                let dateArray = (this.pendingVerificationMemberList[j].TransactionDate).split("-");
                if (dateArray.length == 3) {
                   
                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    if (dateArray[1].length < 3) {
                        this.pendingVerificationMemberList[j].TransactionDate = dateArray[2] + "-" + arr[(parseInt(dateArray[1])-1)] + "-" + dateArray[0];
                    }
                }
                else if (dateArray.length == 1) {
                    let dd = new Date(dateArray).getDate().toString();
                    let mm = (new Date(dateArray).getMonth()).toString();
                    let yy = (new Date(dateArray).getFullYear()).toString();

                    dd = (dd.length < 2) ? "0" + dd : dd;
                    mm = (mm.length < 2) ? "0" + mm : mm;


                    let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    this.pendingVerificationMemberList[j].TransactionDate = "";
                    this.pendingVerificationMemberList[j].TransactionDate = dd + "-" + arr[parseInt(mm)] + "-" + yy;

                }

                //added by abinash
                this.pendingVerificationMemberList[j]["DiscountAmountIncludingCharges"] = ((parseFloat(this.pendingVerificationMemberList[j].AmountToShow) - parseFloat(this.pendingVerificationMemberList[j].AmountPaid))).toFixed(2);
                //end
            }









        }
    }


    getDueMemberList() {


        for (let i = 0; i < this.allHolidayCampLists.length; i++) {
            if (this.allHolidayCampLists[i].Member != undefined) {
                let memberList = this.commonService.convertFbObjectToArray(this.allHolidayCampLists[i].Member);
                for (let j = 0; j < memberList.length; j++) {
                    memberList[j].DisplayName = memberList[j].FirstName + " " + memberList[j].LastName;
                    //if (memberList[j].IsActive) {
                    if ((memberList[j].AmountPayStatus == "Due") && (memberList[j].IsActive)) {
                        // for (let k = 0; k < this.clubs.length; k++) {
                        //     if (memberList[j].ClubKey == this.clubs[k].$key) {
                        //         memberList[j].ClubName = this.clubs[k].ClubName;
                        //         memberList[j].ClubShortName = this.clubs[k].ClubShortName;
                        //         break;
                        //     }
                        // }
                        memberList[j].VenueName = this.allHolidayCampLists[i].VenueName;
                        memberList[j].HolidayCampName = this.allHolidayCampLists[i].CampName;
                        memberList[j].AmountDue = parseFloat(memberList[j].AmountDue).toFixed(2);

                        this.dueMemberList.push(memberList[j]);
                        this.dueMemberListtemp.push(memberList[j]);
                        //  this.dueMemberSessionList.push(this.allHolidayCampLists[i]);

                    }
                    //}
                }
            }
        }


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
        this.navCtrl.push("Type2PaymentDetailsForGroup", { SelectedMember: member, SessionDetails: this.pendingVerificationMemberSessionList[index] });
    }
    updateDueMember(member, index) {
        this.navCtrl.push("Type2PaymentDetailsForGroup", { SelectedMember: member, SessionDetails: this.dueMemberSessionList[index] });
    }
    notify(member, pagename) {
        this.navCtrl.push("Type2PaymentNotification", { MemberDetails: member, PageName: pagename });
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
    paymentTabClick() {

    }
    goToDashBoard() {
        this.navCtrl.setRoot("Dashboard");
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



    sendMail() {
        let alert = this.alertCtrl.create({
            // title: 'Confirm purchase',
            subTitle: 'Send Mail',
            message: 'Do you want to send the report as an email?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {

                    }
                }
            ]
        });
        alert.present();
    }


}