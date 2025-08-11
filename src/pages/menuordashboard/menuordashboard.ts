import { BookingMemberType } from './../../services/common.service';
import { Component, ViewChild } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Nav, Events } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';
import { HttpClient } from '@angular/common/http';
@IonicPage()
@Component({
  templateUrl: "menuordashboard.html",
})
export class MenuOrDashboard {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  themeType: number;
  themeFlag: number;
  pages: Array<{
    DisplayTitle: string;
    OriginalTitle: string;
    MobComponent: string;
    WebComponent: string;
    MobIcon: string;
    MobLocalImage: string;
    MobCloudImage: string;
    WebIcon: string;
    WebLocalImage: string;
    WebCloudImage: string;
    MobileAccess: boolean;
    WebAccess: boolean;
    Role: number;
    Type: number;
    Level: number;
  }>;
  nestUrl: any;
  constructor(
    public events: Events,
    public sharedservice: SharedServices,
    public storage: Storage,
    public fb: FirebaseService,
    public commonService: CommonService,
    public http: HttpClient,
    private langService: LanguageService
  ) {
    this.sharedservice.setThemeType(2);
    this.nestUrl = sharedservice.getnestURL();
    this.themeFlag = 1;
    this.themeType = this.sharedservice.getThemeType();

    this.storage.get("isLogin").then((val) => {
      if (val == true) {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          // if ((val.Menu == undefined) && (val.RoleType != 6 || val.RoleType != 7 || val.RoleType != 8)) {
          //   this.rootPage = "Login";
          //   return false;
          // }
          if(val.CoachKey != undefined){
            this.storage.set('memberType', BookingMemberType.COACH); 
          }
          this.storage.get("Menus").then((data) => {
            let menus = JSON.parse(data);
            if (!menus || menus.length <= 0) {
              this.rootPage = "Login";
              return false;
            } else {
              this.updateMenu(val, menus);
            }
          });
          this.sharedservice.setUserData(val);
          this.rootPage = "Dashboard";
        });
      } else {
        let reqObj = {
          language: "English(en-gb)",
        };
        this.langService.setLanguageData(reqObj);
        this.rootPage = "Login";
      }
    });
    this.events.subscribe("user:loginsuccessfully", (user, time) => {
      let menuDataObs$ = this.fb
        .getAllWithQuery(`UserMenus/${user.UserInfo[0].ParentClubKey}`, {
          orderByKey: true,
          equalTo: user.$key,
        })
        .subscribe((menuData) => {
          this.sharedservice.setThemeType(2);
          this.storage.remove("Menus");
          const menus = this.commonService.convertFbObjectToArray(
            menuData[0].Menu
          );
          this.updateMenu(user, menus);
          this.storage.set("Menus", JSON.stringify(menus));
          menuDataObs$.unsubscribe();
        });
    });
  }

  getMenus() {
    // const nestUrl = "https://activitypro-nest-261607.appspot.com";
    //   //this.nestUrl = "https://activitypro-nest.appspot.com"
    //   //this.nestUrl = "http://localhost:3000";
    //   this.http.get(`${this.nestUrl}/turnament/updatepaymenybyadmin`, PaymentObjModal)
    //     .subscribe((res: any) => {
    //       this.commonService.hideLoader();
    //       if (res) {
    //         this.commonService.toastMessage("Payment updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //       }
    //     }, err => {
    //       this.commonService.hideLoader();
    //       this.commonService.toastMessage("Payment updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     });
  }

  updateMenu(user, menus) {
    this.sharedservice.setMenu(null);
    //this.pages = [];

    //Admin
    if (user.RoleType == "2" && user.UserType == "2") {
      if (menus != undefined) {
        //let TotMenus = this.commonService.convertFbObjectToArray(user.Menu);
        this.pages = menus.filter((menu) => menu.MobileAccess);
        this.sharedservice.setMenu(this.pages);
      }
    }
    // coach
    else if (user.RoleType == "4" && user.UserType == "2") {
      if (menus != undefined) {
        //let TotMenus = this.commonService.convertFbObjectToArray(user.Menu);
        this.pages = menus.filter((menu) => menu.MobileAccess);
        this.sharedservice.setMenu(this.pages);
      }

      //this.sharedservice.setMenu(this.pages);
      // ************************ coach Menu Items *********************,
      // { title: 'Member', component: "CoachMember", icon: "person-add", role: 2, type: 1, Level: 1, IsEnable: true },
      // { title: 'Group Session', component: "CoachManageSession", icon: "people", role: 2, type: 1, Level: 1, IsEnable: true },
      // { title: 'Notification', component: "CoachNotification", icon: "md-notifications", role: 2, type: 2, Level: 1, IsEnable: true },
      // { title: 'School Session', component: "CoachSchoolSessionList", icon: "school", role: 2, type: 2, Level: 1, IsEnable: true },
      // { title: 'Holiday Camp', component: "Type2HolidayCamp", icon: "tennisball", role: 2, type: 2, Level: 1, IsEnable: true },
      // // { title: 'Attendance', component: "CoachManageAttendance", icon: "people", role: 2, type: 1, Level: 1,IsEnable:true },
      // // { title: 'Payment', component: "CoachPayment", icon: "cash", role: 2, type: 2, Level: 1 ,IsEnable:true},
      // { title: 'Booking', component: "BookingcontainerPage", icon: "bookmark", role: 2, type: 2, Level: 1, IsEnable: true },
      // // { title: 'Performance', component: "AppraisalPage", icon: "md-clipboard", role: 2, type: 2, Level: 1 ,IsEnable:true},
      // { title: 'Tournaments', component: 'TournamentPage', icon: "trophy", role: 2, type: 2, Level: 1, IsEnable: true }
    } else if (user.RoleType == 6 || user.RoleType == 7 || user.RoleType == 8) {
      if (menus != undefined) {
        //let TotMenus = this.commonService.convertFbObjectToArray(user.Menu);
        this.pages = menus.filter((menu) => menu.MobileAccess);
        this.sharedservice.setMenu(this.pages);
      }
      // this.pages = this.getActiveMenuOfSubAdmin(user);
      // this.sharedservice.setMenu(this.pages);
    }

    // for (let i = 0; i < this.pages.length; i++) {
    //   this.sharedservice.setMenu(this.pages[i]);
    // } vinod commented on 10-04-2021
  }
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
  getActiveMenuOfSubAdmin(user): Array<any> {
    let activeMenues: Array<any> = [];
    // if (user.Menu.length == undefined) {
    //   user.Menu = this.commonService.convertFbObjectToArray(user.Menu);
    // }
    // user.Menu.forEach((menu) => {
    //   if (menu.IsEnable) {
    //     menu.title = menu.DisplayText;
    //     activeMenues.push(menu);
    //   }
    // });
    let x = [
      {
        DisplayTitle: "Tab Config",
        OriginalTitle: "Tab Config",
        MobComponent: "Type2TabConfig",
        WebComponent: "",
        MobIcon: "cog",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Venue",
        OriginalTitle: "Venue",
        MobComponent: "Type2Venue",
        WebComponent: "",
        MobIcon: "globe",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "School",
        OriginalTitle: "School",
        MobComponent: "Type2School",
        WebComponent: "",
        MobIcon: "school",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 1,
      },
      {
        DisplayTitle: "Holiday Calendar",
        OriginalTitle: "Holiday Calendar",
        MobComponent: "Type2Holiday",
        WebComponent: "",
        MobIcon: "calendar",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Term",
        OriginalTitle: "Term",
        MobComponent: "Type2Term",
        WebComponent: "",
        MobIcon: "calendar",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Manage Team",
        OriginalTitle: "Manage Team",
        MobComponent: "Type2ManageCoach",
        WebComponent: "",
        MobIcon: "body",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Discount Setup",
        OriginalTitle: "Discount Setup",
        MobComponent: "Type2DiscountList",
        WebComponent: "",
        MobIcon: "options",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Facility Setup",
        OriginalTitle: "Facility Setup",
        MobComponent: "Type2CourtSetupList",
        WebComponent: "",
        MobIcon: "settings",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Price Band",
        OriginalTitle: "Price Band",
        MobComponent: "PricebandPage",
        WebComponent: "",
        MobIcon: "settings",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Booking Setup",
        OriginalTitle: "Booking Setup",
        MobComponent: "BookingsetupPage",
        WebComponent: "",
        MobIcon: "settings",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Membership Payment",
        OriginalTitle: "Membership Payment",
        MobComponent: "membershipPaymentSetupPage",
        WebComponent: "",
        MobIcon: "paper",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Locations",
        OriginalTitle: "Locations",
        MobComponent: "LocationsetupPage",
        WebComponent: "",
        MobIcon: "archive",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Membership Config",
        OriginalTitle: "Membership Config",
        MobComponent: "Type2MembershipConfigList",
        WebComponent: "",
        MobIcon: "videocam",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 1,
      },
      {
        DisplayTitle: "Member",
        OriginalTitle: "Member",
        MobComponent: "Type2ReportMember",
        WebComponent: "",
        MobIcon: "book",
        MobLocalImage: "",
        MobCloudImage: "",
        WebIcon: "",
        WebLocalImage: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 3,
      },
      {
        DisplayTitle: "Bookings",
        OriginalTitle: "Bookings",
        MobComponent: "Type2ReportBooking",
        WebComponent: "",
        MobIcon: "book",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 3,
      },
      {
        DisplayTitle: "Email Setup",
        OriginalTitle: "Email Setup",
        MobComponent: "Type2EmailSetupList",
        WebComponent: "",
        MobIcon: "mail",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Bank Details",
        OriginalTitle: "Bank Details",
        MobComponent: "Type2ReportSession",
        WebComponent: "",
        MobIcon: "laptop",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Help Config",
        OriginalTitle: "Help Config",
        MobComponent: "Type2HelpConfig",
        WebComponent: "",
        MobIcon: "settings",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Staff Attendence",
        OriginalTitle: "Staff Attendence",
        MobComponent: "Type2templatePage",
        WebComponent: "",
        MobIcon: "md-paper",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
      {
        DisplayTitle: "Terms & Conditions",
        OriginalTitle: "Terms & Conditions",
        MobComponent: "TermsandconditionsPage",
        WebComponent: "",
        MobIcon: "md-paper",
        MobLocalImage: "",
        MobCloudImage: "",
        WebLocalImage: "",
        WebIcon: "",
        WebCloudImage: "",
        MobileAccess: true,
        WebAccess: true,
        Role: 2,
        Type: 2,
        Level: 2,
      },
    ];
    x.forEach((element) => {
      activeMenues.push(element);
    });

    return activeMenues;
  }
}
