
import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { ValidationPath } from '@firebase/database/dist/esm/src/core/util/Path';

@IonicPage()
@Component({
  selector: 'membershippaymentsetup-page',
  templateUrl: 'membershippaymentsetup.html'
})

export class membershipPaymentSetupPage {
  ParentClubKey: any;
  Venues;
  currencyDetails: any;
  selectedClubKey: any;
  ClubNameData: any;



  Stripe = {
    Currency: "",
    PaybuttonIDText: "",
    MerchantID: "",
    SharedSecret: "",

  }

  PaymentMethod = {
    Stripe: false,
    PayTm: false,
    PayPal: false,
    BACS: false,
    Cash: false
  }
  IsAnyPaymentMethodDB = '';
  IsPaymentSelected: boolean = false;
  selectedVenue = [];
  selectedClubDBArr: any;
  selectedStripe: any;
  IsEnable: any = true;
  IsUpdated: boolean = false;

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public modalController: ModalController,
    private fb: FirebaseService,
    public actionSheetCtrl: ActionSheetController,
    private platform: Platform, storage: Storage,
    private toastCtrl: ToastController, public comonService: CommonService
  ) {

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      console.log("ParentClubKey: ", this.ParentClubKey)

      this.getAllVenue(this.ParentClubKey)
      //this.getDetailsfromDB()
      //this.getAllSetups(this.ParentClubKey)

    })
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
      this.Stripe.Currency = this.currencyDetails.CurrencyCode
    })


  }


  getAllVenue(ParentClubKey) {
    this.Venues = [];
    this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {

          this.Venues.push(data[i]);
          // this.selectVenue(data[i].$key)

        }
      }
      this.selectVenue(this.Venues[0])
    });
  }

  
  selectVenue(event) {
    this.selectedClubKey = event.$key;
    this.Venues.forEach(club => {
      if (club.ClubName == event.ClubName) {
        club.IsSelect = !club.IsSelect
      } else {
        club.IsSelect = false
      }

    });

    this.getDetailsfromDB(event.$key)

    // let clickedVenue = this.Venues.filter(club => { return club.IsSelect })
    // // let selectedClubDBArr = this.selectedClubDBArr
    // // 
    // let countselectedClubDB = 0
    // clickedVenue.forEach(club => {
    //   this.selectedClubDBArr.forEach(venue => {
    //     if (club.$key == venue.$key) {
    //       countselectedClubDB++;
    //     }
    //   });
    // });
    // if (countselectedClubDB == this.selectedClubDBArr.length) {
    //   this.Stripe = this.selectedStripe
    //   this.IsAnyPaymentMethodDB = 'Stripe'
    // } else {
    //   this.Stripe = { Currency: this.currencyDetails.CurrencyCode, PaybuttonIDText: "", MerchantID: "", SharedSecret: "" }
    //   this.IsAnyPaymentMethodDB = ''
    // }

    // console.log(this.selectedClubKey)
    // console.log(this.Venues)
    //this.getSetupByVenue(this.selectedClubKey)
   
    
  }

  
  getDetailsfromDB(ClubKey) {
    this.selectedClubDBArr = []
    this.fb.getAllWithQuery("StandardCode/MembershipPaymentSetup/" + this.ParentClubKey + "/", { orderByKey: true, equalTo: ClubKey }).subscribe((data) => {

      if (data.length > 0 ) {
        console.log("data", data)
        this.comonService.convertFbObjectToArray(data[0]).forEach(eachPayOption => {
          //  this.selectPayment(eachPayOption.PaymentGatewayName)

         // let eachPaymentDetails = this.comonService.convertFbObjectToArray1(eachPayOption)[0]
         
          // this.Venues.forEach(club => {
          //   if (club.$key == eachPayOption.Key) {
          //     club.IsSelect = true
          //     this.selectedClubDBArr.push({ $key: eachPayOption.Key, IsSelect: club.IsSelect, Stripe: eachPaymentDetails.Properties })
          //   }
          // });
          if (eachPayOption.Properties) {
            this.selectedStripe = eachPayOption.Properties
            this.IsEnable = eachPayOption.IsEnable
            this.Stripe =  this.selectedStripe
            this.IsAnyPaymentMethodDB = 'Stripe'
            this.IsUpdated = true
          }

        })
      }
      else{
        this.Stripe = { Currency: this.Stripe.Currency, PaybuttonIDText: "", MerchantID: "", SharedSecret: "" }
        this.IsAnyPaymentMethodDB = 'Stripe'
        this.IsUpdated = false
      }
      this.mask()

    })

  }
  selectPayment(event: string) {
    for (let key in this.PaymentMethod) {
      if (key == event) {
        this.PaymentMethod[key] = !this.PaymentMethod[key]
      } else {
        this.PaymentMethod[key] = false
      }
    }
    for (let key in this.PaymentMethod) {
      if (this.PaymentMethod[key] == true) {
        this.IsPaymentSelected = true;
        break;
      } else {
        this.IsPaymentSelected = false;
      }
    }
    //console.log(this.Stripe)
  }


  save() {
    let PaymentGatewayName, data;
    for (let key in this.PaymentMethod) {
      if (this.PaymentMethod[key] == true) {
        PaymentGatewayName = key
      }
    }
    this.selectedVenue = this.Venues.filter(club => {
      return club.IsSelect
    })
    if (this.validation()) {
      data = {
        IsActive: true,
        IsEnable: this.IsEnable,
        PaymentGatewayName: PaymentGatewayName,
      }
      data['Properties'] = {
        Currency: this.Stripe.Currency,
        PaybuttonIDText: this.Stripe.PaybuttonIDText,
        MerchantID: this.Stripe.MerchantID,
        SharedSecret: this.Stripe.SharedSecret,
      }
      this.selectedVenue.forEach(club => {
        let setupkey = this.fb.saveReturningKey("StandardCode/MembershipPaymentSetup/" + this.ParentClubKey + "/" +club.$key, data)
      })

      console.log(data)
    } else {
      console.log("not")
    }
  }
  update(){
    let PaymentGatewayName, data;
    for (let key in this.PaymentMethod) {
      if (this.PaymentMethod[key] == true) {
        PaymentGatewayName = key
      }
    }
    this.selectedVenue = this.Venues.filter(club => {
      return club.IsSelect
    })
    if (this.validation()) {
      data = {
        IsActive: true,
        IsEnable: this.IsEnable,
        PaymentGatewayName: PaymentGatewayName,
      }
      data['Properties'] = {
        Currency: this.Stripe.Currency,
        PaybuttonIDText: this.Stripe.PaybuttonIDText,
        MerchantID: this.Stripe.MerchantID,
        SharedSecret: this.Stripe.SharedSecret,
      }
      this.selectedVenue.forEach(club => {
        //this.fb.update(,"StandardCode/MembershipPaymentSetup/" + this.ParentClubKey + "/" +club.$key, data)
      })


    }
  }

  validation() {
    let Venues = this.Venues
    console.log(Venues.some(club => {return club.IsSelect == true }))
    if (!Venues.some(club => {return club.IsSelect })) {
      return false;
    }
    else if (!this.Stripe.Currency && !this.Stripe.MerchantID && !this.Stripe.SharedSecret) {
      return false;
    }
    else {
      return true;
    }
  }

  allVenue() {
    this.Venues.forEach(club => {
      club.IsSelect = !club.IsSelect
    });
  }

  getPaymentSetup() {
    this.fb.getAll("StandardCode/PaymentGateway/Default").subscribe((data) => { })
  }
  mask() {

    let len = this.Stripe['SharedSecret'].length
    this.Stripe['SharedSecret'] = this.Stripe['SharedSecret'].replace(this.Stripe['SharedSecret'].substring(4, len - 4), '*'.repeat(this.Stripe['SharedSecret'].substring(5, len - 4).length));
    let len2 = this.Stripe['MerchantID'].length
    this.Stripe['MerchantID'] = this.Stripe['MerchantID'].replace(this.Stripe['MerchantID'].substring(4, len2 - 4), '*'.repeat(this.Stripe['MerchantID'].substring(5, len2 - 4).length));
  }
  cancel() {
    this.navCtrl.pop()
  }
  showToast(message) {
    let toast = this.toastCtrl.create({
        message: message,
        duration: 3000
    });
    toast.present();
}
}
