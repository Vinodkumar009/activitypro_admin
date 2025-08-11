import { Component, ViewChild } from "@angular/core";
import { Platform, AlertController, MenuController, Nav } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../pages/services/sharedservice";
import { FirebaseService } from "../services/firebase.service";
import { CommonService } from "../services/common.service";
import { LanguageService } from "../services/language.service";
import { DirectDebitController } from "../controller/directdebit.controller";
import { GoogleAnalytics } from "@ionic-native/google-analytics";
//import { CacheService } from "ionic-cache";
import { Market } from "@ionic-native/market";
import { AppVersion } from "@ionic-native/app-version";
import { AndroidPermissions } from "@ionic-native/android-permissions";
//import { Network } from '@ionic-native/network';
import { OneSignal } from "@ionic-native/onesignal";
import { Device } from "@ionic-native/device";
//import { Keyboard } from '@ionic-native/keyboard';



@Component({
  templateUrl: "app.html",
  providers: [SharedServices, FirebaseService, CommonService, LanguageService],
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  isShowCancelBtn: boolean = false;
  layoutRootPage: any = "";
  constructor(
    public sharedservice: SharedServices,
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    public storage: Storage,
    private appVersion: AppVersion,
    private market: Market,
    public fb: FirebaseService,
    private ga: GoogleAnalytics,
    //private keyboard: Keyboard,
    //private androidPermissions: AndroidPermissions,
    private oneSignal: OneSignal,
    private device: Device // public cache: CacheService
  ) {
    let isProduction = false;
    let emailUrl = "";
    let nodeURL = "";
    let nestURL = "";
    let SuperAdminKey = "";
    let aws_cloudfrontURL = "";
    let aws_presignedUrl = "";
    let graphql_url = "";
    let group_sessionsUrl = "";
    let group_session_apikey = "";
    // this.cache.setDefaultTTL(60 * 60);
    //this.cache.setOfflineInvalidate(false);
    //config values for production or Devlopement
    DirectDebitController.isProduction = isProduction;
    if (isProduction) {
      emailUrl = "https://modernemailap.activitypro.co.uk/";
      // nodeURL = "https://activitypro-node-266406.appspot.com";
      nodeURL = "https://activitypro-node-admin.appspot.com";
      nestURL = "https://activitypro-nest-261607.appspot.com";
      group_sessionsUrl = "https://ap-prod-sessions-api.activitypro.co.uk";
      group_session_apikey = "XzLw7GFdClJWa2vO3lwm8V6y2FGxdPO40KxsrJO4";
      aws_cloudfrontURL = "https://d1ybtjfafmsyx2.cloudfront.net";
      aws_presignedUrl = "https://k26gihyg2c.execute-api.eu-west-2.amazonaws.com/prod/generatesignedurl";
      SuperAdminKey = "-KxumnfpRwRV--yZ5PVu";
      graphql_url = "https://applus-api.activitypro.co.uk/graphql"
    } else {
      emailUrl = "http://54.84.255.41:8121/";
      //  emailUrl = "http://localhost:32683/";
      nodeURL = "https://activitypro-node.appspot.com";
      nestURL = "https://oonxvy0hcd.execute-api.eu-west-2.amazonaws.com/DEV"
      group_sessionsUrl = "https://oonxvy0hcd.execute-api.eu-west-2.amazonaws.com/DEV";
      group_session_apikey = "";
      aws_cloudfrontURL = "https://d2ert9om2cv970.cloudfront.net";
      aws_presignedUrl = "https://i97kakk5tk.execute-api.eu-west-2.amazonaws.com/Dev/generatesignedurl";
      SuperAdminKey = "-KoGLONcroK1vB02b9Gg"; 
      graphql_url = "https://api-dev.activitypro.co.uk/graphql"
    }

    //intialize url
    
    this.sharedservice.setEmailUrl(emailUrl);
    this.sharedservice.setnodeURL(nodeURL);
    this.sharedservice.setnestURL(nestURL);
    this.sharedservice.setgraphqlURL(graphql_url);
    this.sharedservice.setSuperAdminKey(SuperAdminKey);
    this.sharedservice.setCloudfrontURL(aws_cloudfrontURL);
    this.sharedservice.setPresignedURL(aws_presignedUrl);
    this.sharedservice.setGroupSessionsURL(group_sessionsUrl);
    this.sharedservice.setGroupSessionAPiKey(group_session_apikey);
    this.sharedservice.setPlatform(platform.is("android") ? "android" : "ios");
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      //this.fb.loginToFirebaseAuth().then((val)=>{
      this.statusBar.backgroundColorByHexString("#f7f7f7"); //#f7f7f7
      this.statusBar.styleDefault();
      //this.keyboard.disableScroll(false);
      //this.splashScreen.hide();
      // this.androidPermissions.requestPermissions([
      //   this.androidPermissions.PERMISSION.CALL_PHONE,
      // ]);
      this.setRootPage();//need to remove this while build
      this.getAppVersion();
      this.ga
        .startTrackerWithId("UA-92902306-1")
        .then(() => {
          console.log("analytics working");
        })
        .catch((e) => console.log("Error starting GoogleAnalytics == " + e));
      // this.fb.update("StripeConfigDetails", "ActivityPro", {
      //   AuthURL: 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_FmNovlkp34sE0FGQ2jQe68tbkywu8kBi&scope=read_write',
      //   IsActive: true,
      //   IsEnable: true,
      //   CreatedDate: new Date().getTime()
      // })
    // }).catch((err)=>{
    //   console.log(err);
    // });
  }).catch((err)=>{
    console.log(err);
  })
  }

  //comparing app version

  getAppVersion() {
    if (this.platform.is("android")) {
      this.fb
        .getAllWithQuery(`ActivityPro/-KxumnfpRwRV--yZ5PVu/`, {
          orderByKey: true,
          equalTo: "Android",
        })
        .subscribe((data) => {
          if (data.length > 0 && data[0].version_switch) {
            this.appVersion.getVersionNumber().then((appversion) => {
              let presentVersion = appversion.toString().split(".").join("0");
              let playstoreVersion = data[0].new_admin_version
              .toString()
                .split(".")
                .join("0");
              if (appversion) {
                if (parseInt(presentVersion) < parseInt(playstoreVersion)) {
                  if (!data[0].force_update) {
                    this.isShowCancelBtn = true;
                  }
                  this.checkForceUpdate(playstoreVersion);
                } else {
                  this.setRootPage();
                }
              } else {
                this.setRootPage();
              }
            });
          } else {
            this.setRootPage();
          }
        });
    } else {
      //this.setRootPage();
      this.fb
        .getAllWithQuery(`ActivityPro/-KxumnfpRwRV--yZ5PVu/`, {
          orderByKey: true,
          equalTo: "IOS",
        })
        .subscribe((data) => {
          if (data.length > 0 && data[0].version_switch) {
            this.appVersion.getVersionNumber().then((appversion) => {
              let presentVersion = appversion.toString().split(".").join("0");
              let appstoreVersion = data[0].new_admin_version.toString()
                .split(".")
                .join("0");
              if (appversion) {
                if (parseInt(presentVersion) < parseInt(appstoreVersion)) {
                  if (!data[0].force_update) {
                    this.isShowCancelBtn = true;
                  }
                  this.checkForceUpdate(data[0].new_admin_version);
                } else {
                  this.setRootPage();
                }
              } else {
                this.setRootPage();
              }
            });
          } else {
            this.setRootPage();
          }
        });
    }
  }

  //navigating to root page
  setRootPage() {
    if (this.platform.is("core") || this.platform.is("mobileweb")) {
      this.layoutRootPage = "MenuOrDashboard";
    } else {
      if (this.platform.is("cordova")) {
        // if (this.platform.is('android')) {
        //  this.initializeOnesignal()
        // }
        // if (this.platform.is('ios')) {
        //   this.oneSignal.startInit('onseSignalAppId');
        // }
        //this.initializeOnesignal()
        // this.initializeNotification();
        this.initializeOnesignal();
      }
      this.layoutRootPage = "MenuOrDashboard";
      //custom splash
      // const splash = document.getElementById('custom-splash');
      // if (splash) {
      //   splash.style.display = 'block';
      // }

      // // Hide custom splash image after 2 seconds (adjust duration as needed)
      // setTimeout(() => {
      //   if (splash) {
      //     splash.style.display = 'none';
      //   }
      //   this.layoutRootPage = "MenuOrDashboard";
      //   // Your app initialization code here
      // }, 2000);
    }
  }

  checkForceUpdate(appVersion: any) {
    let appUrl = this.platform.is("android")
      ? "com.kare4u.tkadminapp"
      : "https://apps.apple.com/us/app/activitypro-club-management/id1210271311?ls=1";
    const alert = this.alertCtrl.create({
      title: "Update Available!",
      message: "Please update to the latest version to get more features",
      enableBackdropDismiss: false,
      buttons: [
        {
          // text: this.isShowCancelBtn ? 'Cancel':'',
          // role: this.isShowCancelBtn ? 'cancel' : '',
          // cssClass: this.isShowCancelBtn ? '' : 'HideButton',
          text: "Cancel",
          role: "cancel",
          cssClass: this.isShowCancelBtn ? "" : "HideButton",
          handler: (blah) => {
            if (this.isShowCancelBtn) {
              this.setRootPage();
            }
          },
        },
        {
          text: "Update",
          handler: () => {
            this.market.open(appUrl);
          },
        },
      ],
    });
    alert.present();
  }

  // initializeNotification() {
  //   const options: PushOptions = {
  //     android: {
  //       senderID: "61019039619",
  //     },
  //   };
  //   //  ,
  //   //   ios: {
  //   //     alert: 'true',
  //   //     badge: true,
  //   //     sound: 'true',
  //   //   }
  //   this.push.hasPermission().then((res: any) => {
  //     if (res.isEnabled) {
  //       console.log("We have permission to send push notifications");
  //     } else {
  //       console.log("We do not have permission to send push notifications");
  //     }
  //   });

  //   const pushObject: PushObject = this.push.init(options);

  //   pushObject
  //     .on("notification")
  //     .subscribe((notification: any) =>
  //       this.showAlert("Notification", notification.message)
  //     );

  //   pushObject.on("registration").subscribe((registration: any) => {
  //     // alert(JSON.stringify(registration))
  //     this.sharedservice.setDeviceToken(registration.registrationId);
  //   });

  //   pushObject.on("error").subscribe((error) => this.showAlert("Error", error));
  // }
  // networkConnection() {
  //   //Check Network connection
  //   this.network.onConnect().subscribe(() => {
  //     if (!this.intialCall) {
  //       this.commonService.toastMessage("Network established!", 3000, ToastMessageType.Success, ToastPlacement.Top);
  //     }
  //     this.intialCall = false;
  //   });
  //   this.network.onDisconnect().subscribe(() => {
  //     this.commonService.toastMessage("Network was disconnected!,Please Check your network and try again", 5000, ToastMessageType.Error, ToastPlacement.Top, true);
  //   });
  // }

  showAlert(Title, Message) {
    let alert = this.alertCtrl.create({
      subTitle: Title,
      message: JSON.stringify(Message),
      buttons: ["OK"],
    });
    alert.present();
  }
  async initializeOnesignal() {
    this.oneSignal.startInit(
      "8f298d26-1615-428d-95a5-3efed91ef927",
      "61019039619"
    );

    this.oneSignal.inFocusDisplaying(
      this.oneSignal.OSInFocusDisplayOption.InAppAlert
    );

    this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
    });

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      // do something when a notification is opened
    });

    this.oneSignal.endInit();
    this.oneSignal.getIds().then((identity) => {
      this.sharedservice.setDeviceId(this.device.uuid);
      this.sharedservice.setOnesignalPlayerId(identity.userId);
      this.sharedservice.setPlatform(this.device.platform);
      this.sharedservice.setdeviceDetails(this.device.model);
      this.sharedservice.setDeviceToken(identity.pushToken);
    });
  }
}


