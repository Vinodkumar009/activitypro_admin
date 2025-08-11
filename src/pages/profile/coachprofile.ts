//import { ParentClub } from './../../model/ParentClub';
import { Component } from '@angular/core';
import { Platform, NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { PopoverPage } from '../popover/popover';
import { FirebaseService } from '../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { Storage } from '@ionic/storage';
//import { CoachProfileDetails } from './coachprofiledetail';

import { ToastController,IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'coachprofile-page',
    templateUrl: 'coachprofile.html'
})

export class CoachProfile {
    themeType: number;
    userDetailsObj = { FirstName: "",LastName:"", EmailID: "", PhoneNumber: "", UserKey: "" };
    loginUserDetails: any;
    userDetailsObjtemp: any;
    isAndroid: boolean = false;
    profilesetting: string = "Basic";
    selectedParentclubKey: any;
    usersList: any;
    passwordObj = { OldPassword: "", Newpassword: "", ConfirmPassword: "" };
    userkey:any;
    coachKey:any;
    constructor(platform: Platform, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, private commonService:CommonService, public popoverCtrl: PopoverController) {
        this.themeType = 1;
        this.isAndroid = platform.is('android');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            this.loginUserDetails = val;
            this.coachKey = val.UserInfo[0].CoachKey;
            this.selectedParentclubKey = val.UserInfo[0].ParentClubKey;
            this.getUserDetails(this.coachKey);
        }).catch(error => {

        });
        storage.get('UserKey').then((val) => {
            //val = JSON.parse(val);
            this.userkey = JSON.parse(val);


        }).catch(error => {

        });
    }

    getUserDetails(coachKey) {
        if (this.loginUserDetails.UserType == "2") {
            this.fb.getAll("/Coach/Type2/" + this.selectedParentclubKey + "/").subscribe((data) => {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].$key == coachKey) {
                            this.userDetailsObj = data[i];
                            this.userDetailsObjtemp == data[i];
                            console.log(this.userDetailsObj);
                        }
                    }
                }
            });
        }
    }



    updateProfile() {
        console.log(this.userDetailsObj);
        if (this.userDetailsObj.FirstName != null) {
            if (this.userDetailsObj.EmailID != null) {
                if (this.userDetailsObj.PhoneNumber != null) {
                    this.fb.update(this.userkey, "/User/Coach/", { EmailID: this.userDetailsObj.EmailID, Name: this.userDetailsObj.FirstName + " " + this.userDetailsObj.LastName });
                    this.fb.update(this.coachKey, "/Coach/Type2/" + this.selectedParentclubKey , { EmailID: this.userDetailsObj.EmailID, FirstName: this.userDetailsObj.FirstName,LastName: this.userDetailsObj.LastName, PhoneNumber: this.userDetailsObj.PhoneNumber });
                    this.loginUserDetails.EmailID = this.userDetailsObj.EmailID;
                    this.loginUserDetails.Name = this.userDetailsObj.FirstName + " " +this.userDetailsObj.LastName;

                    this.storage.set('userObj', JSON.stringify(this.loginUserDetails));
                    
                    let message = 'Profile updated successfully.'
                    this.commonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom)
                }
                else {
                    let message = 'Please enter your contact number'
                    this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
                }
            }
            else {
                let message = 'Please enter your emailid'
                this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
        }
        else {
            let message = 'Please enter your user name.'
            this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }

    }
    cancelProfile() {
        this.navCtrl.pop();
    }
    cancelPassword() {
        this.navCtrl.pop();
    }
      resetPassword() {

        if (this.passwordObj.OldPassword != null) {
          if (this.passwordObj.OldPassword == this.loginUserDetails.Password) {
            if (this.passwordObj.Newpassword == "") {
              let message = 'Please enter your new password.'
              this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
            else if (this.passwordObj.ConfirmPassword == "") {
              let message = 'Please enter your confirm password.'
              this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
            else if (this.passwordObj.Newpassword == this.passwordObj.ConfirmPassword) {
              this.fb.update(this.userkey, "/User/Coach/", { Password: this.passwordObj.Newpassword });
              this.fb.update(this.coachKey, "/Coach/Type2/"+ this.selectedParentclubKey , { Password: this.passwordObj.Newpassword });
              this.loginUserDetails.Password = this.passwordObj.Newpassword;
              this.storage.set('userObj', JSON.stringify(this.loginUserDetails));
              
              let message = 'Password changed successfully.'
              this.commonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
              this.passwordObj = { OldPassword: "", Newpassword: "", ConfirmPassword: "" };

            }
            else {
              let message = 'New password and confirm password is not matching.'
              this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
          }
          else {
            let message = 'Please enter your current password.'
            this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
        }
        else {
          let message = 'Please enter your current password.'
          this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
          
        }

      }






    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
            ev: myEvent
        });
    }

    moreProfileUpdate(){
        console.log(this.userDetailsObj);
        this.navCtrl.push("CoachProfileDetails",{CoachInfo:this.userDetailsObj});
    }

}
