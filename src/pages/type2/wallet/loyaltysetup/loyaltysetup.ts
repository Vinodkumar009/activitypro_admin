import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
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
  selector: 'page-loyaltysetup',
  templateUrl: 'loyaltysetup.html',
})
export class LoyaltySetupPage {
  currencyDetails: any;
  selectedParentClubKey: string;
  clubs: any[];
  selectedClubKey: any;
  ActivityList: any[];
  selectedActivity: string;
  PointConversionFactor= 100; 
  status = 'Reward'

  nextClicked = false;
  walletList = [

    {
      SetupName: 'LoyaltyPoint',
      DisplayName:'Loyalty Point',    
      ImageUrl: "/assets/imgs/loyaltpoints.png"
    },
    // {  SetupName: 'Virtual Point',
    //   DisplayName:'Virtual Point',  ImageUrl: "/assets/imgs/virtualpoint.png" },
    {
      SetupName: 'CashTopupWallet',
      DisplayName:'Cash Topup Wallet',    
      ImageUrl: "/assets/imgs/CashTopup1.png"
    },
  ]
  setupArr = [
    { 
      Type : 'Term Group Session',
      Name:'TermGroupSession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 100
    },
    { 
      Type : 'Monthly Session',
      Name : 'MonthlySession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 101
    },
    { 
      Type : 'Weekly Session',
      Name : 'WeeklySession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 102
    },
    { 
      Type : 'Holiday Camp',
      Name : 'HolidayCamp',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 103
    },
    
    { 
      Type : 'Tournament',
      Name : 'Tournament',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 104
    },
    { 
      Type : 'School Session',
      Name : 'SchoolSession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 105
    },
    { 
      Type : 'Event',
      Name : 'Event',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 106
    },
    
  ]
  membership = { 
   
    IsEnable : true,
    IsActive : true,
    StandardPoint : 10,
    BonusPoint : 20, 
    FixedBonusPoint : 10, 
    BonusStartDate : '',
    BonusEndDate :'',
    Code: 107
  }
  venueActivityLevel={
    IsEnable:true,
    IsActive:true,
    IsBonusEnable:false,
    BonusStartDate:'',
    BonusEndDate:'',
    IsBonusAppliedtoAll:false
  }
  redeem = {
    miniPointsRedeemable:100,
    maxPointsRedeemable:1000,
  }
  DisplayPointsLoyaltyCard = ['Points', 'Currency Equivalent', 'Both']
  LoyaltyPointName= 'APRO'
  RewardNonMember= false
  RewardNonMemberPercent = 100
  RewardPaymentOption = 0;
  AllowRewardCash = false;
  AllowRewardBacs = false;
  AllowRewardCard = false;
  AllowRewardVoucher = false;

  AllowRedeemCash = false;
  AllowRedeemBacs = false;
  AllowRedeemCard = false;
  AllowRedeemVoucher = false;

  ShowMemberDashboard = 0;
  DisplayPointsonLoyaltyCard = 0;
  RedeemPaymentOption = 0
  parentClubKey: any;
  isUpdate: boolean = false;

  mindate = moment().format('YYYY-MM-DD')
  PASSWORD_REGEX = `[1-9][0-9]*`
  constructor(public navCtrl: NavController, 
    public storage: Storage, public loadingCtrl: LoadingController, public commonservices: CommonService, public fb: FirebaseService, public navParams: NavParams) {
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        for (let club of val.UserInfo)
          if (val.$key != "") {
            this.selectedParentClubKey = club.ParentClubKey;
            this.getClubDetails()
          }
      })
      this.storage.get('Currency').then((val) => {
        this.currencyDetails = JSON.parse(val);
        
      }).catch(error => {
        
      });
  }

  role=paymentType
        keys() : Array<string> {

        var keys = Object.keys(this.role);
      
        return keys.slice(keys.length / 2);
    }

    memberDashboard = showonMemberDashboard
    showonMemberDashboardKeys() : Array<string> {

      var keys = Object.keys(this.memberDashboard);
    
      let array = keys.slice(keys.length / 2);
      array[0] = "Don't Show";
      return array
  }
    print(e){
      console.log(e)
    }
  ionViewDidLoad() {   
   
  }

  checknamesize(e){
    if (e.length > 4){
      this.commonservices.toastMessage("Loyalty Points Name should not ne more than 4 character", 3000);
    }
  }

  getloyaltySetup(){
    this.fb.getAllWithQuery("StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {orderByKey: true, equalTo: this.selectedClubKey }).subscribe((loyaltySetup) => {
      if(loyaltySetup[0].IsActive == undefined)
        loyaltySetup[0].IsActive = true  
      if(loyaltySetup.length > 0 && loyaltySetup[0]['IsEnable'] && loyaltySetup[0]['IsActive']){
          this.venueActivityLevel.IsEnable = loyaltySetup[0]['IsEnable']
          this.venueActivityLevel.IsBonusEnable = loyaltySetup[0]['IsBonusEnable']
          this.LoyaltyPointName = loyaltySetup[0]['LoyaltyPointName']
          this.DisplayPointsonLoyaltyCard = loyaltySetup[0]['DisplayPointsonLoyaltyCard']
          this.ShowMemberDashboard = loyaltySetup[0]['ShowMemberDashboard']
          this.PointConversionFactor = loyaltySetup[0]['PointConversionFactor']
          this.venueActivityLevel.IsActive = loyaltySetup[0]['IsActive']
          this.membership = loyaltySetup[0]['Reward']['Membership']
          if (this.membership['TypeCode'] == undefined) {
           
            this.membership['TypeCode'] = 107
          }
          this.membership.Code = 107
          this.RewardNonMember = loyaltySetup[0]['Reward']['RewardNonMember']
          //this.RewardPaymentOption = loyaltySetup[0]['Reward']['RewardPaymentOption']

          this.AllowRewardCash =loyaltySetup[0]['Reward'].AllowRewardCash,
          this.AllowRewardBacs =loyaltySetup[0]['Reward'].AllowRewardBacs,
          this.AllowRewardCard =loyaltySetup[0]['Reward'].AllowRewardCard,
          this.AllowRewardVoucher =loyaltySetup[0]['Reward'].AllowRewardVoucher
          
          this.RewardNonMemberPercent = loyaltySetup[0]['Reward']['RewardNonMemberPercent']
          let Setup = loyaltySetup[0]['Reward'][this.selectedActivity]
          // this.venueActivityLevel.IsEnable = Setup.IsEnable
          // this.venueActivityLevel.IsBonusEnable = Setup.IsBonusEnable
          this.redeem.maxPointsRedeemable = loyaltySetup[0]['Redeem']['maxPointsRedeemable']
          this.redeem.miniPointsRedeemable = loyaltySetup[0]['Redeem']['miniPointsRedeemable']
          this.RedeemPaymentOption = loyaltySetup[0]['Redeem']['RedeemPaymentOption']

          this.AllowRedeemCash = loyaltySetup[0]['Redeem'].AllowRedeemCash,
          this.AllowRedeemBacs = loyaltySetup[0]['Redeem'].AllowRedeemBacs,
          this.AllowRedeemCard = loyaltySetup[0]['Redeem'].AllowRedeemCard,
          this.AllowRedeemVoucher = loyaltySetup[0]['Redeem'].AllowRedeemVoucher

          this.isUpdate = true
          this.setupArr.forEach(eachSetup =>{
              if(eachSetup.Name == 'SchoolSession'){
                eachSetup.IsEnable = Setup.SchoolSession.IsEnable
                eachSetup.IsActive= Setup.SchoolSession.IsActive
                eachSetup.StandardPoint = Setup.SchoolSession.StandardPoint
                eachSetup.BonusPoint = Setup.SchoolSession.BonusPoint
                eachSetup.FixedBonusPoint= Setup.SchoolSession.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.SchoolSession.BonusStartDate
                eachSetup.BonusEndDate= Setup.SchoolSession.BonusEndDate
              }
              if(eachSetup.Name == 'Tournament'){
                eachSetup.IsEnable = Setup.Tournament.IsEnable
                eachSetup.IsActive= Setup.Tournament.IsActive
                eachSetup.StandardPoint = Setup.Tournament.StandardPoint
                eachSetup.BonusPoint = Setup.Tournament.BonusPoint
                eachSetup.FixedBonusPoint= Setup.Tournament.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.Tournament.BonusStartDate
                eachSetup.BonusEndDate= Setup.Tournament.BonusEndDate
              }
              if(eachSetup.Name == 'Event'){
                eachSetup.IsEnable = Setup.Event.IsEnable
                eachSetup.IsActive= Setup.Event.IsActive
                eachSetup.StandardPoint = Setup.Event.StandardPoint
                eachSetup.BonusPoint = Setup.Event.BonusPoint
                eachSetup.FixedBonusPoint= Setup.Event.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.Event.BonusStartDate
                eachSetup.BonusEndDate= Setup.Event.BonusEndDate
              }
              if(eachSetup.Name == 'WeeklySession'){
                eachSetup.IsEnable = Setup.WeeklySession.IsEnable
                eachSetup.IsActive= Setup.WeeklySession.IsActive
                eachSetup.StandardPoint = Setup.WeeklySession.StandardPoint
                eachSetup.BonusPoint = Setup.WeeklySession.BonusPoint
                eachSetup.FixedBonusPoint= Setup.WeeklySession.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.WeeklySession.BonusStartDate
                eachSetup.BonusEndDate= Setup.WeeklySession.BonusEndDate
              }
              if(eachSetup.Name == 'HolidayCamp'){
                eachSetup.IsEnable = Setup.HolidayCamp.IsEnable
                eachSetup.IsActive= Setup.HolidayCamp.IsActive
                eachSetup.StandardPoint = Setup.HolidayCamp.StandardPoint
                eachSetup.BonusPoint = Setup.HolidayCamp.BonusPoint
                eachSetup.FixedBonusPoint= Setup.HolidayCamp.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.HolidayCamp.BonusStartDate
                eachSetup.BonusEndDate= Setup.HolidayCamp.BonusEndDate
              }
              if(eachSetup.Name == 'TermGroupSession'){
                eachSetup.IsEnable = Setup.TermGroupSession.IsEnable
                eachSetup.IsActive= Setup.TermGroupSession.IsActive
                eachSetup.StandardPoint = Setup.TermGroupSession.StandardPoint
                eachSetup.BonusPoint = Setup.TermGroupSession.BonusPoint
                eachSetup.FixedBonusPoint= Setup.TermGroupSession.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.TermGroupSession.BonusStartDate
                eachSetup.BonusEndDate= Setup.TermGroupSession.BonusEndDate
              }
              if(eachSetup.Name == 'MonthlySession'){
                eachSetup.IsEnable = Setup.MonthlySession.IsEnable
                eachSetup.IsActive= Setup.MonthlySession.IsActive
                eachSetup.StandardPoint = Setup.MonthlySession.StandardPoint
                eachSetup.BonusPoint = Setup.MonthlySession.BonusPoint
                eachSetup.FixedBonusPoint= Setup.MonthlySession.FixedBonusPoint
                eachSetup.BonusStartDate = Setup.MonthlySession.BonusStartDate
                eachSetup.BonusEndDate= Setup.MonthlySession.BonusEndDate
              }
          })
        }else
        {
          this.initialiseEveryField()
        }
    })
  }

  initialiseEveryField(){
    this.PointConversionFactor= 100; 
    this.LoyaltyPointName= 'APRO'
  this.RewardNonMember= false
  this.RewardNonMemberPercent = 100
  this.RewardPaymentOption = 0;
  this.ShowMemberDashboard = 0;
  this.DisplayPointsonLoyaltyCard = 0;
  this.RedeemPaymentOption = 0

    this.setupArr = [
    { 
      Type : 'Term Group Session',
      Name:'TermGroupSession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 100
    },
    { 
      Type : 'Monthly Session',
      Name : 'MonthlySession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 101
    },
    { 
      Type : 'Weekly Session',
      Name : 'WeeklySession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 102
    },
    { 
      Type : 'Holiday Camp',
      Name : 'HolidayCamp',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 103
    },
    
    { 
      Type : 'Tournament',
      Name : 'Tournament',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 104
    },
    { 
      Type : 'School Session',
      Name : 'SchoolSession',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 105
    },
    { 
      Type : 'Event',
      Name : 'Event',
      IsEnable : true,
      IsActive : true,
      StandardPoint : 10,
      BonusPoint : 20, 
      FixedBonusPoint : 10, 
      BonusStartDate : '',
      BonusEndDate :'',
      Code: 106
    },
    
  ]
  this.membership = { 
   
    IsEnable : true,
    IsActive : true,
    StandardPoint : 10,
    BonusPoint : 20, 
    FixedBonusPoint : 10, 
    BonusStartDate : '',
    BonusEndDate :'',
    Code: 107
  }
  this.venueActivityLevel={
    IsActive:true,
    IsEnable:true,
    IsBonusEnable:false,
    BonusStartDate:'',
    BonusEndDate:'',
    IsBonusAppliedtoAll:false
  }
  this.redeem = {
    miniPointsRedeemable:0,
    maxPointsRedeemable:0,
  }
  }
  getClubDetails() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (data.length != 0) {
        this.selectedClubKey = this.clubs[0].$key;
        this.getAllActivity();
        try {


          // this.getClubMmebers(this.selectedClubKey);
        }
        catch (ex) {

        } finally {
          //this.loading.dismiss().catch(() => { });
        }
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
        this.getloyaltySetup()
      }
     
    });
  } 

  calBonusDate(){
    if(this.venueActivityLevel.IsBonusEnable){
      this.calculateStart(moment().format("YYYY-MM-DD"))
    }
  }

  calculateStart(date) {
    this.venueActivityLevel.BonusEndDate = moment(date).add(1, 'month').format("YYYY-MM-DD")
    this.setupArr.forEach(setup =>{
      setup.BonusStartDate = moment(date).format("YYYY-MM-DD")
    })
    this.membership.BonusStartDate = moment(date).format("YYYY-MM-DD")
  }

  calculateEnd(date){
    this.setupArr.forEach(setup =>{
      setup.BonusEndDate = moment(date).format("YYYY-MM-DD")
    })
    this.membership.BonusEndDate = moment(date).format("YYYY-MM-DD")
  }

  calEndDate(date){
    this.venueActivityLevel.BonusEndDate = moment(date).add(1, 'month').format("YYYY-MM-DD")
  }
  saveSetup(){
    try{
      if(this.PointConversionFactor){
      
        if(this.venueActivityLevel.IsEnable){

          
          //this.fb.update(this.selectedClubKey,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {PointConversionFactor:this.PointConversionFactor});
          // this.fb.update(this.selectedActivity,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey +'/'+ this.selectedClubKey, {
          //   IsEnable:this.venueActivityLevel.IsEnable,
          //   IsBonusEnable:this.venueActivityLevel.IsBonusEnable
          // });
          this.fb.update(this.selectedClubKey,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
            IsActive:this.venueActivityLevel.IsActive,
            IsEnable:this.venueActivityLevel.IsEnable,
            IsBonusEnable:this.venueActivityLevel.IsBonusEnable,
            PointConversionFactor:this.PointConversionFactor,
            LoyaltyPointName: this.LoyaltyPointName,
            ShowMemberDashboard:this.ShowMemberDashboard,
            DisplayPointsonLoyaltyCard:this.DisplayPointsonLoyaltyCard
          });
       
          this.setupArr.forEach(eachSetup => {
            if(eachSetup.IsEnable){
            
              // this.fb.update(this.selectedActivity + '/' + eachSetup.Name,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey +'/'+ this.selectedClubKey , {
              //   IsEnable : eachSetup.IsEnable,
              //   IsActive : eachSetup.IsActive,
              //   StandardPoint : eachSetup.StandardPoint,
              //   BonusPoint : eachSetup.BonusPoint, 
              //   FixedBonusPoint : eachSetup.FixedBonusPoint, 
              //   BonusStartDate : eachSetup.BonusStartDate,
              //   BonusEndDate : eachSetup.BonusEndDate
              // });
              this.fb.update(this.selectedActivity + '/' + eachSetup.Name,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey +'/'+ this.selectedClubKey +"/Reward", {
                IsEnable : eachSetup.IsEnable,
                IsActive : eachSetup.IsActive,
                StandardPoint : eachSetup.StandardPoint,
                BonusPoint : eachSetup.BonusPoint, 
                FixedBonusPoint : eachSetup.FixedBonusPoint, 
                BonusStartDate : eachSetup.BonusStartDate,
                BonusEndDate : eachSetup.BonusEndDate,
                TypeCode: eachSetup.Code
              });
            }
          })

          // this.fb.update(this.selectedClubKey + '/Membership',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
          //   IsEnable : this.membership.IsEnable,
          //   IsActive : this.membership.IsActive,
          //   StandardPoint : this.membership.StandardPoint,
          //   BonusPoint : this.membership.BonusPoint, 
          //   FixedBonusPoint :  this.membership.FixedBonusPoint, 
          //   BonusStartDate :  this.membership.BonusStartDate,
          //   BonusEndDate :  this.membership.BonusEndDate
          // });
          this.fb.update(this.selectedClubKey + '/Reward/Membership',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
            IsEnable : this.membership.IsEnable,
            IsActive : this.membership.IsActive,
            StandardPoint : this.membership.StandardPoint,
            BonusPoint : this.membership.BonusPoint, 
            FixedBonusPoint :  this.membership.FixedBonusPoint, 
            BonusStartDate :  this.membership.BonusStartDate,
            BonusEndDate :  this.membership.BonusEndDate,
            TypeCode: this.membership.Code
          });

          this.fb.update(this.selectedClubKey + '/Redeem',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
            miniPointsRedeemable:this.redeem.miniPointsRedeemable,
            maxPointsRedeemable:this.redeem.maxPointsRedeemable,

            AllowRedeemCash : this.AllowRedeemCash,
            AllowRedeemBacs : this.AllowRedeemBacs,
            AllowRedeemCard : this.AllowRedeemCard,
            AllowRedeemVoucher : this.AllowRedeemVoucher

          });
          this.fb.update(this.selectedClubKey + '/Reward',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
            RewardNonMember:this.RewardNonMember,
            RewardNonMemberPercent:this.RewardNonMemberPercent,
            AllowRewardCash :this.AllowRewardCash,
            AllowRewardBacs :this.AllowRewardBacs,
            AllowRewardCard :this.AllowRewardCard,
            AllowRewardVoucher :this.AllowRewardVoucher
          });

          this.commonservices.toastMessage('Successfully saved', 3000, ToastMessageType.Success)
          this.nextClicked = false;
        }else{
          this.commonservices.toastMessage('You have disabled loyalty', 3000, ToastMessageType.Error)
        }
      }else{
        this.commonservices.toastMessage('Please enter point equivalent to '+this.currencyDetails.CurrencySymbol, 3000, ToastMessageType.Error)
      }
    }catch(err){
      this.commonservices.toastMessage('You have missed some fields', 3000, ToastMessageType.Error)
    }
     
     
  }

  validate(){

  }

  updateSetup(){
    
    try{
      if(this.PointConversionFactor){
        // this.fb.update(this.selectedClubKey,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {PointConversionFactor:this.PointConversionFactor});
        // this.fb.update(this.selectedActivity,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey +'/'+ this.selectedClubKey, {
        //   IsEnable:this.venueActivityLevel.IsEnable,
        //   IsBonusEnable:this.venueActivityLevel.IsBonusEnable
        // });

        this.fb.update(this.selectedClubKey,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
          IsActive:true,
          IsEnable:this.venueActivityLevel.IsEnable,
          IsBonusEnable:this.venueActivityLevel.IsBonusEnable,
          PointConversionFactor:this.PointConversionFactor,
          LoyaltyPointName: this.LoyaltyPointName,
          ShowMemberDashboard:this.ShowMemberDashboard,
          DisplayPointsonLoyaltyCard:this.DisplayPointsonLoyaltyCard
        });
     
        this.setupArr.forEach(eachSetup => {
  
            // this.fb.update(this.selectedActivity + '/' + eachSetup.Name,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey +'/'+ this.selectedClubKey, {
            //   IsEnable : eachSetup.IsEnable,
            //   IsActive : eachSetup.IsActive,
            //   StandardPoint : eachSetup.StandardPoint,
            //   BonusPoint : eachSetup.BonusPoint, 
            //   FixedBonusPoint : eachSetup.FixedBonusPoint, 
            //   BonusStartDate : eachSetup.BonusStartDate,
            //   BonusEndDate : eachSetup.BonusEndDate
            // });
            this.fb.update(this.selectedActivity + '/' + eachSetup.Name,"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey +'/'+ this.selectedClubKey +"/Reward", {
              IsEnable : eachSetup.IsEnable,
              IsActive : eachSetup.IsActive,
              StandardPoint : eachSetup.StandardPoint,
              BonusPoint : eachSetup.BonusPoint, 
              FixedBonusPoint : eachSetup.FixedBonusPoint, 
              BonusStartDate : eachSetup.BonusStartDate,
              BonusEndDate : eachSetup.BonusEndDate,
              TypeCode: eachSetup.Code
            });
          
        })

        // this.fb.update(this.selectedClubKey + '/Membership',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
        //   IsEnable : this.membership.IsEnable,
        //   IsActive : this.membership.IsActive,
        //   StandardPoint : this.membership.StandardPoint,
        //   BonusPoint : this.membership.BonusPoint, 
        //   FixedBonusPoint :  this.membership.FixedBonusPoint, 
        //   BonusStartDate :  this.membership.BonusStartDate,
        //   BonusEndDate :  this.membership.BonusEndDate
        // });

        this.fb.update(this.selectedClubKey + '/Reward/Membership',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
          IsEnable : this.membership.IsEnable,
          IsActive : this.membership.IsActive,
          StandardPoint : this.membership.StandardPoint,
          BonusPoint : this.membership.BonusPoint, 
          FixedBonusPoint :  this.membership.FixedBonusPoint, 
          BonusStartDate :  this.membership.BonusStartDate,
          BonusEndDate :  this.membership.BonusEndDate,
          TypeCode: this.membership.Code
        });

        this.fb.update(this.selectedClubKey + '/Redeem',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
          miniPointsRedeemable:this.redeem.miniPointsRedeemable,
          maxPointsRedeemable:this.redeem.maxPointsRedeemable,
          AllowRedeemCash : this.AllowRewardCash,
          AllowRedeemBacs : this.AllowRedeemBacs,
          AllowRedeemCard : this.AllowRedeemCard,
          AllowRedeemVoucher : this.AllowRedeemVoucher
        });
        this.fb.update(this.selectedClubKey + '/Reward',"StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, {
          RewardNonMember:this.RewardNonMember,
          RewardNonMemberPercent:this.RewardNonMemberPercent,
          AllowRewardCash :this.AllowRewardCash,
          AllowRewardBacs :this.AllowRewardBacs,
          AllowRewardCard :this.AllowRewardCard,
          AllowRewardVoucher :this.AllowRewardVoucher
        
        });
        this.commonservices.toastMessage('Successfully updated', 3000, ToastMessageType.Success)
        this.nextClicked = false;
     
    }else{
      this.commonservices.toastMessage('Please enter point equivalent to '+this.currencyDetails.CurrencySymbol, 3000, ToastMessageType.Error)
    }
    }catch(err){
      this.commonservices.toastMessage('You have missed some fields', 3000, ToastMessageType.Error)
    }
   
   
  }

  gotoPage(item){
    if(item.SetupName == 'LoyaltyPoint'){
      this.nextClicked = true;
    }else{
      this.navCtrl.push('CashWallet')
    }
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

