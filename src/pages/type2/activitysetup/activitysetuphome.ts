import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { Dashboard } from './../../dashboard/dashboard';
import {ToastController } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';


@IonicPage()
@Component({
    selector: 'activitysetuphome-page',
    templateUrl: 'activitysetuphome.html'
})

export class Type2ActivitySetupHome {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
        WebIcon:string;
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    allClub: any;
    selectedClub: any;
    allActivityArr = [];
    selectedActivity: any;
    activitySetupDetails = {
        StartTime: '',
        EndTime: '',
        IndoorMemberPeakFeeFor1st30Min: '',
        IndoorMemberPeakFeeForEvry30Min:'',
        IndoorMemberOffPeakFeeFor1st30Min: '',
        IndoorMemberOffPeakFeeForEvry30Min: '',
        IndoorMemberStandardFeeFor1st30Min: '',
        IndoorMemberStandardFeeForForEvry30Min: '',
        OutdoorMemberPeakFeeFor1st30Min: '',
        OutdoorMemberPeakFeeForEvry30Min: '',
        OutdoorMemberOffPeakFeeFor1st30Min: '',
        OutdoorMemberOffPeakFeeForEvry30Min: '',
        OutdoorMemberStandardFeeFor1st30Min: '',
        OutdoorMemberStandardFeeForEvry30Min: '',
        AdvanceMaxBookingDaysBefore: '',
        AdvanceBookingMaxDays: '',
        MaxBookingHours: '',
        MaxBookingHoursPerDay:'',
        AdjustFreeBookingHoursPerDay: '',
        AdvanceMaxFreeBookingHoursPerDayByCoach: '',
        OnlinePayment: true,
        Days: ''
    }
    isSelectMon = false;
    isSelectTue = false;
    isSelectWed = false;
    isSelectThu = false;
    isSelectFri = false;
    isSelectSat = false;
    isSelectSun = false;
    days = [];
    activitySetupKey: any;
    indoorActivitySetupKey: any;
    outdoorActivitySetupKey: any;
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();



        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    //console.log(this.parentClubKey);
                    this.getClubList();

                }
        })
    }


    goTo(obj) {
        this.navCtrl.push(obj.component);
    }
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
            ev: myEvent
        });
    }


    goToDashboardMenuPage() {
        this.navCtrl.setRoot(Dashboard);
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

        if (this.activitySetupDetails.Days == "") {
            this.activitySetupDetails.Days += day;
        }
        else {
            this.activitySetupDetails.Days += "," + day;
        }
    }

    cancelActivitySetup() {
        this.navCtrl.pop();
    }

    saveActivitySetup() {
        this.activitySetupDetails.Days = "";
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
        let activityKey = this.selectedActivity;
        let activitySetupDetailsObj = { StartTime: "", EndTime: "",AdvanceBookingMaxDays: "", MaxBookingHours: "",MaxBookingHoursPerDay:"", AdjustFreeBookingHoursPerDay: "", AdvanceMaxFreeBookingHoursPerDayByCoach: "", OnlinePayment: false, Days: "" };
        let indoorActivitySetupDetailsObj = { IndoorMemberPeakFeeFor1st30Min: "", IndoorMemberPeakFeeForEvry30Min: "", IndoorMemberOffPeakFeeFor1st30Min: "",IndoorMemberOffPeakFeeForEvry30Min:"",IndoorMemberStandardFeeFor1st30Min:"",IndoorMemberStandardFeeForForEvry30Min:"" };
        let outdoorActivitySetupDetailsObj = { OutdoorMemberPeakFeeFor1st30Min: "", OutdoorMemberPeakFeeForEvry30Min: "", OutdoorMemberOffPeakFeeFor1st30Min: "",OutdoorMemberOffPeakFeeForEvry30Min:"",OutdoorMemberStandardFeeFor1st30Min:"",OutdoorMemberStandardFeeForEvry30Min:"" };
        
        activitySetupDetailsObj.StartTime = this.activitySetupDetails.StartTime;
        activitySetupDetailsObj.EndTime = this.activitySetupDetails.EndTime;
        activitySetupDetailsObj.AdvanceBookingMaxDays = this.activitySetupDetails.AdvanceBookingMaxDays;
        activitySetupDetailsObj.MaxBookingHours = this.activitySetupDetails.MaxBookingHours;
        activitySetupDetailsObj.MaxBookingHoursPerDay = this.activitySetupDetails.MaxBookingHoursPerDay;
        activitySetupDetailsObj.AdjustFreeBookingHoursPerDay = this.activitySetupDetails.AdjustFreeBookingHoursPerDay;
        activitySetupDetailsObj.AdvanceMaxFreeBookingHoursPerDayByCoach = this.activitySetupDetails.AdvanceMaxFreeBookingHoursPerDayByCoach;
        activitySetupDetailsObj.OnlinePayment = this.activitySetupDetails.OnlinePayment;
        activitySetupDetailsObj.Days = this.activitySetupDetails.Days;

        indoorActivitySetupDetailsObj.IndoorMemberPeakFeeFor1st30Min = this.activitySetupDetails.IndoorMemberPeakFeeFor1st30Min;
        indoorActivitySetupDetailsObj.IndoorMemberPeakFeeForEvry30Min = this.activitySetupDetails.IndoorMemberPeakFeeForEvry30Min;
        indoorActivitySetupDetailsObj.IndoorMemberOffPeakFeeFor1st30Min = this.activitySetupDetails.IndoorMemberOffPeakFeeFor1st30Min;
        indoorActivitySetupDetailsObj.IndoorMemberOffPeakFeeForEvry30Min = this.activitySetupDetails.IndoorMemberOffPeakFeeForEvry30Min;
        indoorActivitySetupDetailsObj.IndoorMemberStandardFeeFor1st30Min = this.activitySetupDetails.IndoorMemberStandardFeeFor1st30Min;
        indoorActivitySetupDetailsObj.IndoorMemberStandardFeeForForEvry30Min = this.activitySetupDetails.IndoorMemberStandardFeeForForEvry30Min;

        outdoorActivitySetupDetailsObj.OutdoorMemberPeakFeeFor1st30Min = this.activitySetupDetails.OutdoorMemberPeakFeeFor1st30Min;
        outdoorActivitySetupDetailsObj.OutdoorMemberPeakFeeForEvry30Min = this.activitySetupDetails.OutdoorMemberPeakFeeForEvry30Min;
        outdoorActivitySetupDetailsObj.OutdoorMemberOffPeakFeeFor1st30Min = this.activitySetupDetails.OutdoorMemberOffPeakFeeFor1st30Min;
        outdoorActivitySetupDetailsObj.OutdoorMemberOffPeakFeeForEvry30Min = this.activitySetupDetails.OutdoorMemberOffPeakFeeForEvry30Min;
        outdoorActivitySetupDetailsObj.OutdoorMemberStandardFeeFor1st30Min = this.activitySetupDetails.OutdoorMemberStandardFeeFor1st30Min;
        outdoorActivitySetupDetailsObj.OutdoorMemberStandardFeeForEvry30Min = this.activitySetupDetails.OutdoorMemberStandardFeeForEvry30Min;

        this.activitySetupKey = this.fb.saveReturningKey("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/" + activityKey + "/ActivitySetup/", activitySetupDetailsObj);
        if (this.activitySetupKey != undefined) {
            this.indoorActivitySetupKey = this.fb.saveReturningKey("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/" + activityKey + "/ActivitySetup/" + this.activitySetupKey + "/Indoor/", indoorActivitySetupDetailsObj);
            this.outdoorActivitySetupKey = this.fb.saveReturningKey("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/" + activityKey + "/ActivitySetup/" + this.activitySetupKey + "/Outdoor/", outdoorActivitySetupDetailsObj);
            
            let message = "Successfully Saved";
            this.showToast(message, 3000);
            this.navCtrl.pop();
        }

    }
}
