import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-superdashboarddetails',
  templateUrl: 'superdashboarddetails.html',
})
export class SuperDashboardDetailsPage {
  TempParentClubs=[];
  parentclubs=[];
  totalmembercount: any;
  nestUrl: any;
  countparentClubs = []
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController, 
    public storage: Storage,
    private http:HttpClient,
    public commonService: CommonService,
    public fb: FirebaseService,
     public navParams: NavParams,
     public sharedService:SharedServices) {
      console.log('ionViewDidLoad AppadmindashboardPage');
      this.nestUrl = this.sharedService.getnestURL();
      //this.userData = this.sharedService.getUserData();
      //console.log(this.userData);
      this.parentclubs = this.navParams.get('parentclubs')
      this.getParentClubs()
  }

  getParentClubs() {
    //https://activitypro-nest-261607.appspot.com
    this.commonService.showLoader('Fetching...');
    this.http.get(`${this.nestUrl}/superadmin/membercount`).subscribe((res:any) => {
      this.commonService.hideLoader();
      if (res.data) {
        //this.parentclubs = this.commonService.convertFbObjectToArray(res.data);
        this.countparentClubs = res.data.memberForParentClub;
        this.totalmembercount = res.data.totalmembercount
        //console.log(this.parentclubs);
        //
        this.parentclubs.forEach(clubs =>{

          const parent = this.countparentClubs.filter((clubs) => {clubs.parentclubfirebasekey == clubs.Key})
          if (parent.length > 0){
            clubs['membercount'] = parent[0]['memberCount']
          }
          else
          clubs['membercount'] = 0
        })
      }
    }, (err) => {
      this.commonService.hideLoader();
      console.log("There is some problem while fetching")
    })
  }
  getFilterItems(ev: any) {
    // Reset items back to all of the items
    let val = ev.target.value;
    this.TempParentClubs = JSON.parse(JSON.stringify(this.parentclubs))
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '' && val.length > 3) {
      this.TempParentClubs = this.parentclubs.filter((item) => {
        if (item.ParentClubName != undefined) {
          return (item.ParentClubName.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    } else {
      this.TempParentClubs = this.parentclubs;
    }
  }

}
