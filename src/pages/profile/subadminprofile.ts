//import { ParentClub } from './../../model/ParentClub';
import { Component } from '@angular/core';
import { Platform, NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { PopoverPage } from '../popover/popover';
import { FirebaseService } from '../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'subadminprofile-page',
  templateUrl: 'subadminprofile.html'
})

export class SubAdminProfile {
  themeType: number;
  userDetailsObj = { EmailID: "", Name: "", UserKey:""};
  loginUserDetails: any;
  userDetailsObjtemp: any;
  isAndroid: boolean = false;
  profilesetting: string = "Basic";
  selectedParentclubKey: any;
  usersList: any;
  passwordObj = { OldPassword: "", Newpassword: "", ConfirmPassword: "" };

  constructor(platform: Platform, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, private commonService:CommonService, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.themeType = 1;
    this.isAndroid = platform.is('android');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.loginUserDetails = val;
      console.log(this.loginUserDetails);
      let pKey = val.$key;
      this.selectedParentclubKey = val.UserInfo[0].ParentClubKey;
      this.getUserDetails(pKey);
    }).catch(error => {

    });
  }

  getUserDetails(pKey) {
    let subAdmin$Obs = this.fb.getAllWithQuery(`/User/SubAdmin/`,{orderByKey:true,equalTo:pKey}).subscribe((data) => {
      if (data.length > 0) {
        this.userDetailsObj = data[0];
        this.userDetailsObj.UserKey = data[0].$key;
        this.userDetailsObjtemp == data[0];
        console.log(this.userDetailsObj);
        subAdmin$Obs.unsubscribe();
      }
    });
  }



  updateProfile() {
    console.log(this.userDetailsObj);
    if (this.userDetailsObj.EmailID != null) {
      if (this.userDetailsObj.Name != null) {
          this.fb.update(this.userDetailsObj.UserKey, "/User/SubAdmin/", { EmailID: this.userDetailsObj.EmailID, Name: this.userDetailsObj.Name });
          //this.fb.update(this.selectedParentclubKey, "/ParentClub/Type2/", { ParentClubAdminEmailID: this.userDetailsObj.ParentClubAdminEmailID,ParentClubName: this.userDetailsObj.ParentClubName,ContactPhone:this.userDetailsObj.ContactPhone });
          this.loginUserDetails.EmailID = this.userDetailsObj.EmailID;
          this.loginUserDetails.Name = this.userDetailsObj.Name;
          this.storage.set('userObj', JSON.stringify(this.loginUserDetails));
          this.commonService.toastMessage('Profile updated successfully.',2500,ToastMessageType.Success,ToastPlacement.Bottom);
      }
      else {
        this.commonService.toastMessage('Please enter your emailid.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    }
    else {
      this.commonService.toastMessage('Please enter your user name.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
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
          this.commonService.toastMessage('Please enter your newpassword password.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        else if (this.passwordObj.ConfirmPassword == "") {
          this.commonService.toastMessage('Please enter your confirm password.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        else if (this.passwordObj.Newpassword == this.passwordObj.ConfirmPassword) {
          this.fb.update(this.userDetailsObj.UserKey, "/User/SubAdmin/", { Password: this.passwordObj.Newpassword });
          this.loginUserDetails.Password = this.passwordObj.Newpassword;
          this.storage.set('userObj', JSON.stringify(this.loginUserDetails));
          this.commonService.toastMessage('Password changed successfully.',2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.passwordObj = { OldPassword: "", Newpassword: "", ConfirmPassword: "" };
        }
        else {
          this.commonService.toastMessage('New password and confirm password is not matching.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      }
      else {
        this.commonService.toastMessage('Please enter your current password.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    }
    else {
      this.commonService.toastMessage('Please enter your old password.',2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }

  }






  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: myEvent
    });
  }


}
