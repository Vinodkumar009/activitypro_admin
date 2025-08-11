import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment'
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../services/sharedservice';
import { FirebaseService } from '../../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../../services/common.service';
import { CallNumber } from '@ionic-native/call-number';



/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recurringbookingdetail',
  templateUrl: 'recurringbookingdetail.html',
})
export class RecurringBookingDetail {
  ParentClubKey: any;
 
  ClubKey: any;
  courtInfoObj: any;
  selectedCourt: any;
  slotInfo: any;
  selectedClub: any;
  Duration = 0
  currencyDetails: any;
  phoneNo: any;
  fromDashboard = false;
  userkey: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController, public storage: Storage,
    public fb: FirebaseService, public commonService: CommonService,
    public alertCtrl: AlertController,public events: Events , public loadingCtrl: LoadingController,public callNumber: CallNumber, public sharedService: SharedServices, public http: HttpClient) {
    //this.sharedService.get
      
    this.ParentClubKey  = this.navParams.get('ParentClubKey'),
    this.selectedClub = this.navParams.get('selectedClub')
    this.ClubKey = this.navParams.get('ClubKey'),
    this.courtInfoObj = this.navParams.get('courtInfoObj'),
    this.selectedCourt = this.navParams.get('selectedCourt')
    this.slotInfo = this.navParams.get('slotInfo')
    this.fromDashboard = this.navParams.get('fromDashboard')
    this.Duration = this.calculateDuration()
   // this.getPhone()
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);   
    }).catch(error => {
    });
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userkey = val.$key
    }).catch(error => {

    });
  }

  cancelBooking(){

  }

  calculateDuration(){
    let StartHour = +this.slotInfo.StartHour
    let StartMin = +this.slotInfo.StartMin
    let EndHour = +this.slotInfo.EndHour
    let EndMin = +this.slotInfo.EndMin

    let startTime = StartHour * 60 + StartMin
    let endTime = EndHour * 60 + EndMin

    return endTime - startTime
  }


  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: 'Cancel Booking',
      message: 'Do you want to cancel this booking?',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            //courtbooking/cancelCourt
            //ParentClubKey,CourtKey,Date,SlotInfoKey,SlotKey,CourtName,VanueKey,VanueName,ActivityKey,ParentClubkey,MemberName,Duration,
            //  this.fb.update(slideInfo.Slotkey,
            //   "CourtBooking/ParentClub/"+this.selectedParentClubKey+"/"+slideInfo["CourtInfo"]["CourtKey"]+"/SlotsTime/"+slideInfo.Date+"/Slots/",
            //   {IsEnable:true,IsCancel:true,CancelTime:new Date().getTime()});
            //  this.fb.update(slideInfo.SlotInfoKey,
            //     "CourtBooking/ParentClub/"+this.selectedParentClubKey+"/"+slideInfo["CourtInfo"]["CourtKey"]+"/SlotsTime/"+slideInfo.Date+"/Slots/"+slideInfo.Slotkey+"/SlotInfo",
            //     {IsEnable:true});
            //     this.commonService.toastMessage("Booking cancelled successfully", 5000, ToastMessageType.Success, ToastPlacement.Bottom);
            this.cancelCourt()
          }
        }
      ]
    });
    confirm.present();
  }

  // getPhone(){
  //   this.fb.getAllWithQuery("/Member/" + this.ParentClubKey + "/" + this.ClubKey + "/", { orderByKey: true, equalTo: this.slotInfo.MemberName.MemberKey}).subscribe((data) => {
  //      this.phoneNo = data[0]
  //   })
  // }

  getTime(date){
    return moment(new Date(date).toISOString()).format("DD-MMM-YYYY")
  }
  getMMMformat(date){
    return moment(date).format("DD-MMM-YYYY")
  }

  callToMember() {
    if (this.callNumber.isCallSupported()) {
      this.callNumber.callNumber(this.slotInfo.MemberName.PhoneNumber, true)
        .then(() => console.log())
        .catch(() => console.log());
    } else {
      this.commonService.toastMessage("Your device is not supporting to launch call dialer.", 3000);

    }
  }

 

  cancelCourt(){
    //recurringkey: string,@Query('slotDate') slotDate: 
    return new Promise((resolve, reject) =>{
      let nesturl = this.sharedService.getnestURL()
  
     let starttime = this.slotInfo.StartHour.toString().length == 1? "0"+this.slotInfo.StartHour.toString() +":"+this.slotInfo.StartMin : this.slotInfo.StartHour.toString() +":"+this.slotInfo.StartMin
     let endtime = this.slotInfo.EndHour.toString().length == 1? "0"+this.slotInfo.EndHour.toString() +":"+this.slotInfo.StartMin : this.slotInfo.EndHour.toString() +":"+this.slotInfo.EndMin
      this.http.put(`${nesturl}/courtbooking/cancelrecurringbooking_v2?recurringSlotKey=${this.slotInfo["RecurringSlotKey"]}&slotDate=${this.slotInfo["Date"]}&activitykey=${this.courtInfoObj.ActivityKey}&clubkey=${this.ClubKey}&parentclubkey=${this.ParentClubKey}&recurringkey=${this.slotInfo.RecurringKey}&booking_date=${this.slotInfo.Date}&slot_start_time=${starttime}&slot_end_time=${endtime}&courtkey=${this.courtInfoObj.$key}&cancelBy=${this.userkey}&cancelReason='n/a'`, null).subscribe((res) => {
        if (res['status'] == 200) {
          this.commonService.toastMessage("Booking cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
          let load =  'cancelled'
          this.events.publish('reload', load);
          this.navCtrl.pop()
        } else {
          this.commonService.toastMessage("Booking cancellation failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      },
        err => {
          this.commonService.toastMessage("Unable to cancel recurring slot", 2000)
          reject('fail')
        })

    })
  }

}