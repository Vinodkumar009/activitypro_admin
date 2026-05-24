import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController,AlertOptions } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { SharedServices } from '../../../services/sharedservice';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { AppType } from '../../../../shared/constants/module.constants';

/**
 * Generated class for the RecuringbookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recuringbooking',
  templateUrl: 'recuringbooking.html',
})
export class RecuringbookingPage {
  selectedParentClubKey:any = "";
  selectedClubKey:any = "";
  memberKey:any;
  currencyDetails:any = "";
  slotsType:boolean = false;nestUrl: string;
  cancelReason = "n/a";
  userKey: any;
  selectOptions:AlertOptions = {
    title:"",
    subTitle:"",
    mode:"ios"
  };
  clubs:ClubVenueDto[] = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "";
  is_initial:boolean = true;
  recuringBookDetails:any = [];
  daysDetails = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  constructor(public navCtrl: NavController,public http: HttpClient, 
    public navParams: NavParams,public storage: Storage,
    public fb: FirebaseService,public commonService: CommonService,
    public alertCtrl: AlertController,public sharedService: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl:ToastController, private httpService: HttpService) {
    // this.storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   this.userKey = val.$key
    //   for (let user of val.UserInfo) {
    //     this.nestUrl = this.sharedService.getnestURL()
    //     this.selectedParentClubKey = user.ParentClubKey;
    //     this.selectedClubKey = user.ClubKey;
    //     this.memberKey = user.MemberKey;
    //     this.getClubDetails();
      
    //     break;
    //   }
    // }).catch(error => {

    // });
    // this.storage.get('Currency').then((val) => {
    //   this.currencyDetails = JSON.parse(val);
    // }).catch(error => {
    // });
    this.selectOptions.mode = 'ios';
  }

  
 
  ionViewWillEnter(){
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userKey = val.$key
      for (let user of val.UserInfo) {
        this.nestUrl = this.sharedService.getnestURL()
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
                }else{
                  this.ActivityList = [];
                  this.selectedActivity = "";
                }
              },
              error: (err) => {
                this.clubs = [];
              }
            });
  }
  
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
        // this.ActivityList = [];
        // this.selectedActivity = "";
        if (data.length > 0) {
            this.ActivityList = data;
            this.selectedActivity = this.ActivityList[0].$key;
            //if(!this.is_initial) this.getAllCourts();
            this.getAllCourts();
        }else{
          this.courts = [];
          this.selectedCourt = "";
        }
        //this.getAllCourts();
    });
  }
  getAllCourts(){
    this.fb.getAllWithQuery("/Court/"+this.selectedParentClubKey+"/"+this.selectedClubKey+"/"+this.selectedActivity,{orderByChild:'IsActive',equalTo:true}).subscribe(async (data) =>{
    //  this.courts = [];
    //  this.selectedCourt = "";
     if(data.length > 0){
        this.courts = data;
        this.selectedCourt = this.courts[0].$key;
        this.recuringBookDetails = [];
        //if(!this.is_initial) this.getrecuringBookDetails();
        this.getrecuringBookDetails();
      }else{
        this.courts = [];
        this.recuringBookDetails = [];
      }
      //await this.getrecuringBookDetails();
    });
  }
  // getrecuringBookDetrails(){
  //   this.fb.getAllWithQuery("CourtBooking/RecuringBooking/"+this.selectedParentClubKey+"/"+this.selectedClubKey+"/"+this.selectedActivity,{orderByChild:'CourtKey',equalTo:this.selectedCourt}).subscribe((data)=>{
  //     this.recuringBookDetails = [];
      
  //     for(let i = 0; i <  data.length ;i++){
  //       if(data[i].IsActive == true){
  //         if(new Date(data[i].EndDate).getTime() >= new Date().getTime()){
  //           let tempSet:Set<string> = new Set<string>();
  //           data[i].bookingDays = data[i].BookingDays
  //           let dayDetail = data[i].BookingDays.split(",");
  //           for(let k = 0 ; k < dayDetail.length ; k++){
  //             tempSet.add(dayDetail[k]);
  //           }
           
  //           data[i].BookingDays = tempSet;
  //         this.recuringBookDetails.push(data[i]);
  //         }
  //       }
  //     }
  //   })
  // }

  getrecuringBookDetails(){
    this.commonService.showLoader('Please wait');
    const url = `${API.GET_RECURRING_LIST}/${this.selectedParentClubKey}/${this.selectedCourt}`;
    
    this.httpService.get(url, null, null, 1).subscribe({
      next: (data:any) => {
        this.recuringBookDetails = []
        this.commonService.hideLoader()
        const activityname = this.ActivityList.filter((act) => this.selectedActivity == act.$key)[0].ActivityName

        for(let i = 0; i <  data.data.length ;i++){
          if(new Date(data.data[i].enddate).getTime() >= new Date().getTime()){
            const tempSet:Set<string> = new Set<string>();
            data.data[i].startdate = moment.utc(data.data[i].startdate).local().format('D-MMM-YY')
            data.data[i].enddate = moment.utc(data.data[i].enddate).local().format('D-MMM-YY')
            const dayDetail = data.data[i].bookingdays.split(",");
            for(let k = 0 ; k < dayDetail.length ; k++){
              if (dayDetail[k] != " "){
                tempSet.add(dayDetail[k]);
              }
            }
            data.data[i]['activityname'] = activityname
            data.data[i].bookingdays = tempSet;
            this.recuringBookDetails.push(data.data[i]);
          }
        }
        this.is_initial = false;
      },
      error: (err) => {
        console.log(err)
        this.commonService.hideLoader() 
        this.commonService.toastMessage("Unable to get recurrings", 2000)
      }
    })
  }


  //On Club selection change
  onClubChange(val:any){
    this.selectedClubKey = val;
    this.getAllActivity();
  }

  //On Activity selection change
  onActivityChange(val:any){
    this.selectedActivity = val;
    this.getAllCourts();
  }

  //On Court selection change
  onCourtChange(val:any){
    this.selectedCourt = val;
    this.getrecuringBookDetails();
  }




  getTime(time){
    return moment(time).format('D-MMM-YY');;
  }
  addRecuringBooking(){
    this.navCtrl.push("AddrecuringbookingPage");
  }
  presentActionSheet(info) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Delete Booking',
          handler: () => {
            console.log(info);
            this.showConfirm(info);
          }
        },
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Close clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }
  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
        message: m,
        duration: howLongShow,
        position: 'bottom'
    });
    toast.present();
  }
  showConfirm(info) {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'yes',
          handler: async() => {
            //this.fb.update(info.$key,"CourtBooking/RecuringBooking/"+info.ParentClubKey+"/"+info.ClubKey+"/"+info.ActivityKey,{IsActive:false});
            //await this.cancelrecurring(info.$key, info.ParentClubKey, info.ClubKey, info.ActivityKey, info.CourtKey, info.bookingDays, info.EndTime, info.EndDate, info.StartTime, info.StartDate, info.BookingFor, this.userKey, this.cancelReason)
            await this.cancelrecurring_v2(info.Id,this.userKey, this.cancelReason)
            this.showToast("Successfully deleted",2000);
          }
        }
      ]
    });
    confirm.present();
  }
  getFirst(name:string){
    return name.charAt(0);
  }

  cancelrecurring(recurringkey, parentclubkey, clubkey, activitykey, courtkey, bookingdays, endtime, enddate, starttime, startdate, bookingfor, cancelBy, cancelReason){
    return new Promise((resolve, reject) =>{
      const data = {
        recurringkey,
        parentclubkey,
        clubkey,
        activitykey,
        courtkey,
        bookingdays,
        endtime,
        enddate,
        starttime,
        startdate,
        bookingfor,
        cancelBy,
        cancelReason
      }
      
      this.httpService.put(API.CANCEL_RECURRING_V3, data, null, 1).subscribe({
        next: (res) => {
          resolve('success')
          this.commonService.hideLoader()
        },
        error: (err) => {
          console.log(err)
          this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to create recurring slot", 2000)
          reject('fail')
        }
      })
    })
  }

  cancelrecurring_v2(id,cancelBy, cancelReason){
    return new Promise((resolve, reject) =>{
      const data = {
        id,
        cancelBy,
        cancelReason
      }
      
      this.httpService.put(API.CANCEL_RECURRING_BY_ID, data, null, 1).subscribe({
        next: (res) => {
          resolve('success')
          this.commonService.hideLoader()
          this.navCtrl.pop()
        },
        error: (err) => {
          console.log(err)
          this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to cancel recurring slot", 2000)
          reject('fail')
        }
      })
    })
  }

}
