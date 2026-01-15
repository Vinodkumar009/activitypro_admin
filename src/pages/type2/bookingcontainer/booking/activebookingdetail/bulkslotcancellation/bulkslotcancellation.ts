import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment'
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../../services/sharedservice';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../../../services/common.service';
import { HttpService } from '../../../../../../services/http.service';
import { API } from '../../../../../../shared/constants/api_constants';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../../../shared/dtos/club.dto';
import { AppType } from '../../../../../../shared/constants/module.constants';



/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bulkslotcancellation',
  templateUrl: 'bulkslotcancellation.html',
})
export class BulkSlotCancellation {
  bookingConfig = {
    ActivityDuration: 0,
    AdvanceBookingAllowed: 0,//ina day
    MaxBookingLimit: 0,
    MaxBookingForTotaldays: 0
  }
  NoActiveBooking = "No Active Booking"
  selectedParentClubKey: any = "";
  selectedClubKey: any = "";
  memberKey: any;
  currencyDetails: any = "";
  slotsType: boolean = false;
  slotListing = [];
  slots = [];
  pastSlots = [];
  upCommingSlots = [];
  clubs: ClubVenueDto[] = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "all";
  loading: any;
  nestUrl: string = "";
  selectedTabInd = 0;
  Todayslots: any[];
  isClearStorage = false;
  deleteText = ""
  userkey: any;
  cancelReason = "";
  type: any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController, public storage: Storage,
    public fb: FirebaseService, public commonService: CommonService,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public sharedService: SharedServices, public http: HttpClient, private httpService: HttpService) {
    //this.sharedService.get
  

  }


  ionViewWillEnter() {
    this.nestUrl = this.sharedService.getnestURL();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userkey = val.$key
      this.type = this.navParams.get('type')
      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        this.selectedClubKey = user.ClubKey;
        this.memberKey = user.MemberKey;

        this.getClubDetails();
        break;
      }
    }).catch(error => {

    });
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  getClubDetails() {
    // this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //   this.clubs = data;
    //   if (data.length != 0) {
    //     this.selectedClubKey = this.clubs[0].$key;
    //     this.getAllActivity();
    //   }
    // });
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedService.getPlatform() == 'android' ? 1 : 2,
      device_id: this.sharedService.getDeviceId() || 'web',
      updated_by: this.sharedService.getLoggedInUserId()
    };

    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        this.clubs = res.data.map((club: ClubVenueDto) => ({ ...club, $key: club.FirebaseId, ClubKey: club.FirebaseId }));
        if (this.clubs.length > 0) {
          this.selectedClubKey = this.clubs[0].FirebaseId;
          this.getAllActivity();
        }
      },
      error: (err) => {
        this.clubs = [];
      }
    });
  }
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.ActivityList = [];
      this.selectedActivity = "";
      if (data.length > 0) {
        this.ActivityList = data;
        this.selectedActivity = this.ActivityList[0].$key;
      }
      this.getAllCourts();
    }, (err) => {
      
    });
  }
  getAllCourts() {
    this.fb.getAllWithQuery("Court/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
      this.courts = [];
      if (data.length > 0) {
        this.courts = data 
        this.selectedCourt = this.courts[0].$key
        //this.callbothfunction()
      }
    }, (err) => {

    });
  }
  getTime(date) {
    return moment(date, 'DD MM YYYY').format('D-MMM');
  }

  async callbothfunction(){
    this.getActiveBookings()
  }

  getActiveBookings(){
    if(this.selectedCourt){
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const selectedCourt = this.selectedCourt.toLowerCase() == 'all' ? 'nil' : this.selectedCourt;
      const url = `${API.ALL_BOOKING_BY_COURT}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${this.type}/${selectedCourt}`;
      
      this.httpService.get(url, null, null, 1).subscribe({
        next: (data: any) => {
          this.loading.dismiss()
          this.slots = data['data']
         
          this.slots.forEach(slot => {
            slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
            slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
            slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
            slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
            slot['IsSelect'] = false
          });

          this.slotListing = this.slots
        },
        error: (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
        }
      });
    }else{
      this.slots = [];
    }
  }

  openSearch(){
    let searchrow = document.getElementById('row');
    if(searchrow.style.display == "none"){
        $("#row").css("display", "block");
        document.getElementById('fab').classList.add('searchbtn')
    }else{
        $("#row").css("display", "none");
        document.getElementById('fab').classList.remove('searchbtn')
    }
}

  getFilterItems(ev: any) {

    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.slotListing = this.slotListing.filter((item) => {

        if (item.name != undefined ) {
          if (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if(item.slot_start_time != undefined){
          if (item.slot_start_time.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
      }
      if(this.getTime(item.booking_date) != undefined){
        if (this.getTime(item.booking_date).toLowerCase().indexOf(val.toLowerCase()) > -1)
          return true
      }
      if(item.courtname != undefined){
        if (item.courtname.toLowerCase().indexOf(val.toLowerCase()) > -1)
          return true
      }
      
      })
      
    }

}       

showConfirm(){
  if (this.deleteText != "DELETE"){
    this.commonService.toastMessage("Type 'DELETE' in input field", 3000, ToastMessageType.Error)
  }else{
    this.commonService.commonAlter('Deletion', 'Are you sure?', ()=>{
      this.cancelBulk()
    })
  }
}

cancelBulk(){
  return new Promise((resolve, reject) =>{
    const cancelIds = []
    this.slotListing.forEach((slot) =>{
      if (slot.IsSelect)
      cancelIds.push(slot.Id)
    })
    
    const body = {
      ids: cancelIds,
      cancelby: this.userkey,
      cancelreason: this.cancelReason
    };

    this.httpService.put(API.BULK_CANCEL_RECURRING_BY_ID, body, null, 1).subscribe({
      next: (res) => {
        resolve('success')
        this.commonService.toastMessage("Bookings cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop().then(() => this.navCtrl.pop(). then(() => this.navCtrl.pop()));
      },
      error: (err) => {
        console.log(err)
        this.commonService.toastMessage("Unable to cancel slot", 2000)
        reject('fail')
      }
    })
  })
}

initializeItems() {
    this.slotListing = this.slots
}

}