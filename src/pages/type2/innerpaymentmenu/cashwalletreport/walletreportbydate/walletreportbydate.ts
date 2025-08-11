import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../../services/firebase.service';
import { SharedServices } from '../../../../services/sharedservice';
import { CommonService } from '../../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';


// import { CommonService } from '../../../services/common.service';
// import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-walletreportbydate',
    templateUrl: 'walletreportbydate.html',
})
export class WalletReportByDate {
    platform:string = "";
    ParentClubKey: any;
   
    currencyDetails: any;
    
    loading: any;
    nestUrl: string;
    totalParentClubBalance: any;
    totalParentClubData = [];
  isAndroid: any;
  isMonthSelected: boolean;
  TotTrnsAmt: number;
  paymentReportType: string;
  lastDate
  startDate
  WalletTransactionType = ['Debited', 'Credited']
  paidMemberListtemp = [];
  isDateRange: boolean;

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public navParam: NavParams,
        public modalController: ModalController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl : LoadingController,
        public http:  HttpClient,
        public sharedservice: SharedServices,
        platform: Platform,
        private toastCtrl: ToastController, public commonService: CommonService
    ) {
       
        this.isAndroid = platform.is('android');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.nestUrl = this.sharedservice.getnestURL()
                this.totalParentClubBalance = this.navParam.get('totalParentClubBalance')
                this.getTotalBalanceReportByDate()
            }

        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }   

    trnsMonths: Array<any> = [];
    ionViewWillEnter() {
      this.startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
      this.lastDate = moment().format('YYYY-MM-DD') 
      
      for (let i = 0; i < 4; i++) {
        let check = moment().subtract(i, 'months');
        let month = check.format('MMM');
        let year = check.format('YYYY');
        this.trnsMonths.push({ month: month, year: year, IsActive: false });
      }
      this.trnsMonths.reverse();
      this.trnsMonths.push({ month: "7", year: "Days", IsActive: false });
      this.trnsMonths.push({ month: "Dates", year: "", IsActive: false });
      this.SelectedMonth(this.trnsMonths.length - 2)
    }

    
  SelectedMonth(index: number) {
    this.isDateRange = false
    this.TotTrnsAmt = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;

    if (this.trnsMonths[index].IsActive) {
      this.trnsMonths.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item.IsActive = false;
      });
    }

    let date = moment().format('YYYY-MM-DD') 
    let startdate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    this.paymentReportType = `${this.trnsMonths[index].month}-${this.trnsMonths[index].year}`;
    if (this.trnsMonths[index].year == "Days") {
      this.startDate = startdate
      this.lastDate = date
      this.getTotalBalanceReportByDate()
    } else if (this.trnsMonths[index].year == "") {
      this.lastDate = moment(this.lastDate).format('YYYY-MM-DD')
      this.isDateRange = true
      this.getTotalBalanceReportByDate()
      //this.getActiveBookings();
    } else {
      this.startDate = moment().month(this.trnsMonths[index].month).startOf('month').format('YYYY-MM-DD');
      this.lastDate = moment().month(this.trnsMonths[index].month).endOf('month').format('YYYY-MM-DD');
      this.getTotalBalanceReportByDate()
      //this.getActiveBookings();
    }

  }
  getRound(number){
    return parseFloat(number).toFixed(2)
  }

  Search(){
      this.getTotalBalanceReportByDate()
    //this.getActiveBookings();
  }

    getTotalBalanceReportByDate(){
        
        this.http.get(`${this.nestUrl}/wallet/paymentreportbydate/${this.ParentClubKey}/${this.startDate}/${this.lastDate}`).subscribe((res) => {
          if (res['data']){
            
              res['data'].forEach(each => {
                each['transactionTypeText'] = this.WalletTransactionType[each['transactionType']-1]
                each['date'] = moment(each['CreatedAt']).format('DD-MMM-YYYY')
                let amount = each['transactionType'] == 1 ? -each['amount'] : each['amount']
                this.TotTrnsAmt = this.TotTrnsAmt + amount
              });
              
            
            this.paidMemberListtemp = res['data']
          }
        },
          err => {
            
            this.paidMemberListtemp = []
          })
    }
    
}
