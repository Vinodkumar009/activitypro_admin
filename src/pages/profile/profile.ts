//import { ParentClub } from './../../model/ParentClub';
import { Component } from "@angular/core";
import { Platform, NavController, PopoverController, AlertController } from "ionic-angular";
import { SharedServices } from "../services/sharedservice";
// import { PopoverPage } from '../popover/popover';
import { FirebaseService } from "../../services/firebase.service";
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../services/common.service";
import { Storage } from "@ionic/storage";
import { ToastController, IonicPage } from "ionic-angular";

@IonicPage()
@Component({
  selector: "profile-page",
  templateUrl: "profile.html",
})
export class Profile {
  appType: number = 1;
  themeType: number;
  userDetailsObj = {
    ParentClubName: "",
    ParentClubAdminEmailID: "",
    ContactPhone: "",
    UserKey: "",
  };
  loginUserDetails: any;
  userDetailsObjtemp: any;
  isAndroid: boolean = false;
  profilesetting: string = "Basic";
  selectedParentclubKey: any;
  usersList: any;
  passwordObj = { OldPassword: "", Newpassword: "", ConfirmPassword: "" };

  constructor(
    platform: Platform,
    public storage: Storage,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public sharedservice: SharedServices,
    public fb: FirebaseService,
    private commonService: CommonService,
    public popoverCtrl: PopoverController,
    public iab: InAppBrowser
  ) {
    this.themeType = 1;
    this.isAndroid = platform.is("android");
    storage.get("userObj").then((val) => {
        val = JSON.parse(val);
        this.loginUserDetails = val;
        console.log(this.loginUserDetails);
        let pKey = val.UserInfo[0].ParentClubKey;
        this.selectedParentclubKey = val.UserInfo[0].ParentClubKey;
        this.getUserDetails(pKey);
      }).catch((error) => {});
  }

  getUserDetails(pKey) {
    if (this.loginUserDetails.UserType == "2") {
      const type2$Obs = this.fb.getAllWithQuery(`/ParentClub/Type2/`, { orderByKey: true,equalTo:pKey }).subscribe((data) => {
        type2$Obs.unsubscribe();
        if (data.length > 0) {
          //this.fb.getAll("/ParentClub/Type2/").subscribe((data) => {
          this.userDetailsObj = data[0];
          this.userDetailsObjtemp == data[0];
          console.log(this.userDetailsObj);
        }
      });
    } else if (this.loginUserDetails.UserType == "1") {
      const type1$Obs = this.fb.getAllWithQuery(`/ParentClub/Type1/`, { orderByKey: true,equalTo:pKey }).subscribe((data) => {
        type1$Obs.unsubscribe();
        if (data.length > 0) {
          //for (let i = 0; i < data.length; i++) {
            //if (data[i].$key == pKey) {
              this.userDetailsObj = data[0];
              this.userDetailsObjtemp == data[0];
              console.log(this.userDetailsObj);
            //}
          }
        //}
      });
    }
  }


  updateProfile() {
    console.log(this.userDetailsObj);
    if (this.userDetailsObj.ParentClubName != null) {
      if (this.userDetailsObj.ParentClubAdminEmailID != null) {
        if (this.userDetailsObj.ContactPhone != null) {
          this.fb.update(this.userDetailsObj.UserKey, "/User/", {
            EmailID: this.userDetailsObj.ParentClubAdminEmailID,
            Name: this.userDetailsObj.ParentClubName,
          });
          this.fb.update(this.selectedParentclubKey, "/ParentClub/Type2/", {
            ParentClubAdminEmailID: this.userDetailsObj.ParentClubAdminEmailID,
            ParentClubName: this.userDetailsObj.ParentClubName,
            ContactPhone: this.userDetailsObj.ContactPhone,
          });
          this.loginUserDetails.EmailID =
            this.userDetailsObj.ParentClubAdminEmailID;
          this.loginUserDetails.Name = this.userDetailsObj.ParentClubName;

          this.storage.set("userObj", JSON.stringify(this.loginUserDetails));
          let message = "Profile updated successfully.";
          this.commonService.toastMessage(
            message,
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
        } else {
          let message = "Please enter your contact number";
          this.commonService.toastMessage(
            message,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      } else {
        let message = "Please enter your emailid";
        this.commonService.toastMessage(
          message,
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
      }
    } else {
      let message = "Please enter your user name.";
      this.commonService.toastMessage(
        message,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
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
          let message = "Please enter your newpassword password.";
          this.commonService.toastMessage(
            message,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        } else if (this.passwordObj.ConfirmPassword == "") {
          let message = "Please enter your confirm password.";
          this.commonService.toastMessage(
            message,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        } else if (
          this.passwordObj.Newpassword == this.passwordObj.ConfirmPassword
        ) {
          this.fb.update(this.userDetailsObj.UserKey, "/User/", {
            Password: this.passwordObj.Newpassword,
          });
          this.fb.update(this.selectedParentclubKey, "/ParentClub/Type2/", {
            ParentClubAdminPassword: this.passwordObj.Newpassword,
          });
          this.loginUserDetails.Password = this.passwordObj.Newpassword;
          this.storage.set("userObj", JSON.stringify(this.loginUserDetails));

          let message = "Password changed successfully.";
          this.commonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.passwordObj = {
            OldPassword: "",
            Newpassword: "",
            ConfirmPassword: "",
          };
        } else {
          let message = "New password and confirm password is not matching.";
          this.commonService.toastMessage(
            message,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      } else {
        let message = "Please enter your current password.";
        this.commonService.toastMessage(
          message,
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
      }
    } else {
      let message = "Please enter your current password.";
      this.commonService.toastMessage(
        message,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
    }
  }

  deleteAccount(){
    // let alert = this.alertCtrl.create({
    //   title: 'Delete Account',
    //   message: 'Please contact ActivityPro team (europe@activitypro.co.uk) to delete account',
    //   buttons: [
    //     {
    //       text: 'Okay',
    //       role: 'cancel',
    //       handler: () => {
    //         console.log('Cancel clicked');
    //       }
    //     }
    //   ]
    // });
    // alert.present();
      let memberKeys = [];
        
        memberKeys.push('-N8Y1Wt3zRdjiyhoc3Z6');
        
        let navct = this.navCtrl;
        //const Url = 'https://d26rvu2vnhhr6s.cloudfront.net/';//dev
        const Url =  'https://d2m8fn37d9dbx4.cloudfront.net/'; //prod
        //memberkey is loggedin userkey,memberid's array is for family members
        let iabRef = this.iab.create(
          `${Url}?ParentClubKey=-KuAlAWygfsQX9t_RqNZ&MemberKeys=${memberKeys}&ParentClubId=&MemberIds=&ClubKey=-KuFU3C068bQzKW_9WO2&AppType=${this.appType}`,
          "_blank",
          "location=yes"
        );
        // let iabRef = this.iab.create(
        //     `https://d26rvu2vnhhr6s.cloudfront.net/index.html`,
        //     '_blank','location=yes'
        //   );
          
          

            iabRef.on("loadstop").subscribe(function (event) {
                if (iabRef != undefined) {
                    iabRef.executeScript({
                        code: "document.getElementById('cancel_btn').onclick = function() {\
                        var messageObj = {message: 'close'};\
                        var stringifiedMessageObj = JSON.stringify(messageObj);\
                        if (webkit.messageHandlers.cordova_iab) {\
                                webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);\
                        }\
                    }"});
                        iabRef.show();
                }
            })
            
            iabRef.on("message").subscribe(async (event:InAppBrowserEvent) =>{
                const postObject:any = event;
                if(postObject.data.message == "close"){
                    iabRef.close();
                    navct.setRoot("Dashboard");
                }
            });
            
            iabRef.on("exit").subscribe(function (event) {
                iabRef.close();
                navct.setRoot("Dashboard");
            });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(PopoverPage);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }
}
