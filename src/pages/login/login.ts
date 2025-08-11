import { MenuController } from 'ionic-angular';
// import { Type2Member } from '../type2/member/member';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, Events, IonicPage } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
// import { Dashboard } from '../dashboard/dashboard';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController, ToastController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { Platform } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { BookingMemberType } from './../../services/common.service';
import { HttpService } from '../../services/http.service';
import { API } from '../../shared/constants/api_constants';
@IonicPage()
@Component({
  selector: 'login-page',
  templateUrl: 'login.html',
  providers: [HttpService]
})

export class Login {
  // backUrl = "assets/images/TopSplice.png"
  rootPage: any;
  themeType: number;
  usersList = [];
  coachUserList = [];
  user = {
    emailID: '',
    password: ''
  };


  isExist: boolean = false;
  isExistEmailID: boolean = false;
  isExistPassword: boolean = false;
  isKeyBoardOpen: boolean = false;
  loading: any;
  isEmailOpen: boolean = false;
  isPasswordOpen: boolean = false;
  
  sub:Subscription;
  coach$Obs:Subscription;
  subAdmin$Obs:Subscription;
  Apadmin$Obs:Subscription;
  constructor(public plt: Platform, 
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
     public menuCtrl: MenuController, 
     public toastCtrl: ToastController, 
     public events: Events, public navCtrl: NavController,
      public fb: FirebaseService, 
      private httpService: HttpService,
    public sharedservice: SharedServices, public storage: Storage) {
    this.menuCtrl.swipeEnable(false);
    this.themeType = sharedservice.getThemeType();
  }
  goToForgotPassword() {
    this.navCtrl.push("ForgotPassword");
  }

  validateUserInputForLogin(): boolean {
    if (this.user.emailID == "") {
      let message = "Please enter email id";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);

      return false;
    }
    else if (!this.validateEmail(this.user.emailID)) {
      let message = "Please enter correct email id";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.user.password == "") {
      let message = "Please enter password";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }

    return true;
  }
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }


  

  login() {

    let userData = [];
    let isExistFlag = false
    // if (this.validateUserInputForLogin()) {
    //   let loading = this.loadingCtrl.create({
    //     content: 'Please wait...'
    //   });

    //   loading.present();
    //   this.user.emailID = ((this.user.emailID).trim()).toLowerCase();
    //   this.sub = this.fb.getAllWithQuery("User/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((data) => {
    //     //const loggedinkey = '-LycWrA_OLN75p6j-RFI';
    //     //const loggedinkey = '-KuAlAXTl7UQ2hFp4ljQ';
    //   //this.sub = this.fb.getAllWithQuery(`User/`, { orderByKey: true, equalTo: loggedinkey }).subscribe((data) => { 
    //     userData = data;
    //     if (data.length > 0) {
    //       isExistFlag = true;
    //       if (this.user.password == data[0].Password) {
    //         let userinfo: Array<any>;
    //         this.storage.set('isLogin', true);
    //         this.storage.set('LoginWhen', 'first');
    //         userinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);
    //         data[0].UserInfo = userinfo;
    //         //delete data[0].Web
    //         this.storage.set('userObj', JSON.stringify(data[0]));
    //         this.storage.set('memberType', BookingMemberType.ADMIN);
    //         this.sharedservice.setLoggedInType(BookingMemberType.ADMIN);
    //         this.storage.set('UserKey', JSON.stringify(data[0].$key));
    //         this.sharedservice.setUserData(data[0]);
    //         this.events.publish('user:loginsuccessfully', data[0], Date.now());
    //         // this.checkAndStoreDeviceToken("fgzOgNOrktw:APA91bHb3DSGr2DcR50zyC6_7DtjCwNGl-8Ib4ZjMgqpBXLGedox4Rya9eCKFzmlbKtTJhFHi7xJ81Ijpt3vmM3i01CxrHUk1rEU8REiuxmVpIbwg53AB5CIcy314BVVQN-MStGZfse7",userinfo[0],"admin");
    //         if (this.sharedservice.getDeviceToken() != "") {
    //           //let returnKey = this.fb.saveReturningKey("DeviceToken/ParentClub/" + data[0].UserInfo[0].ParentClubKey, { DeviceToken: this.sharedservice.getDeviceToken() });
    //           //this.storage.set('UserTokenKey', returnKey);
    //           this.checkAndStoreDeviceToken(this.sharedservice.getDeviceToken(), userinfo[0], "admin");
    //         }
    //         this.sub.unsubscribe();
    //         if (this.themeType == 2) {
    //           this.navCtrl.setRoot("Dashboard");
    //           this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
    //         }
           
    //       } else {
    //         let message = "Invalid User ID or Password";
    //         this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //       }
    //     }
    //     else if (data.length == 0) {
    //     this.coach$Obs =   this.fb.getAllWithQuery("User/Coach/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((response) => {
    //         userData = response;
    //         if (response.length > 0 && (response[0].IsActive == undefined || response[0].IsActive)) {
    //           isExistFlag = true;
    //           if (this.user.password == response[0].Password) {
    //             let userinfo: Array<any>;
    //             this.storage.set('isLogin', true);
    //             this.storage.set('LoginWhen', 'first');
    //             userinfo = this.commonService.convertFbObjectToArray(response[0].UserInfo);
    //             response[0].UserInfo = userinfo;
    //             this.storage.set('userObj', JSON.stringify(response[0]));
    //             this.storage.set('memberType', BookingMemberType.COACH);
    //             this.sharedservice.setLoggedInType(BookingMemberType.COACH);
    //             this.storage.set('UserKey', JSON.stringify(response[0].$key));
    //             this.sharedservice.setUserData(response[0]);
    //             this.events.publish('user:loginsuccessfully', response[0], Date.now());
    //             if (this.sharedservice.getDeviceToken() != "") {
    //               let userInfo = this.commonService.convertFbObjectToArray(response[0].UserInfo);
    //               // let returnKey = this.fb.saveReturningKey("DeviceToken/Coach/" +userInfo[0].ParentClubKey+"/"+userInfo[0].CoachKey, { DeviceToken: this.sharedservice.getDeviceToken() });
    //               this.checkAndStoreDeviceToken(this.sharedservice.getDeviceToken(), userinfo[0], "coach");
    //               // this.storage.set('UserTokenKey', returnKey);
    //             }
    //             this.coach$Obs.unsubscribe();
    //             if (this.themeType == 2) {
    //               this.navCtrl.setRoot("Dashboard");
    //               this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
    //             }
    //           } else {
    //             let message = "Invalid User ID or Password";
    //             this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //           }
    //         }
    //         else if (data.length == 0) {   
    //           this.subAdmin$Obs = this.fb.getAllWithQuery("User/SubAdmin/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((subAdminresponce) => {
    //             if (subAdminresponce.length > 0) {
    //               isExistFlag = true;
    //               if (this.user.password == subAdminresponce[0].Password && (subAdminresponce[0].IsActive == undefined || subAdminresponce[0].IsActive)) {
    //                 let userinfo: Array<any>;
    //                 this.storage.set('isLogin', true);
    //                 this.storage.set('LoginWhen', 'first');
    //                 userinfo = this.commonService.convertFbObjectToArray(subAdminresponce[0].UserInfo);
    //                 subAdminresponce[0]["SignedUpUnder"] = 6; //this  is to,when updating a password from popover page, we don't know the user node is stored where.,
    //                   //because sometimes subadmin can be member and he's node we'll be in SubAdmin node,So we have to check while reset password
    //                 subAdminresponce[0].UserInfo = userinfo;
    //                 this.storage.set('userObj', JSON.stringify(subAdminresponce[0]));
    //                 this.storage.set('memberType', BookingMemberType.SUBADMIN);
    //                 this.sharedservice.setLoggedInType(BookingMemberType.SUBADMIN);
    //                 this.storage.set('UserKey', JSON.stringify(subAdminresponce[0].$key));
    //                 this.sharedservice.setUserData(subAdminresponce[0]);
    //                 this.events.publish('user:loginsuccessfully', subAdminresponce[0], Date.now());
    //                 this.subAdmin$Obs.unsubscribe();
    //                 if (this.themeType == 2) {
    //                   this.navCtrl.setRoot("Dashboard");
    //                   this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
    //                 }
    //               }else {
    //                 let message = "Invalid User ID or Password";
    //                 this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //               }
    //             }else if (subAdminresponce.length == 0) {
    //               this.Apadmin$Obs = this.fb.getAllWithQuery("User/APAdmin/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((AppAdminresponce) => {
    //                 if (AppAdminresponce.length > 0) {
    //                   isExistFlag = true;
    //                   if (this.user.password == AppAdminresponce[0].Password) {
    //                     this.storage.set('isAppAdminLogin', true);
    //                     this.sharedservice.setAdminStatus(true);
    //                     this.storage.set('APadminDetails', this.user.emailID)
    //                     //this.storage.set('LoginWhen', 'first');
    //                     this.navCtrl.setRoot("AppadmindashboardPage");
    //                     this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
    //                     this.Apadmin$Obs.unsubscribe();
    //                   }else {
    //                     let message = "Invalid User ID or Password";
    //                     this.showToast(message, 3000);
    //                   }
    //                 }else if(AppAdminresponce.length == 0){
    //                   let message = "Invalid User ID or Password";
    //                   this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //                 } 
    //               });
    //             }
                
    //           })
    //         } 
    //       });
    //     }
    //     loading.dismiss().catch(() => { });
    //   });
    // }        



    /***-------------------  New code for login -----------------***/
    if (!this.validateUserInputForLogin()) return;

    const loading = this.loadingCtrl.create({ content: 'Please wait...' });
    loading.present();
    
    this.user.emailID = this.user.emailID.trim().toLowerCase();
    
    // Check Admin first
    this.sub = this.fb.getAllWithQuery("User/", { orderByChild: 'EmailID', equalTo: this.user.emailID })
      .subscribe(admin => {
        if (admin.length > 0 && this.user.password === admin[0].Password) {
          loading.dismiss().catch(() => {});
          this.handleLogin(admin[0], BookingMemberType.ADMIN, "admin");
          this.getLoggedInUserInfo(admin[0].$key);
          return;
        }
        
        // Check Coach
        this.coach$Obs = this.fb.getAllWithQuery("User/Coach/", { orderByChild: 'EmailID', equalTo: this.user.emailID })
          .subscribe(coach => {
            if (coach.length > 0 && (coach[0].IsActive == undefined || coach[0].IsActive) && 
                this.user.password === coach[0].Password) {
              loading.dismiss().catch(() => {});
              this.handleLogin(coach[0], BookingMemberType.COACH, "coach");
              this.getLoggedInUserInfo(coach[0].$key);
              return;
            }
            
            // Check SubAdmin
            this.subAdmin$Obs = this.fb.getAllWithQuery("User/SubAdmin/", { orderByChild: 'EmailID', equalTo: this.user.emailID })
              .subscribe(subAdmin => {
                if (subAdmin.length > 0 && this.user.password === subAdmin[0].Password && 
                    (subAdmin[0].IsActive == undefined || subAdmin[0].IsActive)) {
                  loading.dismiss().catch(() => {});
                  subAdmin[0]["SignedUpUnder"] = 6;
                  this.handleLogin(subAdmin[0], BookingMemberType.SUBADMIN, "subadmin");
                  this.getLoggedInUserInfo(subAdmin[0].$key);
                  return;
                }
                
                // Check AppAdmin
                this.Apadmin$Obs = this.fb.getAllWithQuery("User/APAdmin/", { orderByChild: 'EmailID', equalTo: this.user.emailID })
                  .subscribe(appAdmin => {
                    loading.dismiss().catch(() => {});
                    if (appAdmin.length > 0 && this.user.password === appAdmin[0].Password) {
                      this.storage.set('isAppAdminLogin', true);
                      this.sharedservice.setAdminStatus(true);
                      this.storage.set('APadminDetails', this.user.emailID);
                      this.navCtrl.setRoot("AppadmindashboardPage");
                      this.commonService.toastMessage("Logged in successfully...", 1000, ToastMessageType.Success, ToastPlacement.Bottom);
                    } else {
                      this.commonService.toastMessage("Invalid User ID or Password", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
                    }
                  }, error => {
                    loading.dismiss().catch(() => {});
                    this.commonService.toastMessage("Login failed. Please try again.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
                  });
              }, error => {
                loading.dismiss().catch(() => {});
                this.commonService.toastMessage("Login failed. Please try again.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
              });
          }, error => {
            loading.dismiss().catch(() => {});
            this.commonService.toastMessage("Login failed. Please try again.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
          });
      }, error => {
        loading.dismiss().catch(() => {});
        this.commonService.toastMessage("Login failed. Please try again.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });


  }


  private handleLogin(userData: any, memberType: any, userType: string) {
    const userinfo = this.commonService.convertFbObjectToArray(userData.UserInfo);
    userData.UserInfo = userinfo;
    
    this.storage.set('isLogin', true);
    this.storage.set('LoginWhen', 'first');
    this.storage.set('userObj', JSON.stringify(userData));
    this.storage.set('memberType', memberType);
    this.storage.set('UserKey', JSON.stringify(userData.$key));
    
    this.sharedservice.setLoggedInType(memberType);
    this.sharedservice.setUserData(userData);
    this.events.publish('user:loginsuccessfully', userData, Date.now());
    
    if (this.sharedservice.getDeviceToken()) {
      this.checkAndStoreDeviceToken(this.sharedservice.getDeviceToken(), userinfo[0], userType);
    }
    
    if (this.themeType === 2) {
      this.navCtrl.setRoot("Dashboard");
      this.commonService.toastMessage("Logged in successfully...", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    }
  }        


  getLoggedInUserInfo(firebase_loggedinkey:string){
    this.httpService.get<{message: string,data: ParentClubUserResponseDto}>(`${API.GET_PARENTCLUB_USER_BY_FIREBASEID}/${firebase_loggedinkey}`)
        .subscribe({
            next: (res) => {
               this.storage.set('loggedin_user', JSON.stringify(res.data));
            },
            error: (err) => {
              console.error("Error fetching events:", err);
              if(err && err.error && err.error.message){
                this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }else{
                this.commonService.toastMessage("Failed to fetch loggedin user details", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
            }
          });
    }
  



  checkDeviceToken() {}

  checkAndStoreDeviceToken(token, userData, type) {
    if (this.sharedservice.getOnesignalPlayerId()) {
      let key = userData.ParentClubKey;
      if (type == 'coach') {
        key = userData.Key
      }
      this.commonService.saveDeviceDetsforNotify(key)
    }

  }


  goToContactUs(){
    this.navCtrl.push('LoginContactUs')
  }


  ionViewWillLeave() { //unsbscribe all subscription to avoid all unnecessary data leaks
    //The Subscription object also has a closed property that one can use to check if the stream was already unsubscribed (completed or had an error).
    if(this.sub && !this.sub.closed){
      this.sub.unsubscribe();
    }
    if(this.subAdmin$Obs && !this.subAdmin$Obs.closed){
      this.subAdmin$Obs.unsubscribe();
    }
    if(this.coach$Obs && !this.coach$Obs.closed){
      this.coach$Obs.unsubscribe();
    }
    if(this.Apadmin$Obs && !this.Apadmin$Obs.closed){
      this.Apadmin$Obs.unsubscribe();
    }
  }

}



export class ParentClubUserResponseDto {
  id: string;
  email_id: string;
  name: string;
  roletype: number;
  role_type_name: string;
  usertype: number;
  postgres_parentclubkey: string;
  firebase_loggedinkey: string;
  firebase_coachkey: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export class ParentClubUserResponseWrapperDto {
  message: string;
  data: ParentClubUserResponseDto;
}