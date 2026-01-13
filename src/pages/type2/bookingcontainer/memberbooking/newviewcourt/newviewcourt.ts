import { Component, NgZone, } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, Events, ActionSheetController, Alert, AlertController, FabContainer } from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { TSMap } from 'typescript-map';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../../services/common.service';
import { FirebaseService } from '../../../../../services/firebase.service';
import { ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import { RequestOptions } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../services/sharedservice';
import * as $ from 'jquery';
import { dateValueRange } from 'ionic-angular/umd/util/datetime-util';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto, ClubVenueDto } from '../../../../../shared/dtos/club.dto';
import { AppType } from '../../../../../shared/constants/module.constants';
/**
 * Generated class for the ViewcourtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-newviewcourt',
  templateUrl: 'newviewcourt.html',
})
export class NewViewcourtPage {
  @ViewChild(Content) content: Content;



  nestUrl: string;
  courtSelected = 'all';
  slotofAllCourt = []
  showCalender = false;
  selectedDate: string;
  showDate: string = '';
  freeImageURl: string;
  loading: any;
  timeConstraint: any;
  allCourts: any = [];
  parentClubKey: any;
  selectedClub: any;
  currencyDetails: any;
  clubs: ClubVenueDto[] = [];
  selectedClubKey: any;
  ActivityList = [];
  selectedActivity: string;
  courts = [];
  selectedCourt: string;

  CourtFilter = [
    { court: 'All', key: 'all' },
    { court: 'Artificial Grass', key: '0' },
    { court: 'Clay', key: '1' },
    { court: 'Grass', key: '2' },
    { court: 'Hardcourt', key: '3' },
    { court: 'Astroturf', key: '4' },
    { court: 'Polymeric', key: '5' },
    { court: 'SyntheticTurf', key: '6' },
    { court: 'Carpet', key: '7' },
    { court:'Acrylic', key:'9' },
    { court:'Poraflex', key:'10' },
    { court:'Tarmac', key:'11' },
    {court:'Others', key:'8'},
  ]
  isMember = true;
  bookingDetails: any;
  memberType: string;
  dmmmyyyformatDtae: string;
  memberKey = "admin";
  Email: any;
  noOfSlootBook = 0;
  totalPrice = 0.00;
  selectedSlots = [];
  isTable = false
  Name: any;
  userKey: any;
  roleType:number;
  private isLoadingSlots: boolean = false; // Flag to prevent multiple simultaneous calls
  constructor(public sharedService: SharedServices, public events: Events, 
    public ngZone: NgZone, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
     public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService, 
     public storage: Storage, public commonService: CommonService, public http: HttpClient, public loadingCtrl: LoadingController, private httpService: HttpService) {
    //  this.events.subscribe('updateScreen', () => {
    //    this.ngZone.run(() => {
   

    //    });
    //  });
    this.storage.get('memberType').then((val) => {
      this.roleType = val
    }).catch(error => {
    });
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.Email = val.EmailID
      this.Name = val.Name
      this.userKey = val.$key;
      for (let user of val.UserInfo) {
        this.parentClubKey = user.ParentClubKey;
        this.selectedClub = user.ClubKey;
        for (let user of val.UserInfo) {
          if (val.IsHolidayCampMember) {
            this.isMember = false;
            this.memberType = "HolidayCampMember";
          }
          else if (val.IsSchoolMember) {
            this.isMember = false;
            this.memberType = "SchoolMember";  
          }
          break;
        }   
        this.nestUrl = this.sharedService.getnestURL()
        this.getClubDetails();
        // this.events.subscribe('reload', (load) => {
        //   if(load){
        //     this.getClubDetails();
        //   }
        // })

        break;
      }
    }).catch(error => {

    });
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
    
    
  }

  ngOnInit(){
   
  }






  //async getClubDetails() {

    // this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //   this.clubs = data;
    //   if (data.length != 0) {
    //     this.selectedClubKey = this.clubs[0].$key;
    //     this.getAllActivity();
    //   }
    // });
   
  //}
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.ActivityList = [];
      this.selectedActivity = "";
      if (data.length > 0) {
        this.ActivityList = data;
        this.selectedActivity = this.ActivityList[0].$key;
        if (this.commonService.checkResturant(this.selectedActivity)) {
          this.isTable = true
        }
      }
      this.getAllCourts();
    });
  }
  getAllCourts() {
    this.fb.getAllWithQuery("Court/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
      this.courts = [];
      if (this.isTable) {
        this.CourtFilter = [
          { court: 'All', key: 'all' }
        ]
      } else {
        this.CourtFilter = [
          { court: 'All', key: 'all' }, { court: 'Artificial Grass', key: '0' }, { court: 'Clay', key: '1' }, { court: 'Grass', key: '2' }, { court: 'Hardcourt', key: '3' }, { court: 'Astroturf', key: '4' }, { court: 'Polymeric', key: '5' }, { court: 'SyntheticTurf', key: '6' }, { court: 'Carpet', key: '7' },
        ]
      }

      this.selectedCourt = "";
      if (data.length > 0) {
        this.courts = data;
        this.courts.forEach(court => {
          this.CourtFilter.push({
            court: court['CourtName'],
            key: court.$key
          })
        })
        this.courtSelected = this.CourtFilter[0].key

      }
      if (this.showDate == '') {
        this.onDaySelect(new Date())
      } else {
        this.onDaySelect(new Date(this.selectedDate))
      }

    });
  }

  async getCourtSlots(date, courtKey) {
    // Prevent multiple simultaneous calls
    if (this.isLoadingSlots) {
      return;
    }
    
    this.isLoadingSlots = true;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    const courtwiseSlots = await this.getSlotsbyAPi(date, courtKey);
    this.isLoadingSlots = false;
  }

  getSlotsbyAPi(date, courtKey) {
    return new Promise((res, rej) => {
      try {
        this.slotofAllCourt = []
        const day = moment(date).format('ddd')
        const startDate = new Date(new Date(date).setHours(0, 0, 0)).getTime()
        const endDate = new Date(new Date(date).setHours(23, 59, 59)).getTime()
        const params = {
          date: date,
          activityKey: this.selectedActivity,
          clubKey: this.selectedClubKey,
          parentKey: this.parentClubKey,
          courtKey: this.courtSelected,
          isMember: this.isMember,
          day: day,
          startDate: startDate,
          endDate: endDate
        };
        
        this.httpService.get(API.GET_MULTI_COURT_SLOT, params, null, 1).subscribe({
          next: (response) => {
            if (this.loading) {
              this.loading.dismiss().catch(() => {});
            }
            if (response['data']['bookingDetails']) {
              this.bookingDetails = response['data']['bookingDetails']
            }
            if (response['data']['allCourtSlots']) {
              this.courts.forEach(court => {
                if (response['data']['allCourtSlots'][court.$key]) {
                  let slotData = response['data']['allCourtSlots'][court.$key]
                  this.slotofAllCourt.push({ slotData, courtInfo: court })
                }
              })
            }
            res('success')
          },
          error: (err) => {
            if (this.loading) {
              this.loading.dismiss().catch(() => {});
            }
            rej(err)
          }
        })
      } catch (err) {
        rej(err)
        if (this.loading) {
          this.loading.dismiss().catch(() => {});
        }
      }
    })
  }

  changeCourt() {
    if (this.courts.length > 0) {
      this.getCourtSlots(this.selectedDate, this.courtSelected)
    }
  }


  changeClub() {
    this.getAllActivity()
  }


  changeActivity() {
    if (this.commonService.checkResturant(this.selectedActivity)) {
      this.isTable = true
    }
    this.getAllCourts()
  }




  onDaySelect(event) {
    this.selectedDate = moment(event).format("YYYY-MM-DD")
    this.dmmmyyyformatDtae = moment(event).format('D-MMM-YYYY')
    this.showDate = moment(event).format("dddd, MMMM Do, YYYY")
    if (this.courts.length > 0) {
      this.getCourtSlots(this.selectedDate, this.courtSelected)
    }
    this.showCalender = false
  }

  getClubDetails() {
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



  bookslot(court, slideInfo) {
    // if(court.IsEnable == false && court.Purpose != ''){
    //   this.commonService.toastMessage(court.Purpose, 3000)
    // }else if(court.IsEnable == false && (court.Purpose == '' || !court.Purpose)){
    //   this.commonService.toastMessage('No information avaiable.', 2000)
    // }
    if (court.IsEnable == false) {
      this.calltobookinginfo(court, slideInfo)
    }
    else {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present().then(() => {
        {
          let creatTime = new Date(`${this.dmmmyyyformatDtae} 12:00`).getTime()
          let isAllow = false;
          if (this.isMember) {
            isAllow = true;
          } else {
            if (this.bookingDetails.IsAllowNonMember) {
              isAllow = true;
            }
          }

          if (isAllow) {
            if (court.IsEnable == true) {
              if (court.IsBooked == true) {
                court.IsBooked = false;
                court.IsEnable = true;
                --this.noOfSlootBook;
                let index = this.selectedSlots.indexOf(court)
                this.selectedSlots.splice(index, 1)
                delete this.selectedSlots[slideInfo.courtInfo['$key']]
                this.totalPrice -= parseFloat(court.Price)
                this.fb.deleteFromFb("CourtBooking/BlockCourt/" + slideInfo.courtInfo['$key'] + "/" + slideInfo.CreatedDate + "/" + court["BlockedKey"]);
              } else if (court.IsBooked == false) {
                let x = this.fb.getAll("CourtBooking/BlockCourt/" + slideInfo.courtInfo['$key'] + "/" + creatTime).subscribe((data) => {
                  let isBlocked = false;
                  for (let i = 0; i < data.length; i++) {
                    if (data[i].StartHour == court.StartHour && data[i].StartMin == court.StartMin && data[i].EndHour == court.EndHour && data[i].EndMin == court.EndMin) {
                      //let duration = moment(data[i])
                      let blockedHour = new Date(data[i].BlockedTime).getHours();
                      let blockMins = new Date(data[i].BlockedTime).getMinutes()
                      let nowHour = new Date().getHours();
                      let nowMins = new Date().getMinutes()
                      let calBlockMins = (blockedHour * 60) + blockMins;
                      let calNowMin = (nowHour * 60) + nowMins;
                      if ((calNowMin - calBlockMins) >= 5) {
                        isBlocked = false;
                      } else {
                        if (data[i].MemberKey == this.memberKey) {
                          isBlocked = false;
                        } else {
                          isBlocked = true;
                        }
                      }
                    }
                  }
                  if (isBlocked) {
                    this.commonService.toastMessage("Someone has already blocked this slot", 5000, ToastMessageType.Error, ToastPlacement.Bottom);
                  } else {
                    this.totalPrice += parseFloat(court.Price)
                    let obj = JSON.parse(JSON.stringify(court));
                    obj["MemberKey"] = this.memberKey;
                    obj["MemberName"] = 'Admin';
                    obj["EmailId"] = this.Email;
                    obj["ClubKey"] = this.selectedClubKey;
                    obj["Date"] = creatTime;

                    obj["BlockedTime"] = new Date().getTime();
                    let text = court.text
                    delete court.text
                    ++this.noOfSlootBook
                    let arr = []
                    this.selectedSlots.push(court)
                    let key = this.fb.saveReturningKey("CourtBooking/BlockCourt/" + slideInfo.courtInfo['$key'] + "/" + creatTime, obj);
                    court.Bookedfor = 'admin';
                    court.IsBooked = true;
                    //court.IsEnable = false;
                    court["BlockedKey"] = key;
                    court['courtKey'] = slideInfo.courtInfo['$key']
                    court['courtName'] = slideInfo.courtInfo['CourtName']
                    court['text'] = text

                  }
                  x.unsubscribe();
                });

              }
            } else {
              this.commonService.toastMessage("The slot is not available", 3000, ToastMessageType.Info, ToastPlacement.Bottom);
            }
          } else {
            this.commonService.toastMessage("Non members not allowed to book  ", 3000, ToastMessageType.Info, ToastPlacement.Bottom);
          }
        }
        this.loading.dismiss().catch(() => { });
      });
    }
  }

  continue() {
    this.navCtrl.push('BookingCourt', {
      selectedSlots: this.selectedSlots,
      noOfSlootBook: this.noOfSlootBook,
      parentClubKey: this.parentClubKey,
      clubKey: this.selectedClubKey,
      activityKey: this.selectedActivity,
      amount: this.totalPrice,
      allcourt: this.courts,  
      Email: this.Email,
      Name : this.Name,
      userKey: this.userKey,
      courtSelected: this.courtSelected,
      date: this.dmmmyyyformatDtae,
      selectedDate: this.selectedDate,
      roleType: this.roleType
    })
  }

  bookslotforamin() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      try {
        const paymentDEtails = {
          parentClubKey: this.parentClubKey,
          clubKey: this.selectedClubKey,
          courtKey: this.courtSelected,
          activityKey: this.selectedActivity,
          description: "booking court",
          discount: "0",
          amount: this.totalPrice,
          paymentDescription: "booking court",
          bookingParentMemberKey: 'admin',
          setupKey: "blank",
          source: "",
          currency: "blank",
          paymentMode: "blank",
          ExtraProperties: {},
          slots: [],
          members: []
        }
        let courtKey;
        const bookingSlots = []
        this.slotofAllCourt.forEach(slot => {
          slot.slotData.slots.forEach(eachSlots => {
            if (eachSlots.IsBooked) {
              courtKey = slot.courtInfo.$key
              bookingSlots.push(eachSlots)
            }
          });
        })
        paymentDEtails.courtKey = courtKey
        const creatTime = new Date(`${this.dmmmyyyformatDtae} 12:00`).getTime()
        for (let i = 0; i < bookingSlots.length; i++) {
          const obj = {
            Price: bookingSlots[i].Price,
            endHour: bookingSlots[i].EndHour,
            StartHour: bookingSlots[i].StartHour,
            StartMin: bookingSlots[i].StartMin,
            blockedKey: bookingSlots[i].BlockedKey,
            date: creatTime.toString(),
            endMin: bookingSlots[i].EndMin
          }
          paymentDEtails.slots.push(obj)
        }

        paymentDEtails.members.push({
          memberKey: 'admin',
          amount: this.totalPrice
        })
        
        this.httpService.post(API.BOOK_FOR_ADMIN, paymentDEtails, null, 1).subscribe({
          next: (res) => {
            this.loading.dismiss()
            if (res['data']) {
              this.commonService.toastMessage(res['data'], 2500, ToastMessageType.Success)
              this.navCtrl.pop()
            }
          },
          error: (err) => {
            this.loading.dismiss();
            this.commonService.toastMessage(err['data'], 2500, ToastMessageType.Success)
          }
        })
      } catch (err) {
        this.loading.dismiss();
      }
    })
  }

  calltobookinginfo(slot, slideInfo) {
    let clubIndex = this.clubs.findIndex(club => club.FirebaseId === this.selectedClubKey);
    let selectedClub = this.clubs[clubIndex].ClubName;
    this.navCtrl.push('ActiveBookingDetail',
    {
      ParentClubKey :  this.parentClubKey,
      selectedClub : selectedClub,
      ClubKey  : slideInfo.courtInfo['ClubKey'],
      courtInfoObj : slideInfo.courtInfo,
      selectedCourt : slideInfo.courtInfo,
      slotInfo : slot,
      fromnewviewpage: true
    });  

  }


  //.....................getting Booking releted information........................
}