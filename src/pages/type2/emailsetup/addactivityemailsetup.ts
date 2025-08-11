import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { ToastController } from 'ionic-angular';
//import { Platform } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'addactivityemailsetup-page',
    templateUrl: 'addactivityemailsetup.html'
})

export class Type2AddActivityEmailSetup {
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
    responseDetails: any;
    selectedClub: any;
    allClub = [];
    promotionObj = {
        PromotionTitle: '',
        StartDate: '',
        EndDate: '',
        Description: '',
        PromotionType: '',
        SlideShowSpeed: '',
        Sequence: ''
    }
    imageArr = [];
    imageObj = {
        ImagePath: '',
        ImageToShow: true
    };
    promotionKey: any;
    toppings: any;
    isSelectAll = false;
    isUnselectAll = false;
    selectedClubArr = [];
    selectdClubActivity = [];
    selectdClubActivityArr = [];
    selectedActivityArr = [];
    isSelectActivityAll = false;
    selectedParentclubKey: any;
    clubcall: any;
    clubs: any;
    selectedclub: any;
    selectedClubKey: any;
    act: any;
    activities: any;
    selectedActivities: any;
    emailSetupObj = {
        EmailSetupName: 'All Communication',
        SessionOnlinePayment: '',
        CourtBooking: '',
        RoomBooking: '',
        MembertoCoach: '',
        MemberForSessionQuery: '',
        HolidaycampBookingPayment: '',
        SchoolSessionBookingPayment: '',
        HolidaycampQuery: '',
        SchoolSessionQuery: '',
        MemberSessionEnrollment: '',
        CashPayment: '',
        BACSPayment: ''
    }
    emailSetupKey: any;
    setup: any;
    selectedActivity: any;
    selectedclubkey: any;
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public navParam: NavParams, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();

        this.setup = this.navParam.get('setup')
        this.selectedclubkey = this.navParam.get('selectedclubkey')
        this.selectedActivity = this.navParam.get('selectedActivity')

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.selectedParentclubKey = club.ParentClubKey;
                    if(this.setup != undefined){
                        this.emailSetupObj  = JSON.parse(JSON.stringify(this.setup))
                    }else{
                        this.fb.getAllWithQuery(`ParentClub/Type2/`,{orderByKey:true,equalTo:this.selectedParentclubKey}).subscribe((data)=>{
                            this.emailSetupObj.BACSPayment = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.CashPayment = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.CourtBooking = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.HolidaycampBookingPayment = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.HolidaycampQuery = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.MemberForSessionQuery = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.MemberSessionEnrollment = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.MembertoCoach = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.RoomBooking = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.SchoolSessionBookingPayment = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.SchoolSessionQuery = data[0].ParentClubAdminEmailID;
                            this.emailSetupObj.SessionOnlinePayment = data[0].ParentClubAdminEmailID;
                        })
                    }
                    
                   
                    this.clubcall = this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentclubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
                        this.clubs = data;
                        if (data.length > 0) {
                            this.selectedclub = data[0];
                            this.selectedClubKey = data[0].$key;
                            // this.getActivities();
                            // this.selectedClubKey = data[0].$key;
                            //this.getActivities();
                            for (let i = 0; i < this.clubs.length; i++) {
                                this.act = this.fb.getAll("/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key).subscribe((data) => {


                                    this.activities = data;
                                    if (data.length > 0) {
                                        this.clubs[i].IsSelected = false;
                                        if(this.setup != undefined && this.clubs[i].$key == this.selectedclubkey){
                                            this.clubs[i].IsSelected = true;
                                        }
                                        this.clubs[i].Activities = data;
                                        //this.clubs[i].TempActivities = [];
                                        this.selectedActivities = data[0];
                                        if (this.clubs[i].Activities.length != undefined) {
                                            for (let j = 0; j < this.clubs[i].Activities.length; j++) {
                                                this.clubs[i].Activities[j].IsSelected = false;
                                                if(this.setup != undefined && this.clubs[i].$key == this.selectedclubkey && this.clubs[i].Activities[j].$key == this.selectedActivity){
                                                    this.clubs[i].Activities[j].IsSelected = true; 
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
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

    cancelEmailSetup() {
        this.navCtrl.pop();
    }

    saveEmailSetup() {
        if (this.validateEmailSetup()) {
            for (let i = 0; i < this.clubs.length; i++) {
                if (this.clubs[i].IsSelected == true) {
                    this.clubs[i].IsChecked = true;
                    for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                        if (this.clubs[i].Activities[k].IsSelected == true) {
                            this.clubs[i].Activities[k].IsChecked = true;
                        }

                    }
                }
            }


            for (let i = 0; i < this.clubs.length; i++) {
                if (this.clubs[i].IsChecked == true) {
                    if (this.clubs[i].Activities != undefined) {
                        for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                            if (this.clubs[i].Activities[k].IsChecked == true) {
                                this.emailSetupKey = this.fb.saveReturningKey("/EmailSetup/Type2/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/ActivityEmailSetup/" + this.clubs[i].Activities[k].$key + "/", this.emailSetupObj);

                            }

                        }
                    }

                }
            }
            if (this.emailSetupKey != undefined) {
                let message = "Saved successfully";
                this.showToast(message, 2000);
                this.navCtrl.pop();
            }
        }

    }


    validateEmailSetup(): boolean {
        let flag = false;
        let flag1 = false;
        for (let i = 0; i < this.clubs.length; i++) {
            if (this.clubs[i].IsSelected == true) {
                flag = true;
                break;
            }
        }
        if (flag) {
            if (this.emailSetupObj.EmailSetupName == "" || this.emailSetupObj.EmailSetupName == undefined) {
                let message = "Please enter email setup name.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.SessionOnlinePayment == "" || this.emailSetupObj.SessionOnlinePayment == undefined) {
                let message = "Please enter email in session online payment.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.CourtBooking == "" || this.emailSetupObj.CourtBooking == undefined) {
                let message = "Please enter email in court booking.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.RoomBooking == "" || this.emailSetupObj.RoomBooking == undefined) {
                let message = "Please enter email in room booking.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.MembertoCoach == "" || this.emailSetupObj.MembertoCoach == undefined) {
                let message = "Please enter email in member to coach.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.MemberForSessionQuery == "" || this.emailSetupObj.MemberForSessionQuery == undefined) {
                let message = "Please enter email in member for session query.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.HolidaycampBookingPayment == "" || this.emailSetupObj.HolidaycampBookingPayment == undefined) {
                let message = "Please enter email in holiday camp booking payment.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.SchoolSessionBookingPayment == "" || this.emailSetupObj.SchoolSessionBookingPayment == undefined) {
                let message = "Please enter email in school session booking payment.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.HolidaycampQuery == "" || this.emailSetupObj.HolidaycampQuery == undefined) {
                let message = "Please enter email in holiday camp query.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.SchoolSessionQuery == "" || this.emailSetupObj.SchoolSessionQuery == undefined) {
                let message = "Please enter email in school session query.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.MemberSessionEnrollment == "" || this.emailSetupObj.MemberSessionEnrollment == undefined) {
                let message = "Please enter email in member session enrollment.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.CashPayment == "" || this.emailSetupObj.CashPayment == undefined) {
                let message = "Please enter email in cash payment.";
                this.showToast(message, 3000);
                return false;
            }
            else if (this.emailSetupObj.BACSPayment == "" || this.emailSetupObj.BACSPayment == undefined) {
                let message = "Please enter email in BACS payment.";
                this.showToast(message, 3000);
                return false;
            }
            if (this.emailSetupObj.SessionOnlinePayment != "") {
                if (!this.validateEmail(this.emailSetupObj.SessionOnlinePayment)) {
                    let message = "Enter correct session online payment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.CourtBooking != "") {
                if (!this.validateEmail(this.emailSetupObj.CourtBooking)) {
                    let message = "Enter correct court booking email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.RoomBooking != "") {
                if (!this.validateEmail(this.emailSetupObj.RoomBooking)) {
                    let message = "Enter correct room booking email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.MembertoCoach != "") {
                if (!this.validateEmail(this.emailSetupObj.MembertoCoach)) {
                    let message = "Enter correct member to coach email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.MemberForSessionQuery != "") {
                if (!this.validateEmail(this.emailSetupObj.MemberForSessionQuery)) {
                    let message = "Enter correct member for session query email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.HolidaycampBookingPayment != "") {
                if (!this.validateEmail(this.emailSetupObj.HolidaycampBookingPayment)) {
                    let message = "Enter correct holiday camp booking payment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.SchoolSessionBookingPayment != "") {
                if (!this.validateEmail(this.emailSetupObj.SchoolSessionBookingPayment)) {
                    let message = "Enter correct school session booking payment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.HolidaycampQuery != "") {
                if (!this.validateEmail(this.emailSetupObj.HolidaycampQuery)) {
                    let message = "Enter correct holiday camp query email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.SchoolSessionQuery != "") {
                if (!this.validateEmail(this.emailSetupObj.SchoolSessionQuery)) {
                    let message = "Enter correct school session query email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.MemberSessionEnrollment != "") {
                if (!this.validateEmail(this.emailSetupObj.MemberSessionEnrollment)) {
                    let message = "Enter correct member session enrollment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.CashPayment != "") {
                if (!this.validateEmail(this.emailSetupObj.CashPayment)) {
                    let message = "Enter correct cash payment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
            if (this.emailSetupObj.BACSPayment != "") {
                if (!this.validateEmail(this.emailSetupObj.BACSPayment)) {
                    let message = "Enter correct BACS payment email id.";
                    this.showToast(message, 3000);
                    return false;
                }
            }
        }
        else if (!flag) {
            let message = "Please select a club.";
            this.showToast(message, 3000);
            return false;
        }
        for (let j = 0; j < this.clubs.length; j++) {
                if (this.clubs[j].IsSelected == true) {
                    if (this.clubs[j].Activities != undefined) {
                        for (let k = 0; k < this.clubs[j].Activities.length; k++) {
                            if (this.clubs[j].Activities[k].IsSelected == true) {
                                flag1 = true;
                                break;
                            }
                        }
                    }
                }
        }
        if (!flag1) {
            let message = "Please select activity.";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }


    gototUpdate(){
        if (this.validateEmailSetup()) {
            for (let i = 0; i < this.clubs.length; i++) {
                if (this.clubs[i].IsSelected == true) {
                    this.clubs[i].IsChecked = true;
                    for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                        if (this.clubs[i].Activities[k].IsSelected == true) {
                            this.clubs[i].Activities[k].IsChecked = true;
                        }

                    }
                }
            }


            for (let i = 0; i < this.clubs.length; i++) {
                if (this.clubs[i].IsChecked == true) {
                    if (this.clubs[i].Activities != undefined) {
                        for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                            if (this.clubs[i].Activities[k].IsChecked == true) {
                                
                                let Key = this.emailSetupObj['$key'] 
                                delete this.emailSetupObj['$key']
                                this.emailSetupKey = this.fb.update(Key, "/EmailSetup/Type2/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/ActivityEmailSetup/" + this.clubs[i].Activities[k].$key + "/", this.emailSetupObj);

                            }

                        }
                    }

                }
            }
            if (this.emailSetupKey != undefined) {
                let message = "Saved successfully";
                this.showToast(message, 2000);
                this.navCtrl.pop();
            }
        }

    }
}
