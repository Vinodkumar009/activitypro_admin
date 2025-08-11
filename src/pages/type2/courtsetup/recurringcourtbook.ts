import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
//import { Platform } from 'ionic-angular';

import {IonicPage } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'recurringcourtbook-page',
    templateUrl: 'recurringcourtbook.html'
})

export class Type2RecurringCourtBook {
    themeType: number;
    parentClubKey: string;
    allClub = [];
    selectedClub: any;
    allActivityArr = [];
    selectedActivity: any;
    allCourtArr = [];
    selectedCoat: any;
    courtObj = {
        CourtStartDate: '',
        CourtEndDate: '',
        StartTime: '',
        EndTime: '',
        Purpose: '',
        Days: ''
    };
    isSelectMon = false;
    isSelectTue = false;
    isSelectWed = false;
    isSelectThu = false;
    isSelectFri = false;
    isSelectSat = false;
    isSelectSun = false;
    days = [];
    courtBookKey: any;
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
         public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    console.log(this.parentClubKey);
                    this.getClubList();
                    //this.getAllDiscount();
                }
        })
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

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            //alert();
            if (data.length > 0) {
                this.allClub = data;
                this.selectedClub = data[0].$key;
                this.getAllActivity();

            }
        })
    }

    onClubChange() {
        this.getAllActivity();
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.allActivityArr = [];
            if (data.length > 0) {
                this.allActivityArr = data;
                this.selectedActivity = data[0].$key;
                this.getAllCourt();
            }
        })
    }

    getAllCourt() {
        this.fb.getAll("/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/").subscribe((data) => {
            this.allCourtArr = [];
            if (data.length > 0) {
                this.allCourtArr = data;
                this.selectedCoat = data[0].$key;
                console.log(this.allCourtArr);
            }
        })
    }

    selectDays(day, index) {
        let isPresent = false;

        switch (day) {
            case "Mon":
                this.isSelectMon = !this.isSelectMon;


                // this.selectedDayDetails(day);
                break;
            case "Tue":
                this.isSelectTue = !this.isSelectTue;
                //this.selectedDayDetails(day);
                break;
            case "Wed":
                this.isSelectWed = !this.isSelectWed;
                // this.selectedDayDetails(day);
                break;
            case "Thu":
                this.isSelectThu = !this.isSelectThu;
                // this.selectedDayDetails(day);
                break;
            case "Fri":
                this.isSelectFri = !this.isSelectFri;
                //this.selectedDayDetails(day);
                break;
            case "Sat":
                this.isSelectSat = !this.isSelectSat;
                //this.selectedDayDetails(day);
                break;
            case "Sun":
                this.isSelectSun = !this.isSelectSun;
                //this.selectedDayDetails(day);
                break;
        }

        for (let i = 0; i < this.days.length; i++) {
            if (this.days[i] == index) {
                this.days.splice(i, 1);
                isPresent = true;
            }
        }
        if (!isPresent) {
            this.days.push(index);
        }
    }

    selectedDayDetails(day) {

        if (this.courtObj.Days == "") {
            this.courtObj.Days += day;
        }
        else {
            this.courtObj.Days += "," + day;
        }
    }


    saveCourtBooking() {
        this.courtObj.Days = "";
        this.days.sort();
        for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

            switch (this.days[daysIndex]) {
                case 1:
                    this.selectedDayDetails("Mon");
                    break;
                case 2:
                    this.selectedDayDetails("Tue");
                    break;
                case 3:
                    this.selectedDayDetails("Wed");
                    break;
                case 4:
                    this.selectedDayDetails("Thu");
                    break;
                case 5:
                    this.selectedDayDetails("Fri");
                    break;
                case 6:
                    this.selectedDayDetails("Sat");
                    break;
                case 7:
                    this.selectedDayDetails("Sun");
                    break;
            }
        }
        if (this.validateCourtBooking()) {
            let coatKey = this.selectedCoat;
            this.courtBookKey = this.fb.saveReturningKey("/CourtBooking/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/" + coatKey + "/", this.courtObj);
            if (this.courtBookKey != undefined) {
                let message = "Successfully Saved";
                this.showToast(message, 3000);
                this.navCtrl.pop();
            }
        }
    }

    cancelCourtBooking() {
        this.navCtrl.pop();
    }

    validateCourtBooking(): boolean {
        if (this.selectedClub == "" || this.selectedClub == undefined) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.selectedActivity == "" || this.selectedActivity == undefined) {
            let message = "Please select an activity.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.selectedCoat == "" || this.selectedCoat == undefined) {
            let message = "Please select a coat.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.courtObj.CourtStartDate == "" || this.courtObj.CourtStartDate == undefined) {
            let message = "Please select start date.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.courtObj.CourtEndDate == "" || this.courtObj.CourtEndDate == undefined) {
            let message = "Please select end date.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.courtObj.Days == "" || this.courtObj.Days == undefined) {
            let message = "Please select days.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.courtObj.StartTime == "" || this.courtObj.StartTime == undefined) {
            let message = "Please enter start time.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.courtObj.EndTime == "" || this.courtObj.EndTime == undefined) {
            let message = "Please enter end time.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.courtObj.Purpose == "" || this.courtObj.Purpose == undefined) {
            let message = "Please select a purpose.";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }




}
