import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,  AlertController, ActionSheetController, ModalController, FabContainer } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import moment from 'moment'

@IonicPage()
@Component({
    selector: 'page-monthslistmodal',
    templateUrl: 'monthslistmodal.html',
})
export class MonthsListModal {
    
    platformType: string = "";
    ParentClubKey: any;
    currencyDetails: any; 
    nestUrl: string;
    currencycode: any;
    Session: any;
    ClubKey: any;
    type: any;
    SessionMonths = [];

    constructor(
        public navCtrl: NavController,
        public navParam: NavParams,
        public modalController: ModalController,
        private fb: FirebaseService,
        storage: Storage,
        public sharedservice: SharedServices,
        public comonService: CommonService
    ) {
        this.platformType = this.sharedservice.getPlatform();
        this.SessionMonths = this.navParam.get('member').MonthlySession;
        
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.currencycode = val.Currency;
            }
            console.log("ParentClubKey: ", this.ParentClubKey)
            
        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }

    
    
    
}
