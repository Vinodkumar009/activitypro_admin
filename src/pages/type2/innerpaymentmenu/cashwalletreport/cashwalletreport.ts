import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';


// import { CommonService } from '../../../services/common.service';
// import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-cashwalletreport',
    templateUrl: 'cashwalletreport.html',
})
export class CashWalletReport {
    @ViewChild('fab')fab : FabContainer;
    platform:string = "";
    ParentClubKey: any;
   
    currencyDetails: any;
    
    loading: any;
    nestUrl: string;
    totalParentClubBalance: any;
    totalParentClubData = [];
    

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalController: ModalController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl : LoadingController,
        public http:  HttpClient,
        public sharedservice: SharedServices,
        private toastCtrl: ToastController, public commonService: CommonService
    ) {
        this.platform = this.sharedservice.getPlatform();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.nestUrl = this.sharedservice.getnestURL()
                this.getTotalBalance()
                this.getTotalBalanceReport()
          
            }

        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }


    getTotalBalance(){
        this.commonService.showLoader('')
        //this.memberKey = '-MN2PHs_uXWut_HIIj34'
        this.http.get(`${this.nestUrl}/wallet/getavailabletotalbalance/${this.ParentClubKey}`).subscribe((res) => {
          this.commonService.hideLoader();
          if (res['data']){
            this.totalParentClubBalance = res['data']['totalparentclubbalance']
          }
        },
          err => {
            this.commonService.hideLoader()
            this.totalParentClubBalance = 0
          })
    }

    getTotalBalanceReport(){
        
        //this.memberKey = '-MN2PHs_uXWut_HIIj34'
        this.http.get(`${this.nestUrl}/wallet/paymentreport/${this.ParentClubKey}`).subscribe((res) => {
          if (res['data']){
            this.totalParentClubData = res['data']
          }
        },
          err => {
            
            this.totalParentClubData = []
          })
    }

    gotoMainReport(){
      this.navCtrl.push('WalletReportByDate', {totalParentClubBalance:this.totalParentClubBalance})
    }
    getRound(number){
      return parseFloat(number).toFixed(2)
    }
    
}
