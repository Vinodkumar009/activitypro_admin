import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ActionSheetController, Alert, AlertController } from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { TSMap } from 'typescript-map';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../../../services/common.service';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import { RequestOptions } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../../services/sharedservice';
import * as $ from 'jquery';
import { dateValueRange } from 'ionic-angular/umd/util/datetime-util';
/**
 * Generated class for the ViewcourtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bookingcourt',
  templateUrl: 'bookingcourt.html',
})   
export class BookingCourt {
  @ViewChild(Content) content: Content;
  loading: any;
  nestUrl: string;
  parentClubKey: any;
  selectedClubKey: any;
  courtSelected: any;
  selectedActivity: any;
  totalPrice: any;
  noOfSlootBook: any;
  selectedSlots = []
  forWhom = 0;
  allslot = []

  bookeedforList=[
    {name:'Self', code:0},
    // {name:'Member', code:1},
    // {name:'Coach', code:2}
  ]

  paymentDEtails = {
    parentClubKey:'',
    clubKey: '',
    courtKey :'',
    activityKey : '',

    description : "booking court",

    discount : "0",
    amount : '',
    paymentDescription: 'booking court',
    bookingParentMemberKey : '',
    purpose:'',
    setupKey : '',
    source : '',
    currency : '',
    paymentMode : '',
    slots : [],
    ExtraProperties: {},
    members: []
  }
  allcourt: any;
  dmmmyyyformatDtae: any;
  purpose=''
  currencyDetails: any;
  Email: any;
  Name: any;
  userKey: any;
  selectedDate: any;
  roleType: any;
  constructor(public sharedService: SharedServices, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService, public storage: Storage, public commonService: CommonService, public http: HttpClient, public loadingCtrl: LoadingController) {
   
    this.nestUrl = sharedService.getnestURL();
    
  }

  ionViewWillEnter(){
    this.parentClubKey = this.navParams.get('parentClubKey');
    this.selectedSlots= this.navParams.get('selectedSlots');
    this.selectedClubKey= this.navParams.get('clubKey');
    this.noOfSlootBook= this.navParams.get('noOfSlootBook');
    this.selectedActivity= this.navParams.get('activityKey');
    this.totalPrice= this.navParams.get('amount');
    this.allcourt= this.navParams.get('allcourt');
    this.courtSelected= this.navParams.get('courtSelected');
    this.dmmmyyyformatDtae = this.navParams.get('date')
    this.Email = this.navParams.get('Email')
    this.Name = this.navParams.get('Name')
    this.userKey = this.navParams.get('userKey')
    this.selectedDate = this.navParams.get('selectedDate')
    this.roleType = this.navParams.get('roleType')
    this.paymentDEtails.parentClubKey = this.parentClubKey
    this.paymentDEtails.clubKey = this.selectedClubKey
    this.paymentDEtails.courtKey = this.courtSelected
    this.paymentDEtails.activityKey = this.selectedActivity
    this.paymentDEtails.amount = this.totalPrice
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  showDetails(){
   //this.commonService.commonAlter('Alert', '')
  }

  bookslotforamin() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      try {
       
        this.paymentDEtails.setupKey = "blank"
        this.paymentDEtails.bookingParentMemberKey = "admin"
        this.paymentDEtails.source = "blank" 
        this.paymentDEtails.currency = "blank"
        this.paymentDEtails.paymentMode = "blank"
        this.paymentDEtails.purpose = this.purpose

        // var m = moment(+this.dmmmyyyformatDtae).utcOffset(0);
        // m.set({hour:12,minute:0,second:0,millisecond:0})
        // let creatTime = m.utc().valueOf()
        let creatTime = new Date(`${this.dmmmyyyformatDtae} 12:00`).getTime()
        for (let i = 0; i < this.selectedSlots.length; i++) {
          let obj = { Price: "", endHour: "", StartHour: "", blockedKey: "", date: "", StartMin: "", endMin: "", courtKey:'' }
          obj = {
            Price: this.selectedSlots[i].Price,
            endHour: this.selectedSlots[i].EndHour,
            StartHour: this.selectedSlots[i].StartHour,
            StartMin: this.selectedSlots[i].StartMin,
            blockedKey: this.selectedSlots[i].BlockedKey,
            date : creatTime.toString(),
            endMin: this.selectedSlots[i].EndMin,
            courtKey: this.selectedSlots[i].courtKey
          }
         
          this.paymentDEtails.slots.push(obj)
        }

        let obj = {
          memberKey: 'admin',
          amount: this.totalPrice
        }
        this.paymentDEtails.ExtraProperties['LoginEmailId'] = this.Email
        this.paymentDEtails.ExtraProperties['Name'] = this.Name
        this.paymentDEtails.ExtraProperties['Memberkey'] = this.userKey
        this.paymentDEtails.ExtraProperties['date'] = this.selectedDate
        this.paymentDEtails.ExtraProperties['MemberType'] = this.roleType
        this.paymentDEtails.members.push(obj)

        this.http.post(`${this.nestUrl}/courtbooking/bookforadmin`,this.paymentDEtails).subscribe((res) => {
          this.loading.dismiss()
          if (res['data']) {
            this.commonService.toastMessage("Successfully booked...", 5000, ToastMessageType.Success)
            this.navCtrl.pop().then(()=>{this.navCtrl.pop()})
          }
        },
          err => {
            this.loading.dismiss();
            this.commonService.toastMessage(err['data'], 5000, ToastMessageType.Success)
          })
      } catch (err) {

        this.loading.dismiss();
      }
    })

  }
  //.....................getting Booking releted information........................
}