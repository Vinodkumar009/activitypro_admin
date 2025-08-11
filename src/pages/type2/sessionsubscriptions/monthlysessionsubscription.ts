import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, ActionSheetController, FabContainer} from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService } from '../../../services/common.service';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the SessionsubscriptionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-monthlysessionsubscription',
  templateUrl: 'monthlysessionsubscription.html',
})
export class MonthlySessionSubscription {
  platform: string = "";
  ParentClubKey: any;
  Setups = [];
  Options: any[];
  temp;
  Venues;
  currencyDetails: any;
  selectedClubKey: any;
  ClubNameData: any;
  filterSetup = [];
  subscriptions = [];
  loading: any;
  nestUrl: string;
  currencycode: any;
  constructor(public alertCtrl: AlertController,
    public navCtrl: NavController,
    private fb: FirebaseService,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    public http: HttpClient,
    public sharedservice: SharedServices,
    public comonService: CommonService) {
    this.platform = this.sharedservice.getPlatform();
    this.nestUrl = sharedservice.getnestURL();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.currencycode = val.Currency;
      }
      console.log("ParentClubKey: ", this.ParentClubKey)

      this.getAllVenue(this.ParentClubKey)
      //this.getAllSetups(this.ParentClubKey)

    })
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SessionsubscriptionsPage');
  }

  getAllVenue(ParentClubKey) {
    this.Venues = [];
    this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {
          this.Venues.push(data[i]);


        }
      }
      this.selectVenue(this.Venues[this.Venues.length - 1].$key)
    });

  }
  GotoDets(session) {
    this.navCtrl.push('MonthlyMemberListing', {session});
  }
  selectVenue(event) {
    this.selectedClubKey = event;
    console.log(this.selectedClubKey)
    console.log(this.Venues)
    this.getSubscriptionsByVenue(this.selectedClubKey)
  }
  getSubscriptionsByVenue(selectedClubKey) {
    this.subscriptions = [];
    try {
      this.comonService.showLoader("Please wait");
      //this.nestUrl = "http://localhost:3000";
      this.http.get(`${this.nestUrl}/session/monthlysessionsubscriptions?parentclub=${this.ParentClubKey}&club=${selectedClubKey}`).subscribe((res) => {
        this.comonService.hideLoader();
        if (res['data'].length > 0) {
          res['data'].forEach(session => {
            if (session.IsActive) {
              if (session.Member) {
                session.Member = this.comonService.convertFbObjectToArray(session.Member);
                this.subscriptions.push(session);
              }
              // eachSetup['memberPresent'] = eachSetup['memberPresent'].filter(ele => ele.IsActive)
              // eachSetup['memberPresentCount'] = eachSetup['memberPresent'].length
            }
          });
        }
      },
      err => {
        this.comonService.hideLoader();
      })
    } catch (err) {
      this.comonService.hideLoader();
    }

  }

  getFormattedDate(date:any){
    return moment(date,"YYYY-MM-DD").format("DD-MMM-YYYY");
  }

  gotoHistory(session) {

  }




}
