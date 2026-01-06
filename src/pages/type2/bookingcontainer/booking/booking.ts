import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment'
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { AppType } from '../../../../shared/constants/module.constants';



/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html',
})
export class BookingPage {
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
  clubs:ClubVenueDto[] = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "all";
  loading: any;
  nestUrl: string = "";
  selectedTabInd = 0;
  Todayslots: any[];
  isClearStorage = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController, public storage: Storage,
    public fb: FirebaseService, public commonService: CommonService,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public sharedService: SharedServices, 
    public http: HttpClient, private httpService: HttpService) {
    //this.sharedService.get


  }


  ionViewWillEnter() {
    this.nestUrl = this.sharedService.getnestURL();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);

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

  async callbothfunction() {

    this.slotListing = []
    if (this.selectedTabInd === 0) {
      let key = `today-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
      let data = await this.commonService.getDataWithExpiry(key)
      if (data == null) {
        this.getTodayBookings()
      } else {
        this.slotListing = data
      }

    } else {
      let key = `allday-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
      let data = await this.commonService.getDataWithExpiry(key)
      if (data == null) {
        this.getActiveBookings()
      } else {
        this.slotListing = data
      }
    }
  }

  doRefresh(event) {

    if (this.selectedTabInd === 0) {
      this.getTodayBookings()
    } else {
      this.getActiveBookings()
    }
    event.complete();


  }

  // getTodayBookings() {
  //   if(this.selectedCourt){
  //     this.loading = this.loadingCtrl.create({
  //       content: 'Please wait...'
  //     });
  //     this.loading.present();
  //     let startDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  //     let lasttDate = new Date(new Date().setHours(23, 59, 59)).getTime();
  //     this.http.get(`${this.nestUrl}/courtbooking/bookingHistory?parentClubKey=${this.selectedParentClubKey}&activitykey=${this.selectedActivity}&courtkey=${this.selectedCourt}&clubKey=${this.selectedClubKey}&startDate=${startDate}&endDate=${lasttDate}`)
  //       .subscribe(async (data: any) => {
  //         this.loading.dismiss()
  //         if(this.selectedCourt == 'all'){
  //           this.Todayslots = []
  //           for(let i =0 ; i< this.courts.length ; i++){
  //             let slot: any = data.data.allCourtSlots[this.courts[i].$key]
  //             if(slot){  

  //               slot.forEach(eachSlot => { 
  //                 eachSlot.CourtInfo = {  
  //                   ...this.courts[i],
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.Todayslots.push(eachSlot)
  //               });
  //             }
  //           }
  //         }
  //         else if (this.selectedCourt != 'all' && data.data.allCourtSlots[this.selectedCourt]!=undefined) {
  //           this.Todayslots = [];
  //           // this.courts.forEach(async (eachCourt: any) => { })

  //             let slot: any = data.data.allCourtSlots[this.selectedCourt]
  //             if(slot){
  //              let court = this.courts.filter(court => court.$key == this.selectedCourt)[0]
  //               slot.forEach(eachSlot => {
  //                 eachSlot.CourtInfo = {
  //                   ...court
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.Todayslots.push(eachSlot)
  //               });   
  //             }


  //         }
  //         this.slotListing = this.Todayslots
  //         let key = `today-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
  //         const date = new Date();
  //         date.setDate(date.getDate() + 30);
  //         const ttl = new Date(date).getTime();
  //         this.commonService.setDataWithExpiry(key, this.Todayslots, ttl);
  //          // this.getSortedSlots();
  //       }, (err) => {
  //         console.log(JSON.stringify(err));
  //         this.loading.dismiss()
  //       });
  //   }else{
  //     this.slots = [];

  //   }

  // }

  // getActiveBookings() {
  //   if(this.selectedCourt){
  //     this.loading = this.loadingCtrl.create({
  //       content: 'Please wait...'
  //     });
  //     this.loading.present();
  //     let startDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  //     let tempDate: any = moment().add(30, 'days');
  //     let lasttDate = new Date(new Date(tempDate).setHours(23, 59, 59)).getTime();
  //     this.http.get(`${this.nestUrl}/courtbooking/bookingHistory?parentClubKey=${this.selectedParentClubKey}&activitykey=${this.selectedActivity}&courtkey=${this.selectedCourt}&clubKey=${this.selectedClubKey}&startDate=${startDate}&endDate=${lasttDate}`)
  //       .subscribe((data: any) => {
  //         this.loading.dismiss()
  //         if(this.selectedCourt == 'all'){
  //           this.slots = []
  //           for(let i =0 ; i< this.courts.length ; i++){
  //             let slot: any = data.data.allCourtSlots[this.courts[i].$key]
  //             if(slot){  

  //               slot.forEach(eachSlot => {
  //                 eachSlot.CourtInfo = {  
  //                   ...this.courts[i],
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.slots.push(eachSlot)
  //               });
  //             }
  //           }
  //         }
  //         else if (this.selectedCourt != 'all' && data.data.allCourtSlots[this.selectedCourt]!=undefined) {
  //           this.slots = [];
  //           // this.courts.forEach(async (eachCourt: any) => { })

  //             let slot: any = data.data.allCourtSlots[this.selectedCourt]
  //             if(slot){
  //              let court = this.courts.filter(court => court.$key == this.selectedCourt)[0]
  //               slot.forEach(eachSlot => {
  //                 eachSlot.CourtInfo = {
  //                   ...court
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.slots.push(eachSlot)
  //               });   
  //             }


  //         }
  //         this.slotListing = this.slots
  //          // this.getSortedSlots();
  //          let key = `allday-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
  //          const date = new Date();
  //          date.setDate(date.getDate() + 30);
  //          const ttl = new Date(date).getTime();
  //          this.commonService.setDataWithExpiry(key, this.slots, ttl);

  //       }, (err) => {
  //         console.log(JSON.stringify(err));
  //         this.loading.dismiss()
  //       });
  //   }else{
  //     this.slots = [];
  //    // this.commonService.toastMessage('No Record', 3000)
  //   }

  // }

  getActiveBookings() {
    if (this.selectedCourt) {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const selectedCourt = this.selectedCourt.toLowerCase() == 'all' ? 'nil' : this.selectedCourt;
      const url = `${API.ALL_ACTIVE_BOOKING_BY_COURT}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${selectedCourt}`;
      
      this.httpService.get(url, null, null, 1).subscribe({
        next: (data: any) => {
          this.loading.dismiss()
          this.slots = data['data']
          this.slotListing = this.slots
          this.slots.forEach(slot => {
            slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
            slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
            slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
            slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
          });
          const key = `allday-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
          const date = new Date();
          date.setDate(date.getDate() + 30);
          const ttl = new Date(date).getTime();
          this.commonService.setDataWithExpiry(key, this.slots, ttl);
        },
        error: (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
        }
      });
    } else {
      this.slots = [];
    }
  }
  getTodayBookings() {
    if (this.selectedCourt) {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const startDate = moment().format('YYYY-MM-DD')
      const selectedCourt = this.selectedCourt.toLowerCase() == 'all' ? 'nil' : this.selectedCourt;
      const url = `${API.ACTIVE_BOOKING_IN_RANGE}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${startDate}/${startDate}/${selectedCourt}`;
      
      this.httpService.get(url, null, null, 1).subscribe({
        next: (data: any) => {
          this.loading.dismiss()
          this.Todayslots = data['data']
          this.slotListing = this.Todayslots
          this.Todayslots.forEach(slot => {
            slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
            slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
            slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
            slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
          });
          const key = `today-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
          const date = new Date();
          date.setDate(date.getDate() + 30);
          const ttl = new Date(date).getTime();
          this.commonService.setDataWithExpiry(key, this.Todayslots, ttl);
        },
        error: (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
        }
      });
    } else {
      this.slots = [];
    }
  }

  goToRecuringbooking() {
    this.navCtrl.push('RecuringbookingPage');
  }

  openSearch() {
    let searchrow = document.getElementById('row');
    if (searchrow.style.display == "none") {
      $("#row").css("display", "block");
      document.getElementById('fab').classList.add('searchbtn')
    } else {
      $("#row").css("display", "none");
      document.getElementById('fab').classList.remove('searchbtn')
    }
  }

  changeTab(tabIndex: number) {
    this.selectedTabInd = tabIndex;
    this.callbothfunction()
  }

  getFilterItems(ev: any) {

    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.slotListing = this.slotListing.filter((item) => {

        if (item.name != undefined) {
          if (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if (item.slot_start_time != undefined) {
          if (item.slot_start_time.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if (this.getTime(item.booking_date) != undefined) {
          if (this.getTime(item.booking_date).toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if (item.courtname != undefined) {
          if (item.courtname.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }

      })

    }

  }
  initializeItems() {
    if (this.selectedTabInd === 0) {
      this.slotListing = this.Todayslots
    } else {
      this.slotListing = this.slots
    }
  }

  //Actionshett for cancel

  gotoDetails(slot) {
    let clubIndex = this.clubs.findIndex(club => club.FirebaseId === this.selectedClubKey);
    let selectedClub = this.clubs[clubIndex].ClubName;
    this.navCtrl.push('ActiveBookingDetail',
      {
        ParentClubKey: this.selectedParentClubKey,
        selectedClub: selectedClub,
        ClubKey: this.selectedClubKey,
        // courtInfoObj : slot.CourtInfo,
        // selectedCourt :  slot.CourtInfo,
        slotInfo: slot,

      });
  }

  goTofilterpage() {
    this.navCtrl.push("FilterbookingsPage");
  }

}