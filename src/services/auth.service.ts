import { Injectable } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../pages/services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from './common.service';
import { HttpService } from './http.service';
import { API } from '../shared/constants/api_constants';

@Injectable()
export class AuthService {
  public navCtrl: NavController;

  constructor(
    private storage: Storage,
    private events: Events,
    private sharedService: SharedServices,
    private commonService: CommonService,
    private httpService: HttpService,
  ) {}

  handleLogin(userData: any, memberType: any, userType: string, firebase_loggedinkey: string) {
    this.httpService.get<{message: string, data: any}>(`${API.GET_PARENTCLUB_USER_BY_FIREBASEID}/${firebase_loggedinkey}`)
      .subscribe({
        next: async (res) => {
          const userinfo = this.commonService.convertFbObjectToArray(userData.UserInfo);
          userData.UserInfo = userinfo;

          await this.storage.set('isLogin', true);
          await this.storage.set('LoginWhen', 'first');
          await this.storage.set('userObj', JSON.stringify(userData));
          await this.storage.set('memberType', memberType);
          await this.storage.set('UserKey', JSON.stringify(userData.$key));

          this.sharedService.setLoggedInType(memberType);
          this.sharedService.setUserData(userData);
          await this.storage.set('loggedin_user', JSON.stringify(res.data));
          this.events.publish('user:loginsuccessfully', userData, res.data);

          if (this.sharedService.getDeviceToken()) {
            let key = userinfo[0].ParentClubKey;
            if (userType == 'coach') {
              key = userinfo[0].Key;
            }
            if (this.sharedService.getOnesignalPlayerId()) {
              this.commonService.saveDeviceDetsforNotify(key);
            }
          }

          if (this.sharedService.getThemeType() === 2) {
            this.commonService.navCtrl.setRoot("Dashboard");
            this.commonService.toastMessage("Logged in successfully...", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          }
        },
        error: (err) => {
          console.error("Error fetching events:", err);
          if (err && err.error && err.error.message) {
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage("Failed to fetch loggedin user details", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        }
      });
  }
}
