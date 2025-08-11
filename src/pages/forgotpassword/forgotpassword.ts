import { FirebaseService } from '../../services/firebase.service';
import { Component } from '@angular/core';

import { NavController,IonicPage } from 'ionic-angular';

import { SharedServices } from '../services/sharedservice';
import { ToastController } from 'ionic-angular';
import * as $ from 'jquery';
import { CommonService,ToastMessageType,ToastPlacement } from '../../services/common.service';
import { Keyboard } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
@IonicPage()
@Component({
    selector: 'forgotpassword-page',
    templateUrl: 'forgotpassword.html'
})

export class ForgotPassword {
    themeType: number;
    clubObj = {
        EmailID: ''
    };
    allmember = [];
    userInfoArr = [];
    allcoach = [];
    allClubCoachArr = []
    isKeyBoardOpen:boolean = false;
    constructor(private keyboard: Keyboard,public commonService:CommonService,public toastCtrl: ToastController, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService) {
        this.themeType = sharedservice.getThemeType();
        // this.getAllMember();
        // this.getAllCoach();
    }
    goToLogin() {
        this.navCtrl.pop();
    }

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

 

    geteneratePassword() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
        //console.log(retVal);
    }

    // getAllMember() {
    //    const member$obs = this.fb.getAll("/User/").subscribe((data1) => {
    //     member$obs.unsubscribe();
    //         if (data1.length > 0) {
    //             this.allmember = data1;
    //             //console.log(this.allmember);
    //         }
    //     });
    // }

    // getAllCoach() {
    //     const coach$Obs = this.fb.getAll("/User/Coach/").subscribe((data1) => {
    //         coach$Obs.unsubscribe();
    //         if (data1.length > 0) {
    //             this.allcoach = data1;
    //             //console.log(this.allcoach);
    //         }
    //     });
    // }

    // setPassword1() { //old code
    //   //  this.offKeyBoard();
    //     this.allmember.splice(-2, 2);
    //     //console.log(this.allmember);
    //     //console.log(this.allcoach);
    //     this.allClubCoachArr = [];
    //     for (let memberindex = 0; memberindex < this.allmember.length; memberindex++) {
    //         this.allClubCoachArr.push(this.allmember[memberindex]);
    //     }

    //     for (let coachindex = 0; coachindex < this.allcoach.length; coachindex++) {
    //         this.allClubCoachArr.push(this.allcoach[coachindex]);
    //     }
    //     console.log(this.allClubCoachArr);
    //     let isExccute = false;
    //     if (this.validateClubEmail()) {
    //         if (this.allClubCoachArr.length != undefined) {
    //             for (let i = 0; i < this.allClubCoachArr.length; i++) {
    //                 if (this.allClubCoachArr[i].EmailID != undefined || this.allClubCoachArr[i].EmailID != null) {
    //                     if (this.clubObj.EmailID.toLowerCase() == this.allClubCoachArr[i].EmailID.toLowerCase()) {
    //                         this.userInfoArr = this.commonService.convertFbObjectToArray(this.allClubCoachArr[i].UserInfo);
    //                         let genPassword = this.geteneratePassword();
    //                         if (this.allClubCoachArr[i].RoleType == 4) {
    //                             this.fb.update(this.allClubCoachArr[i].$key, "/User/Coach/", { Password: genPassword });
    //                             this.fb.update(this.userInfoArr[0].CoachKey, "/Coach/Type2/" + this.userInfoArr[0].ParentClubKey + "/", { Password: genPassword });
    //                             isExccute = true;
    //                     //http://54.84.255.41:8121    DEVLOPEMENT 

    //                     //http://54.225.106.22:8081   Production
    //                             $.ajax({
    //                                 url: "https://emailap.activitypro.co.uk/umbraco/surface/ActivityProSurface/SendResetPasswordMail/",
    //                                 data: {
    //                                     CUSTOMER_EMAIL: this.allClubCoachArr[i].EmailID, //"susant.patra.77@gmail.com",//this.loginUserDetails.EmailID,
    //                                     CUSTOMER_NAME: this.allClubCoachArr[i].Name,
    //                                     NEW_PASSWORD: genPassword,
    //                                     CLUB_OR_PARENT_CLUB_ID: this.userInfoArr[0].ParentClubKey,//"-Kd2fSCGOw6K3mvzu-yH",
    //                                     TYPE_OF_ENTITY: 0
    //                                 },
    //                                 type: "POST",


    //                                 success: function (response) {


    //                                 }, error: function (error, xhr) {

    //                                     //alert("Your password has been successfully reset.");

    //                                     console.log(error);
    //                                     console.log(xhr);
    //                                 }
    //                             });
    //                         }
    //                         else {
    //                             this.fb.update(this.allClubCoachArr[i].$key, "/User/", { Password: genPassword });
    //                             // if (this.allClubCoachArr[i].UserType == 1) { // 
    //                             //     this.fb.update(this.userInfoArr[0].ParentClubKey, "/ParentClub/Type1/", { ParentClubAdminPassword: genPassword });
    //                             // }
    //                             // else if (this.allClubCoachArr[i].UserType == 2) {
    //                             //     this.fb.update(this.userInfoArr[0].ParentClubKey, "/ParentClub/Type2/", { ParentClubAdminPassword: genPassword });
    //                             // }

    //                             isExccute = true;
    //                             //alert("Your new password is" + this.geteneratePassword());
    //                             //console.log(this.allClubCoachArr[i].EmailID);
    //                             //console.log(this.allClubCoachArr[i].Name);
    //                             $.ajax({
    //                                 url: "https://emailap.activitypro.co.uk/umbraco/surface/ActivityProSurface/SendResetPasswordMail/",
    //                                 data: {
    //                                     CUSTOMER_EMAIL: this.allClubCoachArr[i].EmailID, //"susant.patra.77@gmail.com",//this.loginUserDetails.EmailID,
    //                                     CUSTOMER_NAME: this.allClubCoachArr[i].Name,
    //                                     NEW_PASSWORD: genPassword,
    //                                     CLUB_OR_PARENT_CLUB_ID: this.userInfoArr[0].ParentClubKey,//"-Kd2fSCGOw6K3mvzu-yH",
    //                                     TYPE_OF_ENTITY: 0
    //                                 },
    //                                 type: "POST",


    //                                 success: function (response) {


    //                                 }, error: function (error, xhr) {

    //                                     //alert("Your password has been successfully reset.");

    //                                     console.log(error);
    //                                     console.log(xhr);
    //                                 }
    //                             });


    //                         }
    //                         this.navCtrl.pop();
    //                         let message = "Password reset successful. An email is sent with the new password.";
    //                         this.commonService.toastMessage(message,3000,ToastMessageType.Success,ToastPlacement.Bottom);
    //                         //alert("It seems the email id is registered");
    //                         break;

    //                     }

    //                 }
    //             }

    //         }
    //         if (!isExccute) {
    //             //alert("It seems the email id is not registered");
    //             let message = "Oops! we can't find the email id, please check";
    //             this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //             this.navCtrl.pop();
    //         }
    //         isExccute = false;
    //     }
    // }

    admin$Obs:Subscription;
    coach$Obs:Subscription;
    subAdmin$Obs:Subscription;
    setPassword() {
        if(this.validateClubEmail()){
        this.commonService.showLoader("Please wait");
        let userData = [];
        let isExistFlag = false;
        
          this.admin$Obs = this.fb.getAllWithQuery("User/", { orderByChild: 'EmailID', equalTo: this.clubObj.EmailID.toLocaleLowerCase() }).subscribe((data) => {
            this.admin$Obs.unsubscribe();
            userData = data;
            if (data.length > 0) {
              isExistFlag = true;
              let genPassword = this.geteneratePassword();
              let userinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);
                this.sendForgotMail(data[0].EmailID,data[0].Name,genPassword,userinfo[0].ParentClubKey);
                this.fb.update(data[0].$key, "/User/", { Password: genPassword });
                if (data[0].UserType == 1) { // 
                    this.fb.update(userinfo[0].ParentClubKey, "/ParentClub/Type1/", { ParentClubAdminPassword: genPassword });
                }
                else if (data[0].UserType == 2) {
                    this.fb.update(userinfo[0].ParentClubKey, "/ParentClub/Type2/", { ParentClubAdminPassword: genPassword });
                } 
                this.commonService.hideLoader();
                let message = "Password reset successful. An email is sent with the new password.";
                this.commonService.toastMessage(message,3000,ToastMessageType.Success,ToastPlacement.Bottom);
                this.navCtrl.pop();      
                    
            }else {
                this.coach$Obs = this.fb.getAllWithQuery("User/Coach/", { orderByChild: 'EmailID', equalTo: this.clubObj.EmailID.toLocaleLowerCase() }).subscribe((coachres) => {
                this.coach$Obs.unsubscribe();
                if (coachres.length > 0) {
                  isExistFlag = true;
                  let genPassword = this.geteneratePassword();
                  let userinfo = this.commonService.convertFbObjectToArray(coachres[0].UserInfo);
                  this.sendForgotMail(coachres[0].EmailID,coachres[0].Name,genPassword,userinfo[0].ParentClubKey);
                    this.fb.update(coachres[0].$key, "/User/Coach/", { Password: genPassword });
                    this.fb.update(userinfo[0].CoachKey, "/Coach/Type2/" + userinfo[0].ParentClubKey + "/", { Password: genPassword });
                    this.commonService.hideLoader();
                    let message = "Password reset successful. An email is sent with the new password.";
                    this.commonService.toastMessage(message,3000,ToastMessageType.Success,ToastPlacement.Bottom);
                    this.navCtrl.pop();        
                }
                else {
                  this.subAdmin$Obs = this.fb.getAllWithQuery("User/SubAdmin/", { orderByChild: 'EmailID', equalTo: this.clubObj.EmailID.toLocaleLowerCase()}).subscribe((subAdminres) => {
                    this.subAdmin$Obs.unsubscribe();
                    if (subAdminres.length > 0) {
                      isExistFlag = true;
                      let genPassword = this.geteneratePassword();
                      let userinfo = this.commonService.convertFbObjectToArray(subAdminres[0].UserInfo);
                      this.sendForgotMail(subAdminres[0].EmailID,subAdminres[0].Name,genPassword,userinfo[0].ParentClubKey);
                        this.fb.update(subAdminres[0].$key, "/User/SubAdmin", { Password: genPassword });
                        this.commonService.hideLoader();
                        let message = "Password reset successful. An email is sent with the new password.";
                        this.commonService.toastMessage(message,3000,ToastMessageType.Success,ToastPlacement.Bottom);
                        this.navCtrl.pop();        
                    }else{
                        this.commonService.hideLoader();
                        let message = "Oops! we can't find the email id, please check";
                        this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
                        this.navCtrl.pop();
                    }
                    
                  })
                } 
              });
            }
            
          });
          
        }
      }


    sendForgotMail(email,name,genPassword,parentclub){
        //return new Promise((res,rej)=>{
            $.ajax({
                url: "https://emailap.activitypro.co.uk/umbraco/surface/ActivityProSurface/SendResetPasswordMail/",
                data: {
                    CUSTOMER_EMAIL: email, //"susant.patra.77@gmail.com",//this.loginUserDetails.EmailID,
                    CUSTOMER_NAME: name,
                    NEW_PASSWORD: genPassword,
                    CLUB_OR_PARENT_CLUB_ID: parentclub,//"-Kd2fSCGOw6K3mvzu-yH",
                    TYPE_OF_ENTITY: 0
                },
                type: "POST",

                success: function (response) {
                    //res("email sent")
                }, error: function (error, xhr) {
                    console.log(error);
                    console.log(xhr);
                    //rej(error)
                }                          
            });
        //})
    }



    validateClubEmail(): boolean {
        if (this.clubObj.EmailID == "") {
            let message = "Please enter email.";
            this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
            return false;
        }
        else if (!this.validateEmail(this.clubObj.EmailID)) {
            let message = "Please enter correct email id.";
            this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
            return false;
        }
        return true;
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    

}
