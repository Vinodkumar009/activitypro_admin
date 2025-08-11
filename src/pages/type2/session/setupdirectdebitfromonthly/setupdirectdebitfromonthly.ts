import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController ,LoadingController} from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import * as moment from 'moment';
import { retry } from 'rxjs/operators/retry';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import * as $ from 'jquery';
import { DirectDebitController } from '../../../../controller/directdebit.controller';

@IonicPage()
@Component({
  selector: 'page-setupdirectdebitfromonthly',
  templateUrl: 'setupdirectdebitfromonthly.html',
})
export class SetupdirectdebitfromonthlyPage {
  sessionInfo:any = {};
  memberInfo:any = {};
  monthlyList:Array<any> = [];
  paymentMap:Map<any,any> = new Map();
  currencyDetails:any = {};
  parentClubInfo:any = {};
  

  parentClubNotificationSetup:any ={};
  /////////   paymentObject variables
  monthlyPayAmount:any = "";
  isTakePreviousAmount:boolean = true;
  selectedMonth:any = {};
  selectStartCard:any = "";
  dueAmount:any = 0;
  selectedStartDates:any = 2;
  oneOffpaymentArray:Array<any> = [];
  recurringPaymentArray:Array<any> = [];
  
  recurringDiscount:number = 0;
  tempStorage:any = "";

  subscriptionMonths:string = "";
  mandatesList:Array<any> = [];
  selectedMandate:any = {};
  isOneOffPayment:boolean = false;
  sendTo = {
    Admin: {
      Key: "",
      Tokens: [],
      Messages: []
    },
    Coaches: []
  };
  discount:any = "";
  selectedMonthForOneOffPayment:any = "";
  loading:any = {};
  appliedDiscountOnOffpayment:number = 0;
  //reflectedPaymentobjectvariables

  paymentGatwayKey:any = "";
  paymenttransactionKey:any = "";
  directDebitInfo:Set<any> = new Set();
  selectedSessionInfo:any = "";
  seleedMonthIndex:any = "";
discounts:any = ["Direct Debit","Early Payment","Member","Sibling","Full Year","Others"];
  constructor(public storage: Storage,public navCtrl: NavController, public navParams: NavParams,public commonService:CommonService,public toastController: ToastController,public fb:FirebaseService,public alertController:AlertController
             ,public loadingCtrl:LoadingController) {
              

  }
  ionViewDidLoad() {

    console.log('ionViewDidLoad SetupdirectdebitfromonthlyPage');
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
    this.sessionInfo = this.navParams.get('sessionInfo');
    this.memberInfo = this.navParams.get('memberInfo');
    this.selectedSessionInfo =  this.navParams.get('selectedSessionInfo');
    this.seleedMonthIndex =  this.navParams.get('seleedMonthIndex');
   let x = Number(moment().add(3,'days').format("DD"));
   let y = moment(new Date('1-'+this.selectedSessionInfo.Month+'-2019').getTime()).format('MM')
    this.selectedStartDates = this.selectedSessionInfo.Year+"-"+y+"-"+x
   
    if(this.monthlyList != undefined){
      this.monthlyList = this.commonService.convertFbObjectToArray(this.memberInfo["MonthlySession"])
    }
    if(this.memberInfo["PayDetailsMap"] != undefined){
      this.paymentMap = this.memberInfo["PayDetailsMap"];
    }
    this.directDebitInfo = this.navParams.get('directDebitInfo');
    this.getParentClubInfo();
    this.getMandates();
    this.getSortedMonthList();
    console.log(this.sessionInfo);
    console.log(this.memberInfo);
  }
  getMonth(val:any):string{
    return String(val.Key).split("-")[0];
  }
  getYear(val:any):string{
    return String(val.Key).split("-")[1];
  }
  
  getParentClubInfo(){
    const parentclub$Obs = this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.memberInfo.ParentClubKey }).subscribe((data) => {
      parentclub$Obs.unsubscribe();
      if (data.length > 0) {
        this.parentClubInfo = data[0];
      }
    });
  }
  selectMonth(month,index){
    if(String(month.AmountPayStatus).toLowerCase() == "due"){
        if( this.directDebitInfo == undefined){
          let currMonth = moment(new Date(moment().format("YYYY-MMM-DD")).getTime())
          let formatedDate = month.Key.split("-")[1]+"-"+month.Key.split("-")[0]+this.selectedStartDates.split("-")[2];
          let selMonth = moment(new Date(formatedDate).getTime());
          if(selMonth.diff(currMonth,'days') >= 0){
            //....have to check member or not, price metters for member and non member
            this.monthlyPayAmount = this.sessionInfo.AmountForOneDayPerWeekForMember;
            this.tempStorage = this.sessionInfo.AmountForOneDayPerWeekForMember
            this.selectStartCard = index;
            this.selectedMonth = month;
            this.getSubScriptionMonths(month,index)
            this.getPaymentDetails(month,index);
          }else{
            this.presentToast("Can't setup Direct Debit for past month");
          }
        }else{
          this.presentToast("Already Direct Debit Subscribe");
        }

    }else{
      this.presentToast('Already Paid')
    }
  }
  getSubScriptionMonths(months,index){
    this.subscriptionMonths = "";
    for(let i = index;i < this.monthlyList.length;i++){
      this.subscriptionMonths = this.subscriptionMonths+this.monthlyList[i].Key+","
    }

  }
  calculatePayment(month,index){
    if(index !=0){
      let nowMonth = moment().format("MMM");
          if(nowMonth == this.monthlyList[index].Month){

          }
      for(let i = 0; i < index;i++){
        //........................check which month paid ....................
        if(String(this.monthlyList[i].AmountPayStatus).toLowerCase() == "due"){
    //..............check selectmonth is exceed current month or not
          
          
        }
      }
    }else{
     
    }
  }
  changeDate(ev){

    console.log(this.selectedStartDates);
    // this.selectedStartDates = ev.day;
    // if(this.selectedMonth != "" && this.selectedMonth != undefined){
    //   this.getPaymentDetails(this.selectedMonth,this.selectStartCard);
    // }else{
    //   this.presentToast("select a month")
    // }
    
  }
  getSortedMonthList(){
      for (let i = 0; i < this.monthlyList.length; i++){
          for (let j = i; j < this.monthlyList.length; j++) {
            let xYear =  this.monthlyList[i].Key.split('-')[1]
            let xmon = this.monthlyList[i].Key.split('-')[0]
            let iday = moment(new Date(xYear+'-'+xmon+"-01").getTime())
            let ymon = this.monthlyList[j].Key.split('-')[0]
            let yYear = this.monthlyList[j].Key.split('-')[1]
            let jday =  moment(new Date(yYear+'-'+ymon+"-01").getTime())
            if(jday.diff(iday,'days') < 0) {
              let k = this.monthlyList[i];
              this.monthlyList[i] = this.monthlyList[j];
              this.monthlyList[j] = k
            } 
          }
      }
      this.monthlyPayAmount = this.sessionInfo.AmountForOneDayPerWeekForMember;
      this.selectMonth(this.monthlyList[this.getStartedMonth()],this.getStartedMonth());
  }
  getStartedMonth(){
    for(let i = 0; i < this.monthlyList.length;i++){
      if(this.monthlyList[i].Month == moment().format('MMM')){
        return i;
      }
    }
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message:msg,
      duration: 2000
    });
    toast.present();
  }
  getPaymentDetails(month,index){
   if(this.selectedStartDates == undefined){

   }else{
    this.oneOffpaymentArray = [];
    this.recurringPaymentArray = [];
    for(let i = 0 ; i <= index;i++){
      //............checking current month date according to selected date
      //is it add to one off or not
      if(i != index){
        if((this.monthlyList[i].AmountPayStatus).toLowerCase() == "due"){
          this.oneOffpaymentArray.push(this.monthlyList[i])
        }
      }else{
       // let compareAddingTenDays:any = Number(moment(new Date(this.selectedStartDate)).format("DD"));
       //........check selected month is current month or not.............
        let currMonth = moment(new Date(moment().format("YYYY-MMM-DD")).getTime())
        let formatedDate = this.monthlyList[i].Key.split("-")[1]+"-"+this.monthlyList[i].Key.split("-")[0]+"-01"
        let selMonth = moment(new Date(formatedDate).getTime());
        if(selMonth.diff(currMonth,'days') == 0){
          let compareAddingTenDays:any = this.selectedStartDates;
          if(compareAddingTenDays - Number(moment().format("DD")) >=5){
            this.recurringPaymentArray.push(this.monthlyList[i])
          }else{
            this.oneOffpaymentArray.push(this.monthlyList[i]);
          }
        }else if(selMonth.diff(currMonth,'days') >= 0){
          this.recurringPaymentArray.push(this.monthlyList[i])
        }
      
      }
    }
    //................whethe the selected month is count in oneoff or recurring
    let startingRecurringIndex = 0;
    if(this.recurringPaymentArray.length > 0 ){
      startingRecurringIndex = index + 1;
    }else{
      startingRecurringIndex = index;
    }
    for(let i = startingRecurringIndex;i <  this.monthlyList.length;i++){
      if((this.monthlyList[i].AmountPayStatus).toLowerCase() == "due"){
        this.recurringPaymentArray.push(this.monthlyList[i]);
      } 
    }
    console.log(this.oneOffpaymentArray);
    console.log(this.recurringPaymentArray);
    this.getPaymentAmount();
   }
  }
  getPaymentAmount(){
    let oneOffPayment = 0
    for(let i = 0; i < this.oneOffpaymentArray.length;i++){
      if(String(this.oneOffpaymentArray[i].AmountPayStatus).toLowerCase() == "due"){
        oneOffPayment = oneOffPayment + Number(this.oneOffpaymentArray[i].AmountDue);
      }
    }
    this.dueAmount = oneOffPayment;
  }
  getDecimalAmount(amount){
    return parseFloat(amount).toFixed(2);
  }
  getFormatedDate(date){
    if(date != ""){
      return moment(new Date(date).getTime()).format('Do');
    }
   
  }
  applyDiscountOnRecurring(ev){
    this.monthlyPayAmount = this.tempStorage;
    this.monthlyPayAmount = this.getDecimalAmount(this.monthlyPayAmount - Number(this.recurringDiscount));
  }
  getMandates(){
    let memkey = "";
    if(this.memberInfo.IsChild){
      memkey = this.memberInfo.ParentKey
    }else{
      memkey = this.memberInfo.Key
    }
    const mandates$Obs = this.fb.getAllWithQuery('GoCardLess/Mandates/'+this.memberInfo.ParentClubKey+"/"+this.memberInfo.ClubKey+"/"+memkey,{orderByKey:true}).subscribe((data) =>{
      mandates$Obs.unsubscribe();
      this.mandatesList = [];
      for(let i = 0 ;i < data.length ;i++){
        if(data[i].Status == 3 && data[i].IsActive && data[i].IsEnable && this.sessionInfo.ActivityKey == data[i].ActivityKey){
          this.mandatesList.push(data[i]);
        }
      }
    })
  }
  showShare(monthinfo){
    this.isOneOffPayment = true;
    this.selectedMonthForOneOffPayment = monthinfo;
    if(this.mandatesList.length > 1){
      let modal = document.getElementById('myModal1');
      modal.style.display = "block";
    }else{
      this.selectedMandate = this.mandatesList[0];
      this.selectMandate(this.selectedMandate);
    }
   
   }

   closeModal(){
    let modal2 = document.getElementById('myModal1');
    if(event.target == modal2){
      modal2.style.display = "none";
    }
   
  }
  selectMandate(selectedMandate){
    this.selectedMandate = selectedMandate;
    this.presentAlertConfirm()
  }
   async presentAlertConfirm() {
    const alert = await this.alertController.create({
      title:'Select Mandate',
      message: 'Are you sure ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
        
          }
        }, {
          text: 'Yes',
          handler: () => {
            if(this.isOneOffPayment){
              this.makePaymentObj();
            }else{
              this.saveSubscription();
            }
           
          }
        }
      ]
    });

    await alert.present();
  }
   initiatePayment(obj){
    return new Promise((resolve,reject) =>{
      try{
        $.ajax({
          url: new DirectDebitController().getApi('oneOffPayment'),
          type: "POST", 
          data:obj,
          success: function(res){
            if(res.IsAllow){
              resolve(res)
            }else{
              reject(res)
            }
          }
        });
      }catch(err){
        reject(err)
      }
    })
  }
  getParentClubNotification() {
    this.fb.getAllWithQuery("/NotificationCenterSetup/ParentClub/" + this.memberInfo.ParentClubKey, { orderByKey: true }).subscribe((data) => {
      if (data.length > 0) {
        this.parentClubNotificationSetup = data;
      }
    });
  }
  createPaymentObject(){
    let metaKeys = "ParentClubKey,ClubKey,MemberKey,SessionKey,CoachKey,ActivityKey,MandateId,Amount,Currency,PaymentGateWayKey,PaymentTransactionKey";
    let metaValues = this.memberInfo.ParentClubKey+","+this.memberInfo.ClubKey+","+this.memberInfo.Key+","+
                      this.sessionInfo.$key+","+this.sessionInfo.CoachKey+","+this.sessionInfo.ActivityKey+","+
                      this.selectedMandate.MandateID+","+this.selectedMonthForOneOffPayment.TotalFeesAmount+","+this.currencyDetails.CurrencyCode
                      +","+this.paymentGatwayKey+","+this.paymenttransactionKey;
    let prepareOneOffPaymentObj = {
      'ParentClubKey':this.memberInfo.ParentClubKey,
      'ClubKey':this.memberInfo.ClubKey,
      'MemberKey':this.memberInfo.Key,
      'SessionKey': this.sessionInfo.$key,
      'CoachKey':this.sessionInfo.CoachKey,
      'ActivityKey':this.sessionInfo.ActivityKey,
      'MandateId':this.selectedMandate.MandateID,
      'Amount':this.selectedMonthForOneOffPayment.TotalFeesAmount,
      'Currency':this.currencyDetails.CurrencyCode,
      'CreatedDate':new Date().getTime(),
      'IdempotencyKey':this.selectedMandate.$key+"-"+new Date().getTime(),
      'UpdatedDate':new Date().getTime(),
      'MetaDataKeys':metaKeys,
      'metaValues':metaValues
    }
    return prepareOneOffPaymentObj;
  }
  async makePaymentObj(){
    this.loading = this.loadingCtrl.create({
      content: 'Initiating Payment...'
    });
    let prepareOneOffPaymentObj = this.createPaymentObject();
    try{
  
      let response = await this.initiatePayment(prepareOneOffPaymentObj);
      if(response["IsAllow"] && response["TransactionId"] != "" && response["TransactionId"] != undefined){
       this.saveInitialPaymentObject(response);
      }
       this.loading.dismiss().catch(() => { });
    }catch(err){
      this.loading.dismiss().catch(() => { });
      this.presentToast(err);
    }
   
  }
  getcustomMandateDate(date){
    return moment(Number(date)).format("Do-MMM-YYYY h:mm a");
  }
  async saveInitialPaymentObject(response){
    let discountsGiven = "0";
    let now = new Date();
    this.paymentGatwayKey = await this.fb.saveReturningKey("/PaymentGatewayInfo/Session/", {
      TotalAmount: this.selectedMonthForOneOffPayment.TotalFeesAmount,
      SubTotalAmount: this.selectedMonthForOneOffPayment.TotalFeesAmount,
      IsPaid: true,
      TransactionNo:response["TransactionId"],
      PaymentMode: "Direct debit",
      OrderNo:this.parentClubInfo.ParentClubOrderNoPrefix +""+ ((now.getDate()).toString() + (now.getMonth() < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1) + now.getFullYear().toString().substr(-2) + now.getTime()),
      PaymentOption: 101
    });
    for (let j = 0; j < this.sessionInfo.Discount.length; j++) {
      if (this.sessionInfo.Discount[j].ValueOfDeduction != "0") {
        discountsGiven = (parseFloat(discountsGiven) + parseFloat(this.sessionInfo.Discount[j].DiscountAmount)).toFixed(2);
      }
    }
    
    this.paymenttransactionKey = await this.fb.saveReturningKey("/PaymentGatewayInfo/Session/" + this.paymentGatwayKey + "/SessionDetails",
              {
                SessionKey: this.sessionInfo.$key,
                ActivityKey:  this.sessionInfo.ActivityKey,
                CoachKey:  this.sessionInfo.CoachKey,
                ClubKey:  this.sessionInfo.ClubKey,
                CoachName:  this.sessionInfo.CoachName,
                FinancialYearKey:  this.sessionInfo.FinancialYearKey,
                ParentClubKey:  this.sessionInfo.ParentClubKey,
                SessionName:  this.sessionInfo.SessionName,
                SessionFee: this.selectedMonthForOneOffPayment.TotalFeesAmount,
                MemberKey:  this.memberInfo.Key,
                ParentMemberKey: (this.memberInfo.IsChild)?this.memberInfo.ParentKey:"",
                AmountPaid: response["Amount"],
                MemberClubKey:  this.memberInfo.ClubKey,
                IsPaid: true,
                PaymentDate: (new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()),
                TransactionNo:this.paymentGatwayKey ,
                DiscountAmount: discountsGiven,
                MonthlySessionKey:this.selectedMonthForOneOffPayment.Key
              }
    );
    // for (let discountIndex = 0; discountIndex < this.sessionInfo.Discount.length; discountIndex++) {
    //   this.fb.saveReturningKey("/PaymentGatewayInfo/Session/" + this.paymentGatwayKey + "/SessionDetails/" + this.paymenttransactionKey + "/Discount/", {
    //     DiscountName: this.sessionInfo.Discount[discountIndex].DiscountName,
    //     DiscountType: this.sessionInfo.Discount[discountIndex].LevelType,
    //     DiscountApplied:this.sessionInfo.Discount[discountIndex].DiscountAmount,
    //     Discount: this.sessionInfo.Discount[discountIndex].ValueOfDeduction,
    //   });
    // }
    this.fb.update(this.selectedMonthForOneOffPayment.Key, "/Session/" + this.sessionInfo.ParentClubKey +
      "/" + this.sessionInfo.ClubKey + "/" + this.sessionInfo.CoachKey + "/Group/"
      + this.sessionInfo.$key + "/Member/" +this.memberInfo.Key+ "/MonthlySession/", { PaidBy: 'Online', AmountDue: "0", AmountPaid:response["Amount"], AmountPayStatus: "Paid", TransactionNo: this.paymentGatwayKey, TransactionDate: (new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()) });

    this.fb.update(this.selectedMonthForOneOffPayment.Key, "/Member/" + this.sessionInfo.ParentClubKey+
      "/" +this.sessionInfo.ClubKey+ "/" + this.memberInfo.Key+ "/Session/" + this.sessionInfo.$key + "/MonthlySession/"
      , { PaidBy: 'Direct debit', AmountDue: "0", AmountPaid:response["Amount"], AmountPayStatus: "Paid", TransactionNo:this.paymentGatwayKey, TransactionDate: (new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()) });

    this.fb.update(this.selectedMonthForOneOffPayment.Key,"/Coach/Type2/" +this.sessionInfo.ParentClubKey +
      "/" + this.sessionInfo.CoachKey+ "/Session/" + this.sessionInfo.$key+ "/Member/" + this.memberInfo.Key
      , { PaidBy: 'Direct debit', AmountDue: "0", AmountPaid:response["Amount"], AmountPayStatus: "Paid", TransactionNo:this.paymentGatwayKey, TransactionDate: (new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()) });

      this.fb.update(this.sessionInfo.$key, "/Member/" + this.sessionInfo.ParentClubKey +
      "/" + this.sessionInfo.ClubKey + "/" + this.memberInfo.Key + "/Session/"
      , {HasPaidInAdvance:true});
      this.navCtrl.pop();
  }
  subscribePayment(){
    this.isOneOffPayment = false;
    if(this.mandatesList.length > 1){
      let modal = document.getElementById('myModal1');
      modal.style.display = "block";
    }else{
      this.selectedMandate = this.mandatesList[0];
      this.selectMandate(this.selectedMandate);
    }
  }
  getSubscribePayment(){
    return new Promise((resolve,reject)=>{
      let subObj = this.createPaymentObject();
      subObj["diductionMonthDate"] = this.selectedStartDates.split(",")[2];
      subObj["Amount"] = this.monthlyPayAmount;
      subObj["StartMonth"] = this.selectedMonth.Key;
      subObj["EndMonth"] = this.monthlyList[this.monthlyList.length-1].Key;
      $.ajax({
        url:new DirectDebitController().getApi('subscription'),
        type: "POST", 
        data:subObj,
        success: function(res){
          if(res.IsAllow){
            resolve(res)
          }else{

            reject(res)
          }
        }
      });
    })
   
  }
  async saveSubscription(){
    try{
      let res = await this.getSubscribePayment();
    let memberObj = {
      SessionName:this.sessionInfo.SessionName,
      CoachName:this.sessionInfo.CoachName,
      CoachKey:this.sessionInfo.CoachKey,
      FirstName:this.memberInfo.FirstName,
      LastName:this.memberInfo.LastName,
      DOB:this.memberInfo.DOB,
      Email:this.memberInfo.EmailID,
      PhoneNumber:this.memberInfo.PhoneNumber,
      IsActive:true,
      IsEnable:true,
      CreatedDate:new Date().getTime(),
      UpdatedDate:new Date().getTime(),
      SubscribeId:res["SubscriptionId"],
      SubScriptionStatus:res["SubscriptionStatus"],
      MandateID:res['MandateId'],
      StartMonth:res['StartMonth'],
      EndMonth:res['EndMonth'],
      Amount:res['Amount'],
      Currency:res['Currency'],
      SubscribeMonths:this.subscriptionMonths,
      Discount:this.discount,
      ParentClubKey:this.memberInfo.ParentClubKey,
      ClubKey:this.memberInfo.ClubKey
    }
    this.fb.update(this.memberInfo.Key,"DerictDebitSetup/Session/"+this.sessionInfo.$key,memberObj)
    console.log(memberObj);
    this.navCtrl.pop();
    }catch(e){
      this.presentToast(e);
    }
    
  }
  goToMandateSetup(){
    this.navCtrl.push("DirectdebitchoosememberPage");
  }
}
