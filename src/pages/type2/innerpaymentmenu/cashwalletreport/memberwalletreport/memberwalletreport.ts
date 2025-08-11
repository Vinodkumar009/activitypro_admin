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
    selector: 'page-memberwalletreport',
    templateUrl: 'memberwalletreport.html',
})
export class MemberWalletReport {
    @ViewChild('fab')fab : FabContainer;
    platform:string = "";
    ParentClubKey: any;
   
    currencyDetails: any;
    
    loading: any;
    nestUrl: string;
    totalParentClubBalance: any;
    totalParentClubData = [];
  memberKey: any;
  transactionCashHistory=[];
    

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalController: ModalController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl : LoadingController,
        public http:  HttpClient,
        private navParams : NavParams,
        public sharedservice: SharedServices,
        private toastCtrl: ToastController, public commonService: CommonService
    ) {
        this.platform = this.sharedservice.getPlatform();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
              this.memberKey = this.navParams.get('memberKey')
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.nestUrl = this.sharedservice.getnestURL()
          
                this.getCashTransactionHistory()
          
            }

        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }


    getRound(number){
      return parseFloat(number).toFixed(2)
    }
    getCashDate(date){
      return moment.utc(date).local().format('DD-MMM-YYYY hh:mm a')
    }

    getCashTransactionHistory(){
       this.commonService.showLoader()
       this.http.get(`${this.nestUrl}/wallet/transactions/${this.memberKey}`).subscribe((res) => {
        this.commonService.hideLoader()
         if (res['data']){
           this.transactionCashHistory = res['data']
         }
       },
         err => {
        this.commonService.hideLoader()
         })
     }
    
}
