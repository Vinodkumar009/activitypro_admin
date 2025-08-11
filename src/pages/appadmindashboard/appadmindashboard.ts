import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, IonicPage, ToastController, NavParams } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../services/language.service';
import { Storage } from '@ionic/storage';
import { BookingMemberType, CommonService } from '../../services/common.service';
import { FirebaseService } from '../../services/firebase.service';



/**
 * Generated class for the AppadmindashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appadmindashboard',
  templateUrl: 'appadmindashboard.html',
})
export class AppadmindashboardPage {
  nodeUrl: string = "";
  userData: any = {};
  parentclubs: any;
  TempParentClubs: Array<any> = [];
  showDash = false
  loading:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public storage: Storage,
    private http: HttpClient,
    public commonService: CommonService,
    public fb: FirebaseService,
    public sharedService: SharedServices,
    public popoverCtrl: PopoverController,) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppadmindashboardPage');
    //this.nodeUrl = this.sharedService.getnodeURL();
    //this.userData = this.sharedService.getUserData();
    //console.log(this.userData);
    this.storage.get('APadminDetails').then((val) => {
      let emailId = val
      const Apadmin$Obs = this.fb.getAllWithQuery("User/APAdmin/", { orderByChild: 'EmailID', equalTo: emailId }).subscribe((AppAdminresponce) => {
        if (AppAdminresponce.length > 0) {
          if (AppAdminresponce[0].RoleType == "99" && AppAdminresponce[0].UserType == "20") {
            this.showDash = true;
          }
        }
      });
      // Apadmin$Obs.unsubscribe();   
    });
    this.commonService.getDataWithExpiry('AllParentClubs').then((parentclubs) => {
      if (parentclubs) {
        if (parentclubs.length > 0) {
          console.log("api called")
          this.parentclubs = parentclubs;
          this.TempParentClubs = JSON.parse(JSON.stringify(this.parentclubs));

        }
      } else {
        console.log("api called")
        this.getParentClubs();
      }
    })
    .catch(err => {
      this.getParentClubs();
    })

  }

  showLoader(){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }

  hideLoader(){
    this.loading.dismiss().catch(() => { });
  }

  refreshList() {
    
    this.getParentClubs();
  }

  async getParentClubs() {
    //https://activitypro-nest-261607.appspot.com
    this.http.get(`https://activitypro-nest-261607.appspot.com/superadmin/parentclubs`).subscribe((res: any) => {
      if (res.status == 200 && res.data) {
        this.parentclubs = [];
        this.parentclubs = res.data;
        //console.log(this.parentclubs);
        this.TempParentClubs = JSON.parse(JSON.stringify(this.parentclubs));
        const date = new Date();
        date.setDate(date.getDate() + 30);
        const ttl = new Date(date).getTime();
        this.commonService.setDataWithExpiry('AllParentClubs', this.parentclubs, ttl);

      }
    },(err) => {
      console.log("There is some problem while fetching")
    })
  }

  

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '' && val.length > 3) {
      this.TempParentClubs = this.parentclubs.filter((item) => {
        if (item.ParentClubName != undefined) {
          return (item.ParentClubName.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    }else {
      this.TempParentClubs = this.parentclubs;
    }
  }



  GetParentClubInfo(parentClub: any) {
    console.log(parentClub);
    this.storage.set('memberType', BookingMemberType.ADMIN);
    this.sharedService.setLoggedInType(BookingMemberType.ADMIN);
    this.commonService.showLoader("Please wait");
    const user$Obs = this.fb.getAllWithQuery("User/", { orderByKey: true, equalTo: parentClub.LoggedInKey}).subscribe((data) => {
      console.log(data);
      user$Obs.unsubscribe();
      if (data.length > 0) {
        let userinfo: Array<any>;
        this.storage.set('isLogin', true);
        this.storage.set('LoginWhen', 'first');
        userinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);
        data[0].UserInfo = userinfo;
        this.storage.set('userObj', JSON.stringify(data[0]));
        this.storage.set('memberType', BookingMemberType.ADMIN);
        this.storage.set('UserKey', JSON.stringify(data[0].$key));
        this.sharedService.setUserData(data[0]);
        this.getUserMenus(data[0]);
      }
    }, (err) => {
      this.commonService.hideLoader();
      console.log("there is some problem");
    });
  }

  getUserMenus(user){
    let menuDataObs$ = this.fb.getAllWithQuery(`UserMenus/${user.UserInfo[0].ParentClubKey}`, { orderByKey: true, equalTo: user.$key}).subscribe((menuData) =>{
      const menus = this.commonService.convertFbObjectToArray(menuData[0].Menu).filter(menu => menu.MobileAccess);
      this.commonService.hideLoader();
      this.sharedService.setMenu(menus);
      this.storage.remove("Menus");
      this.storage.set("Menus",(JSON.stringify(menus)));
      menuDataObs$.unsubscribe();
      this.navCtrl.push("Dashboard");
    },(err)=>{
      this.commonService.hideLoader();
    })
  }

  gotoDashBoard() {
    this.navCtrl.push('SuperDashboardDetailsPage', { parentclubs: this.parentclubs });
  }

  gotoPromotion(){
    this.navCtrl.push('SuperuserPromotion', { parentclubs: this.parentclubs })
  }

}
