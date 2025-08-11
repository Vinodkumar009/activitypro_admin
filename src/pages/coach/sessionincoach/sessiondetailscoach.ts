// import { Dashboard } from '../../dashboard/dashboard';
// session creation for private and one to one

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { CoachMemberAttendance } from './memberattendanceforgroupsession';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
// import { CoachEditMemberAttendance } from './editmemberattendanceforgroupsession';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'sessiondetailscoach-page',
    templateUrl: 'sessiondetailscoach.html'
})

export class CoachSessionDetails {
    themeType: number;
    OldSessionDetails: any;
    sessionOnDays = [];
    sessionOnDates = [];
    parentClubKey: any;
    clubName: any;
    constructor(private toastCtrl: ToastController, public navParams: NavParams, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();

        this.OldSessionDetails = navParams.get('OldSessionDetails');
        this.geClubDetails();
        let days = this.OldSessionDetails.Days.split(",");
        for (let loop = 0; loop < days.length; loop++) {
            switch (days[loop]) {
                case "Sun":
                    this.sessionOnDays.push(0);
                    break;
                case "Mon":
                    this.sessionOnDays.push(1);
                    break;
                case "Tue":
                    this.sessionOnDays.push(2);
                    break;
                case "Wed":
                    this.sessionOnDays.push(3);
                    break;
                case "Thu":
                    this.sessionOnDays.push(4);
                    break;
                case "Fri":
                    this.sessionOnDays.push(5);
                    break;
                case "Sat":
                    this.sessionOnDays.push(6);
                    break;
            }
        }
        this.sessionOnDays = this.sessionOnDays.sort();

        let startDate = new Date(this.OldSessionDetails.StartDate);
        let endDate = new Date(this.OldSessionDetails.EndDate);
        let currentDate = startDate;
        let selectedDatesInSeconds = [];
        for (let j = 0; j < this.sessionOnDays.length; j++) {
            currentDate = startDate;
            for (let i = 1; currentDate.getTime() < endDate.getTime(); i++) {
                if (this.sessionOnDays[j] == currentDate.getDay()) {
                    selectedDatesInSeconds.push(currentDate.getTime());
                }
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
            }
        }
        let x = this.sortTheDates(selectedDatesInSeconds);

        x.forEach(element => {
            let d = new Date(element);
            let month = "";
            switch (d.getMonth()) {
                case 0:
                    month = "Jan";
                    break;
                case 1:
                    month = "Feb";
                    break;
                case 2:
                    month = "Mar";
                    break;
                case 3:
                    month = "Apr";
                    break;
                case 4:
                    month = "May";
                    break;
                case 5:
                    month = "Jun";
                    break;
                case 6:
                    month = "Jul";
                    break;
                case 7:
                    month = "Aug";
                    break;
                case 8:
                    month = "Sep";
                    break;
                case 9:
                    month = "Oct";
                    break;
                case 10:
                    month = "Nov";
                    break;
                case 11:
                    month = "Dec";
                    break;
            }

            this.sessionOnDates.push({ SessionOn: element, Status: "Pending", SessionMonth: month });
        });

        for (let i = 0; i < this.sessionOnDates.length; i++) {
            let year = new Date(this.sessionOnDates[i].SessionOn).getFullYear();
            let month = new Date(this.sessionOnDates[i].SessionOn).getMonth() + 1;
            let date = new Date(this.sessionOnDates[i].SessionOn).getDate();
            if (this.OldSessionDetails[year + "-" + month + "-" + date] != undefined) {
                this.sessionOnDates[i].Status = this.OldSessionDetails[year + "-" + month + "-" + date].AttendanceStatus;
            }
        }
    }
    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
    geClubDetails() {
        this.fb.getAll("/Club/Type2/" + this.OldSessionDetails.ParentClubKey + "/" + this.OldSessionDetails.ClubKey).subscribe((data) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].$key == "ClubName") {
                    this.clubName = data[i].$value;
                }
            }
        });
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
                if (currentElement > arr[loop]) {
                    currentSmallElementIndex = loop;
                    currentElement = arr[loop];
                }
            }
            sortedArray.push(new Date(currentElement));
            arr.splice(currentSmallElementIndex, 1);
        }
        return sortedArray;

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

    // goToAttendance(date) {
    //     if (date.Status == "Pending")
    //         this.navCtrl.push(CoachMemberAttendance, { ChoosenDate: date, sessiondetails: this.OldSessionDetails });
    //     else if (date.Status == "Done") {
    //         this.navCtrl.push(CoachEditMemberAttendance, { ChoosenDate: date, sessiondetails: this.OldSessionDetails });
    //         //let message = "Attenance has already taken for this session";
    //         //this.showToast(message, 6000);
    //     }
    //     else if (date.Status == "Cancel") {
    //         let message = "This session has canceled.";
    //         this.showToast(message, 6000);
    //     }
    // }





    goToAttendance(date) {
        if (date.Status == "Pending")
            this.navCtrl.push("CoachMemberAttendance", { ChoosenDate: date, sessiondetails: this.OldSessionDetails });
        else if (date.Status == "Done" || date.Status == "Canceled") {
            this.navCtrl.push("CoachEditMemberAttendance", { ChoosenDate: date, sessiondetails: this.OldSessionDetails });
        }
        // else if (date.Status == "Cancel") {
        //     let message = "This session has canceled.";
        //     this.showToast(message, 6000);
        // }
    }







}
