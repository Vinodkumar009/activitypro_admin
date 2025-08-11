import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment'
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../../services/sharedservice';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../../../services/common.service';



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
  clubs = [];
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
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public sharedService: SharedServices, public http: HttpClient) {
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

    this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (data.length != 0) {
        this.selectedClubKey = this.clubs[0].$key;
        this.getAllActivity();
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
      let selectedCourt = this.selectedCourt
      if (this.selectedCourt.toLowerCase() == 'all'){
        selectedCourt = 'nil'
      }
      this.http.get(`${this.nestUrl}/courtbooking/allbookingbycourt/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${this.type}/${selectedCourt}`)
        .subscribe((data: any) => {
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
  
        }, (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
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
    let cancelIds = []
    this.slotListing.forEach((slot) =>{
      if (slot.IsSelect)
      cancelIds.push(slot.Id)
    })
    this.http.put(`${this.nestUrl}/courtbooking/bulkcancelrecurringbyid`,{ids:cancelIds, cancelby:this.userkey, cancelreason:this.cancelReason}).subscribe((res) => {
      resolve('success')
      //this.commonService.hideLoader()
      this.commonService.toastMessage("Bookings cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
      this.navCtrl.pop().then(() => this.navCtrl.pop(). then(() => this.navCtrl.pop()));
    },
      err => {
        console.log(err)
        //this.commonService.hideLoader() 
        this.commonService.toastMessage("Unable to cancel slot", 2000)
        reject('fail')
      })
  })
}

initializeItems() {
    this.slotListing = this.slots
}

}