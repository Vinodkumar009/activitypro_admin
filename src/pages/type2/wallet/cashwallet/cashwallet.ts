import { forEach } from '@firebase/util';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController, ToastController } from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cashwallet',
  templateUrl: 'cashwallet.html',
})
export class CashWallet {
  selectedParentClubKey: any;
  currencyDetails: any;
  cashWallet = {
    IsEnable: true,
    IsActive: true,
    CreateDate: 0,
    UpdateDate: 0,
    MinTopupAmount:50,
    MaxTopupAmount:300,
    ParentClubEmailID:'',
    TermsNConditions: false,
  }
  disable = true;
  PaymentSetup = {
    CreatedDate:0,
    IsActive:true,
    IsEnable:true,
    IsExistPaymentSubCategory:false,
    Name: 'Cash Topup',
    PaymentGatewayName: 'CashTopup',
    SetupType: 'All',
    Properties: {}
  }

  Properties = {
    Currency: '',
    HPPLANG: '',
    HPPURL: "",
    MerchantID: "",
    PaybuttonIDText: "",
    ResponseURL: "",
    SharedSecret: "",
    UserId: ""
  }

  setupArr = [ 
    { 
      Type : 'Term Group Session',
      Name:'TermGroupSession',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 100
    },
    { 
      Type : 'Monthly Session',
      Name : 'MonthlySession',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 101
    },
    { 
      Type : 'Weekly Session',
      Name : 'WeeklySession',
      IsEnable : true,
      IsActive : true,
      CreateDate:0,
      Code: 102
    },
    { 
      Type : 'Holiday Camp',
      Name : 'HolidayCamp',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 103
    },
    
    { 
      Type : 'Tournament',
      Name : 'Tournament',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 104
    },
    { 
      Type : 'School Session',
      Name : 'SchoolSession',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 105
    },
    { 
      Type : 'Event',
      Name : 'Event',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 106
    },
    {
      Type : 'Facility Booking',
      Name : 'FacilityBooking',
      IsEnable : true,
      IsActive : true,
      CreateDate:0,
      Code: 108
    },
    {
      Type : 'Membership',
      Name : 'Membership',
      IsEnable : false,
      IsActive : false,
      CreateDate:0,
      Code: 107
    },
  ]

  Package = [{

    DisplayName:"50 Top-up",
    IsEnable:true,
    IsActive:true,
    Amount:'50.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'50.00',
    CreatedDate:0,
    UpdateDate:0
  },
  {
    DisplayName:"75 Top-up",
    IsEnable:false,
    IsActive:true,
    Amount:'75.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'75.00',
    CreatedDate:0,
    UpdateDate:0
  },
  {
    DisplayName:"100 Top-up",
    IsEnable:false,
    IsActive:true,
    Amount:'100.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'100.00',
    CreatedDate:0,
    UpdateDate:0
  },
  {
    DisplayName:"150 Top-up",
    IsEnable:false,
    IsActive:true,
    Amount:'150.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'150.00',
    CreatedDate:0,
    UpdateDate:0
  },
  {
    DisplayName:"200 Top-up",
    IsEnable:false,
    IsActive:true,
    Amount:'200.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'200.00',
    CreatedDate:0,
    UpdateDate:0
  },
  {
    DisplayName:"250 Top-up",
    IsEnable:false,
    IsActive:true,
    Amount:'250.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'250.00',
    CreatedDate:0,
    UpdateDate:0
  },
  {
    DisplayName:"300 Top-up",
    IsEnable:true,
    IsActive:true,
    Amount:'300.00',
    BonusPercent:0,
    ExtraFees:0,
    Description:"",
    TotalAmount:'300.00',
    CreatedDate:0,
    UpdateDate:0
  },]
  clubs=[];
  isUpdate = false;
  stripeConnectArray = []
  stripeSetup
  applicationfeesPresent = false;
  cashTopupPaymentPresent = false
  terms;
  constructor(public navCtrl: NavController, 
    public storage: Storage, public loadingCtrl: LoadingController,private toastCtrl: ToastController, public commonservices: CommonService, public fb: FirebaseService, public navParams: NavParams) {
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        for (let club of val.UserInfo)
          if (val.$key != "") {
            this.selectedParentClubKey = club.ParentClubKey;
            this.getWalletTermsNCondition()
            this.getParentClubEmail()
           
          }
      })
      this.storage.get('Currency').then((val) => {
        this.currencyDetails = JSON.parse(val);
        
      }).catch(error => {
        
      });
  }

  getParentClubEmail(){
    let y = this.fb.getAllWithQuery(`ParentClub/Type2/`, {orderByKey:true, equalTo:this.selectedParentClubKey}).subscribe(data =>{
      if(data.length > 0){
        this.cashWallet.ParentClubEmailID = data[0].ParentClubAdminEmailID
        
      }
      this.getCashWallet() 
      y.unsubscribe()
    })
    
  }

  getCashWallet(){
    let x = this.fb.getAllWithQuery(`/StandardCode/Wallet/CashWallet/`, { orderByKey: true,equalTo: this.selectedParentClubKey }).subscribe(data => {
      if(data.length > 0){ 
        this.isUpdate = true
        this.cashWallet = JSON.parse(JSON.stringify(data[0]))
        delete this.cashWallet['Module']
        delete this.cashWallet['Packages']
        this.setupArr = this.commonservices.convertFbObjectToArray(data[0].Module)
        this.Package = this.commonservices.convertFbObjectToArray(data[0].Packages)
        this.Package.forEach(pack => {
          pack.Amount = this.parseTwoDeci(pack.Amount)
        })
        this.stripeSetup = this.commonservices.convertFbObjectToArray(data[0].StripeConnect).filter(stripe => stripe.IsEnable)
      }
      this.fb.getAll(`APSetup/ApplicationFees/${this.selectedParentClubKey}`).subscribe(data =>{
        if(data.length > 0){
          this.applicationfeesPresent = true;
        }
      })
      this.getClubDetails() 
      x.unsubscribe()
    })
  }

  getWalletTermsNCondition(){
    this.fb.getAllWithQuery('ActivityPro/',{orderByKey:true, equalTo:"Wallet"}).subscribe(data => {
      if (data.length > 0){
        this.terms = data[0]
        this.terms.CashTopUpTerms = this.terms.CashTopUpTerms +" "+this.terms.CashTopupPercentage+"% + "+this.terms.CashTopupFixed
        console.log(data)
      }
    })
  }

  parseTwoDeci(amount) {
    return parseFloat(amount).toFixed(2)
  }

  getClubDetails() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    
      if (data.length != 0) {
        data.forEach(eachClub => {
          let length = this.clubs.push({
            $key: eachClub.$key,
            ClubName: eachClub.ClubName,
            IsSelect: false,
          })
          this.getAllActivity(eachClub.$key, length);
        })
        
      }
    });
  }

  getAllActivity(selectedClubKey, index) {
    this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + selectedClubKey + "/").subscribe((data) => {
      if (data.length > 0) {
        this.clubs[index-1]['Activity'] = []
        data.forEach(eachdata => {
          let payment = this.commonservices.convertFbObjectToArray(eachdata.PaymentSetup).filter(data => data.IsActive && data.PaymentGatewayName != undefined && data.PaymentGatewayName == 'CashTopup')
          let stripePayment = this.commonservices.convertFbObjectToArray(eachdata.PaymentSetup).filter(data => data.IsEnable && data.IsActive && data.PaymentGatewayName != undefined && data.PaymentGatewayName == 'StripeConnect')
          stripePayment.forEach(stripe => {
            stripe['IsSelect'] = false
            stripe['ActivityKey'] = eachdata.$key
            stripe['ActivityName'] = eachdata.ActivityName
            stripe['ClubKey'] = this.clubs[index-1].$key
            stripe['ClubName'] = this.clubs[index-1].ClubName  
          })
          if (payment.length > 0){
            this.cashTopupPaymentPresent = true
          }
          if (this.stripeSetup != undefined && this.stripeSetup.length > 0){
            stripePayment.forEach(stripe => {
              this.stripeSetup.forEach(stripeDB => {
                if (stripe.Key === stripeDB['StripeKey']){
                  stripe.IsSelect = true
                  stripe['presentDB'] = true
                }
              })
            })
          }
          this.stripeConnectArray.push(...stripePayment)
          let payemntIsEnable = false
          if (payment.length > 0){
            payemntIsEnable = payment[0].IsEnable
          }
          let obj = {
            $key: eachdata.$key,
            ActivityName: eachdata.ActivityName,
            IsSelect: payemntIsEnable,
            PaymentSetup: payment[0],
          }
          this.clubs[index-1]['Activity'].push(obj);

        })
        
      }
    });
  } 

  calculateBonus(pack){
    pack.TotalAmount = +pack.Amount + +pack.Amount * (+pack.BonusPercent)/100
  }

  showInfo() {
    let message = "Select your stripe account";
    this.showToast(message, 5000);
  }
  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }
  checkAmount(pack){
    if (pack.Amount < this.cashWallet.MinTopupAmount){
      this.commonservices.toastMessage(`Amount can not be less than Minimum Topup Cash`, 3000);
    }
  }
  selectStripe(stripe){
    this.stripeConnectArray.forEach(str => {
      str.IsSelect = false
    })
    stripe.IsSelect = true
    
  }

  async saveSetup(){
    let selectedStripe = this.stripeConnectArray.filter(stripe => stripe.IsSelect)
    if (this.validate(selectedStripe) && this.cashWallet.TermsNConditions){
      this.cashWallet.CreateDate = new Date().getTime()
      this.cashWallet.UpdateDate = this.cashWallet.CreateDate
      this.fb.update(this.selectedParentClubKey,`StandardCode/Wallet/CashWallet/`, this.cashWallet)
      this.setupArr.forEach(setup => {
        setup.CreateDate = new Date().getTime()
        this.fb.saveReturningKey(`StandardCode/Wallet/CashWallet/${this.selectedParentClubKey}/Module/`, setup)
      })
      this.Package.forEach(pack => {
        pack.CreatedDate =  new Date().getTime()
        pack.UpdateDate = pack.CreatedDate
        pack.TotalAmount = String(+pack.Amount + +  +pack.Amount * (+pack.BonusPercent)/100)
        this.fb.saveReturningKey(`StandardCode/Wallet/CashWallet/${this.selectedParentClubKey}/Packages/`, pack)
      })
    
          
          for(let i=0; i<selectedStripe.length; i++){
            if(selectedStripe[i].IsSelect){
              let obj = {
                IsEnable : true,
                ActivityKey : selectedStripe[i].ActivityKey,
                ClubKey : selectedStripe[i].ClubKey,
                StripeKey: selectedStripe[i].Key,
                CreatedDate: new Date().getTime(),
                Properties: selectedStripe[i].Properties
              }
              this.fb.saveReturningKey(`StandardCode/Wallet/CashWallet/${this.selectedParentClubKey}/StripeConnect`, obj)
          }

        }
      if (this.cashWallet.TermsNConditions && !this.cashTopupPaymentPresent){
        this.fb.update('ApplicationFees', `APSetup/${this.selectedParentClubKey}`, {CashTopupPercentage:this.terms.CashTopupPercentage, CashTopupFixed:this.terms.CashTopupFixed})
        for await (const eachClub of this.clubs) {
          for await (const activity of eachClub.Activity) {
            if (activity.ActivityName != undefined){
              this.PaymentSetup.CreatedDate = new Date().getTime()
              this.Properties.Currency = this.currencyDetails.CurrencyCode
              this.PaymentSetup.Properties = this.Properties
              this.fb.saveReturningKey(`Activity/${this.selectedParentClubKey}/${eachClub.$key}/${activity.$key}/PaymentSetup`, this.PaymentSetup)
            }
          }
        }
      }
      this.commonservices.toastMessage('Saved Successfully', 2000, ToastMessageType.Info)
      this.navCtrl.pop()
    }else{
      if(!this.cashWallet.TermsNConditions)
      this.commonservices.toastMessage('Terms and Conditions must be checked.', 3000, ToastMessageType.Error)
    }
  }



  changePaymentStatus(club, act){
    if(this.isUpdate){
      
        this.fb.update(act.PaymentSetup.Key, `Activity/${this.selectedParentClubKey}/${club}/${act.$key}/PaymentSetup`, {IsEnable:act.IsSelect})
        this.commonservices.toastMessage('Update Successful', 1000, ToastMessageType.Success)
      
    }
  }

  validate(selectedStripe){
    if(!this.cashWallet.IsEnable){
      this.commonservices.toastMessage('Enable Cash', 3000, ToastMessageType.Error)
      return false
    }
    else if(selectedStripe.length <= 0){
      this.commonservices.toastMessage('Select Stripe Account', 3000, ToastMessageType.Error)
      return false
    }else{
      for(let i=0; i<this.Package.length; i++){
        if (!this.Package[i].DisplayName)
        {
          this.commonservices.toastMessage('Name can not be blank', 3000, ToastMessageType.Error)
          return false
        }
        else if (!this.Package[i].Amount)
        {
          this.commonservices.toastMessage('Amount can not be blank', 3000, ToastMessageType.Error)
          return false
        }else if(!this.Package[i].BonusPercent == undefined){
          this.commonservices.toastMessage('Bonus can not be blank', 3000, ToastMessageType.Error)
          return false
        }
      }
        
    }
    return true;
  }

  updateSetup(){
    let selectedStripe = this.stripeConnectArray.filter(stripe => stripe.IsSelect)
    if (selectedStripe.length > 0 && this.validateV2()){
      this.cashWallet.UpdateDate = new Date().getTime()
      delete this.cashWallet['$key']
      this.fb.update(this.selectedParentClubKey,`StandardCode/Wallet/CashWallet/`, this.cashWallet)
      this.setupArr.forEach(setup => {
        let key = setup['Key']
        delete setup['Key']
        this.fb.update(key,`StandardCode/Wallet/CashWallet/${this.selectedParentClubKey}/Module/`, setup)
      })

      this.Package.forEach(pack => {
        pack.UpdateDate = new Date().getTime()
        let pack_key = pack['Key']
        delete pack['Key']
        pack['TotalAmount'] = String(+pack.Amount + +  +pack.Amount * (+pack.BonusPercent)/100)
        this.fb.update(pack_key,`StandardCode/Wallet/CashWallet/${this.selectedParentClubKey}/Packages/`, pack)
      })
      
      for(let i=0; i<selectedStripe.length; i++){
        if(selectedStripe[i].IsSelect){
          let obj = {
            IsEnable : true,
            ActivityKey : selectedStripe[i].ActivityKey,
            ClubKey : selectedStripe[i].ClubKey,
            StripeKey: selectedStripe[i].Key,
            CreatedDate: new Date().getTime(),
            Properties: selectedStripe[i].Properties
          }
          this.fb.update(this.stripeSetup[0].Key,`StandardCode/Wallet/CashWallet/${this.selectedParentClubKey}/StripeConnect`, obj)
          
      }
    }
      
      if(!this.applicationfeesPresent && this.cashWallet.TermsNConditions){
        this.fb.update('ApplicationFees', `APSetup/${this.selectedParentClubKey}`, {CashTopupPercentage:this.terms.CashTopupPercentage, CashTopupFixed:this.terms.CashTopupFixed})
      }
      this.commonservices.toastMessage('Update Successful', 1000, ToastMessageType.Success)
      this.navCtrl.pop()
    }
  }

  validateV2(){
      for(let i=0; i<this.Package.length; i++){
        if (!this.Package[i].DisplayName)
        {
          this.commonservices.toastMessage('Name can not be blank', 3000, ToastMessageType.Error)
          return false
        }
        else if (!this.Package[i].Amount)
        {
          this.commonservices.toastMessage('Amount can not be blank', 3000, ToastMessageType.Error)
          return false
        }else if(this.Package[i].BonusPercent == undefined){
          this.commonservices.toastMessage('Bonus can not be blank', 3000, ToastMessageType.Error)
          return false
        }
      }
    return true
  }
  
}

export enum paymentType{
  Cash,
  Bacs,
  Card,
  Voucher
}

export enum showonMemberDashboard{
  Do,
  Top, 
  Bottom,
}

