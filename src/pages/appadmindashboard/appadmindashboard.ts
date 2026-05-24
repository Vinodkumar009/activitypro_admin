import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, IonicPage, ToastController, NavParams } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice'
import { Storage } from '@ionic/storage';
import { BookingMemberType, CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { FirebaseService } from '../../services/firebase.service';
import { HttpService } from '../../services/http.service';
import { API } from '../../shared/constants/api_constants';

@IonicPage()
@Component({
  selector: 'page-appadmindashboard',
  templateUrl: 'appadmindashboard.html',
})
export class AppadmindashboardPage {
  parentclubs: any[] = [];
  TempParentClubs: any[] = [];
  showDash = false;
  isLoading = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public storage: Storage,
    public commonService: CommonService,
    public fb: FirebaseService,
    public sharedService: SharedServices,
    public popoverCtrl: PopoverController,
    private httpService: HttpService
  ) {}

  ionViewDidLoad() {
    this.checkAdminRole();
    this.loadFromStorageOrFetch();
  }

  private checkAdminRole() {
    this.storage.get('APadminDetails').then((emailId) => {
      this.fb.getAllWithQuery("User/APAdmin/", { orderByChild: 'EmailID', equalTo: emailId })
        .subscribe((res) => {
          if (res.length > 0 && res[0].RoleType == "99" && res[0].UserType == "20") {
            this.showDash = true;
          }
        });
    });
  }

  private loadFromStorageOrFetch() {
    this.storage.get('AllParentClubs').then((cached) => {
      if (cached && cached.length > 0) {
        this.parentclubs = cached;
        this.TempParentClubs = cached;
      } else {
        this.fetchParentClubs();
      }
    }).catch(() => {
      this.fetchParentClubs();
    });
  }

  syncList() {
    this.parentclubs = [];
    this.TempParentClubs = [];
    this.storage.remove('AllParentClubs');
    this.fetchParentClubs();
  }

  private fetchParentClubs() {
    this.isLoading = true;
    this.commonService.showLoader("Loading...");
    const url = `${API.GET_ALL_PARENTCLUBS_LIST}?action_type=1&page=1&limit=1000`;

    this.httpService.get(url, null, null, 1).subscribe(
      (response: any) => {
        this.parentclubs = response.data || [];
        this.TempParentClubs = this.parentclubs;
        this.storage.set('AllParentClubs', this.parentclubs);
        this.isLoading = false;
        this.commonService.hideLoader();
      },
      (err) => {
        console.error("Error fetching parent clubs:", err);
        this.commonService.toastMessage("Failed to load parent clubs", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        this.isLoading = false;
        this.commonService.hideLoader();
      }
    );
  }

  getFilterItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim().length > 0) {
      this.TempParentClubs = this.parentclubs.filter((item) => {
        return item.ParentClubName && item.ParentClubName.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else {
      this.TempParentClubs = this.parentclubs;
    }
  }

  GetParentClubInfo(loggedin_id: any) {
    this.storage.set('memberType', BookingMemberType.ADMIN);
    this.sharedService.setLoggedInType(BookingMemberType.ADMIN);
    this.commonService.showLoader("Please wait");
    const user$Obs = this.fb.getAllWithQuery("User/", { orderByKey: true, equalTo: loggedin_id }).subscribe((data) => {
      user$Obs.unsubscribe();
      if (data.length > 0) {
        let userinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);
        data[0].UserInfo = userinfo;
        // this.storage.set('isLogin', true);
        // this.storage.set('LoginWhen', 'first');
        // this.storage.set('userObj', JSON.stringify(data[0]));
        // this.storage.set('memberType', BookingMemberType.ADMIN);
        // this.storage.set('UserKey', JSON.stringify(data[0].$key));
        // this.sharedService.setUserData(data[0]);
        this.handleLogin(data[0], BookingMemberType.ADMIN, 'admin', data[0].$key);
        //this.getUserMenus(data[0]);
      }
    }, (err) => {
      this.commonService.hideLoader();
    });
  }

  handleLogin(userData: any, memberType: any, userType: string, firebase_loggedinkey: string) {
    this.httpService.get<{message: string, data: any}>(`${API.GET_PARENTCLUB_USER_BY_FIREBASEID}/${firebase_loggedinkey}`)
      .subscribe({
        next: async (res) => {
          const userinfo = this.commonService.convertFbObjectToArray(userData.UserInfo);
          userData.UserInfo = userinfo;
          await Promise.all([ 
             this.storage.set('isLogin', true),
             this.storage.set('LoginWhen', 'first'),
             this.storage.set('userObj', JSON.stringify(userData)),
             this.storage.set('memberType', memberType),
             this.storage.set('UserKey', JSON.stringify(userData.$key)),
          ])

          this.sharedService.setLoggedInType(memberType);
          this.sharedService.setUserData(userData);
          //await this.storage.set('loggedin_user', JSON.stringify(res.data));
        
          this.getUserMenus(userData);
          // if (this.sharedService.getDeviceToken()) {
          //   let key = userinfo[0].ParentClubKey;
          //   if (userType == 'coach') {
          //     key = userinfo[0].Key;
          //   }
          //   if (this.sharedService.getOnesignalPlayerId()) {
          //     this.commonService.saveDeviceDetsforNotify(key);
          //   }
          // }

          // if (this.sharedService.getThemeType() === 2) {
          //   this.commonService.navCtrl.setRoot("Dashboard");
          //   this.commonService.toastMessage("Logged in successfully...", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          // }
        },
        error: (err) => {
          this.commonService.hideLoader();
          console.error("Error fetching events:", err);
          if (err && err.error && err.error.message) {
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage("Failed to fetch loggedin user details", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        }
      });
  }

  getUserMenus(user) {
    let menuDataObs$ = this.fb.getAllWithQuery(`UserMenus/${user.UserInfo[0].ParentClubKey}`, { orderByKey: true, equalTo: user.$key }).subscribe((menuData) => {
      const menus = this.commonService.convertFbObjectToArray(menuData[0].Menu).filter(menu => menu.MobileAccess);
      this.commonService.hideLoader();
      this.sharedService.setMenu(menus);
      this.storage.remove("Menus");
      this.storage.set("Menus", JSON.stringify(menus));
      menuDataObs$.unsubscribe();
      this.navCtrl.push("Dashboard");
    }, (err) => {
      this.commonService.hideLoader();
    });
  }

  gotoDashBoard() {
    this.navCtrl.push('SuperDashboardDetailsPage', { parentclubs: this.parentclubs });
  }

  gotoPromotion() {
    this.navCtrl.push('SuperuserPromotion', { parentclubs: this.parentclubs });
  }
}
