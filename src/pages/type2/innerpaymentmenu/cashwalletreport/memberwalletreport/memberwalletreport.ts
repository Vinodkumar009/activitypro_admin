import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../../services/firebase.service';
import { SharedServices } from '../../../../services/sharedservice';
import { CommonService } from '../../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';


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
    totalParentClubBalance: any;
    totalParentClubData = [];
  memberKey: any;
  transactionCashHistory=[];
    

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalController: ModalController,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl : LoadingController,
        public http:  HttpClient,
        private navParams : NavParams,
        public sharedservice: SharedServices,
        public commonService: CommonService,
        private httpService: HttpService
    ) {
        this.platform = this.sharedservice.getPlatform();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
              this.memberKey = this.navParams.get('memberKey')
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
          
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
       this.commonService.showLoader("Please wait...")
       const url = `${API.WALLET_TRANSACTIONS_BY_MEMBER}/${this.memberKey}`;
       this.httpService.get(url, null, null, 1).subscribe({
         next: (res) => {
           this.commonService.hideLoader()
           if (res['data']){
             this.transactionCashHistory = res['data']
           }
         },
         error: (err) => {
           this.commonService.hideLoader()
         }
       });
     }
    
}
