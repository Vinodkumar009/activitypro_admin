import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
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
  selector: 'page-activebookingdetail',
  templateUrl: 'activebookingdetail.html',
})
export class ActiveBookingDetail {
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
  fromnewviewpage: any;
  cancelReason ="n/a";
  userkey: any;
  nestUrl: string;
  cancelby: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController, public storage: Storage,
    public fb: FirebaseService, public commonService: CommonService,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,public callNumber: CallNumber, public sharedService: SharedServices, public http: HttpClient) {
    //this.sharedService.get
    this.nestUrl = this.sharedService.getnestURL()
    this.ParentClubKey  = this.navParams.get('ParentClubKey'),
    this.selectedClub = this.navParams.get('selectedClub')
    this.ClubKey = this.navParams.get('ClubKey'),
    // this.courtInfoObj = this.navParams.get('courtInfoObj'),
    // this.selectedCourt = this.navParams.get('selectedCourt')
    this.slotInfo = this.navParams.get('slotInfo')
    this.fromDashboard = this.navParams.get('fromDashboard')
    this.fromnewviewpage = this.navParams.get('fromnewviewpage')
    if (this.fromnewviewpage || this.fromDashboard){
      this.getSlotInfoById(this.slotInfo.Id)
      
    }else{
      this.slotInfo.phone_number = this.slotInfo.phone_number == "n/a" ? "" : this.slotInfo.phone_number
      this.Duration = this.calculateDuration()
    }
   
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
    let startTimeArr = this.slotInfo.slot_start_time.split(":")
    let endTimeArr = this.slotInfo.slot_end_time.split(":")
    let StartHour = +startTimeArr[0]
    let StartMin = +startTimeArr[1]
    let EndHour = +endTimeArr[0]
    let EndMin = +endTimeArr[1]

    let startTime = StartHour * 60 + StartMin
    let endTime = EndHour * 60 + EndMin

    return endTime - startTime
  }

  getTime(date) {
    return moment(date, 'DD MM YYYY').format('DD-MMM-YYYY');
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
            this.cancelCourtv2()
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

  callToMember() {
    if (this.callNumber.isCallSupported()) {
      this.callNumber.callNumber(this.slotInfo.phone_number, true)
        .then(() => console.log())
        .catch(() => console.log());
    } else {
      this.commonService.toastMessage("Your device is not supporting to lunch call dialer.", 3000);

    }
  }

 

  cancelCourt() {
    
    let courtInfoObj = {}

    courtInfoObj["ParentClubKey"] = this.ParentClubKey;
  
    courtInfoObj["VanueName"] = this.selectedClub;
    courtInfoObj["ClubKey"] = this.ClubKey;
    courtInfoObj["ActivityKey"] =this.courtInfoObj.ActivityKey
   
    courtInfoObj["CourtInfo"] = {
      ActivityKey: this.courtInfoObj.ActivityKey,
      ClubKey: this.courtInfoObj.ClubKey,
      CourtName: this.courtInfoObj.CourtName,
      CourtType: this.courtInfoObj.CourtType,
      CourtKey :this.courtInfoObj.$key
    };
 
  
    courtInfoObj["DateTime"] = this.slotInfo.Date;
    courtInfoObj["Member"] = this.slotInfo.Member[0];
    courtInfoObj["Time"] = this.slotInfo.StartHour + ":" + this.slotInfo.StartMin + "-" + this.slotInfo.EndHour + ":" + this.slotInfo.EndMin;
    courtInfoObj["BookingDate"] = moment(Number(this.slotInfo.Date)).format("ddd D MMM");// courtInfo.Date;
    //courtInfoObj["BookingDate"] = moment(Number(courtInfo.Date)).format("ddd D MMM");
    courtInfoObj["Price"] = parseFloat(this.slotInfo.Price).toFixed(2);
    courtInfoObj["dateYYYYMMDD"] = moment(Number(this.slotInfo.Date)).format("YYYY-MM-DD")
    courtInfoObj["cancelBy"] = this.userkey
    courtInfoObj["cancelReason"] = this.cancelReason
    courtInfoObj["SlotInfoKey"] = this.slotInfo.SlotInfoKey;
    courtInfoObj["Slotkey"] = this.slotInfo.Slotkey;
    //Price
  
    this.http.post(`${this.nestUrl}/courtbooking/cancelCourt`, courtInfoObj).subscribe((res: any) => {
      if (res.status == 200) {
        this.commonService.toastMessage("Booking cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
        if(this.fromnewviewpage)
          this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
        else
          this.navCtrl.pop();
      } else {
        this.commonService.toastMessage("Booking cancellation failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }, (err) => {
      this.commonService.toastMessage("Booking cancellation failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      console.log(err);
    });
  }

  cancelCourtv2() {
    return new Promise((resolve, reject) =>{
 
      
      this.http.put(`${this.nestUrl}/courtbooking/cancelslotwithid`,{id:this.slotInfo.Id, cancelby:this.userkey, cancelreason:this.cancelReason}).subscribe((res) => {
        resolve('success')
        //this.commonService.hideLoader()
        this.commonService.toastMessage("Booking cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
        if(this.fromnewviewpage)
          this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
        else
          this.navCtrl.pop();
      },
        err => {
          console.log(err)
          //this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to cancel slot", 2000)
          reject('fail')
        })
    })
  }

  getSlotInfoById(id){
    return new Promise((resolve, reject) =>{

      this.http.get(`${this.nestUrl}/courtbooking/getslotbyid/${id}`).subscribe((res) => {
       
        resolve('success')
        this.slotInfo = res["data"]
        this.slotInfo.slot_start_time = moment(this.slotInfo.slot_start_time, 'HH:mm:ss').format('HH:mm')
        this.slotInfo.slot_end_time = moment(this.slotInfo.slot_end_time, 'HH:mm:ss').format('HH:mm')
        this.slotInfo.booking_transaction_time = moment.utc(this.slotInfo.booking_transaction_time).local().format('DD-MMM-YYYY')
        this.slotInfo.booking_date = moment.utc(this.slotInfo.booking_date).local().format('DD MM YYYY')
        this.slotInfo.phone_number = this.slotInfo.phone_number == "n/a" ? "" : this.slotInfo.phone_number
        this.Duration = this.calculateDuration()
      },
        err => {
          console.log(err)
          //this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to get slot info", 2000)
          reject('fail')
        })
    })
  }

  gotoBulkCancel(){
    this.navCtrl.push('BulkSlotCancellation', {
      type :  this.slotInfo.booking_type
    })
  }

}
