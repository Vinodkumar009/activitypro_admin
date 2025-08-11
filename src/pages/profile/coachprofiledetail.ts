//import { ParentClub } from './../../model/ParentClub';
import { Component } from '@angular/core';
import { Platform, NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { PopoverPage } from '../popover/popover';
import { FirebaseService } from '../../services/firebase.service';
import { Storage } from '@ionic/storage';

import { ToastController,IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'coachprofiledetail-page',
    templateUrl: 'coachprofiledetail.html'
})

export class CoachProfileDetails {
    themeType: number;
    coachDetailsObj = { FirstName: "", EmailID: "", PhoneNumber: "", DBSNumber: "", DOB: "", DetailDescription: "", Gender: "", LastName: "", Recognition: "", RegistrationNumber: "", ShortDescription: "" };
    loginUserDetails: any;
    userDetailsObjtemp: any;
    isAndroid: boolean = false;
    profilesetting: string = "Basic";
    selectedParentclubKey: any;
    usersList: any;
    passwordObj = { OldPassword: "", Newpassword: "", ConfirmPassword: "" };
    userkey: any;
    coachKey: any;
    coachInfoObj: any;
    responseDetails: any;
    constructor(public navParams: NavParams, public toastCtrl: ToastController, platform: Platform, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
        this.themeType = 1;
        this.isAndroid = platform.is('android');
        this.coachInfoObj = navParams.get('CoachInfo');
        console.log(this.coachInfoObj);
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            this.loginUserDetails = val;
            //console.log(this.loginUserDetails);
            //let pKey = val.UserInfo[0].ParentClubKey;
            this.coachKey = val.UserInfo[0].CoachKey;
            this.selectedParentclubKey = val.UserInfo[0].ParentClubKey;
        }).catch(error => {

        });
        storage.get('UserKey').then((val) => {
            //val = JSON.parse(val);
            this.userkey = JSON.parse(val);


        }).catch(error => {

        });
    }

    updateCoachInfo() {
        if (this.validateCoachInfo()) {
            this.fb.update(this.userkey, "/User/Coach/", { EmailID: this.coachInfoObj.EmailID, Name: this.coachInfoObj.FirstName });
            this.responseDetails = this.fb.update(this.coachKey, "/Coach/Type2/" + this.selectedParentclubKey, { EmailID: this.coachInfoObj.EmailID, FirstName: this.coachInfoObj.FirstName, PhoneNumber: this.coachInfoObj.PhoneNumber, DBSNumber: this.coachInfoObj.DBSNumber, DOB: this.coachInfoObj.DOB, DetailDescription: this.coachInfoObj.DetailDescription, Gender: this.coachInfoObj.Gender, LastName: this.coachInfoObj.LastName, Recognition: this.coachInfoObj.Recognition, RegistrationNumber: this.coachInfoObj.RegistrationNumber, ShortDescription: this.coachInfoObj.ShortDescription });
            this.loginUserDetails.EmailID = this.coachInfoObj.EmailID;
            this.loginUserDetails.Name = this.coachInfoObj.FirstName;

            this.storage.set('userObj', JSON.stringify(this.loginUserDetails));

            if (this.responseDetails != undefined) {
                let toast = this.toastCtrl.create({
                    message: 'Coach profile successfully updated.',
                    duration: 2000,
                });
                toast.present();
                this.navCtrl.pop();
            }
        }
    }

    cancelCoachDetails() {
        this.navCtrl.pop();
    }



    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
            ev: myEvent
        });
    }

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    validateCoachInfo(): boolean{
        if (this.coachInfoObj.FirstName == "" || this.coachInfoObj.FirstName == undefined) {
            let message = "Please enter first name.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.LastName == "" || this.coachInfoObj.LastName == undefined) {
            let message = "Please enter last name.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.EmailID == "" || this.coachInfoObj.EmailID == undefined) {
            let message = "Please enter email id.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.PhoneNumber == "" || this.coachInfoObj.PhoneNumber == undefined) {
            let message = "Please enter phone number.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.Gender == "" || this.coachInfoObj.Gender == undefined) {
            let message = "Please select gender.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.DOB == "" || this.coachInfoObj.DOB == undefined) {
            let message = "Please select dob.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.RegistrationNumber == "" || this.coachInfoObj.RegistrationNumber == undefined) {
            let message = "Please enter registration number.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.Recognition == "" || this.coachInfoObj.Recognition == undefined) {
            let message = "Please enter recognition.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.DBSNumber == "" || this.coachInfoObj.DBSNumber == undefined) {
            let message = "Please enter DBS number.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.DetailDescription == "" || this.coachInfoObj.DetailDescription == undefined) {
            let message = "Please enter detail description.";
            this.showToast(message, 3000);
            return false;
        }
        else if (this.coachInfoObj.ShortDescription == "" || this.coachInfoObj.ShortDescription == undefined) {
            let message = "Please enter short description.";
            this.showToast(message, 3000);
            return false;
        }
        return true;
    }


}
