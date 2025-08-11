import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ActionSheetController ,Platform, LoadingController } from 'ionic-angular';
import { CommonService } from '../../../../../services/common.service';
import { CallNumber } from '../../../../../../node_modules/@ionic-native/call-number';
import { FirebaseService } from '../../../../../services/firebase.service';
import { Storage } from '@ionic/storage';

import * as $ from "jquery";
import { count } from 'rxjs/operators';
import * as moment from 'moment';

import { setupUrlSerializer } from 'ionic-angular/navigation/url-serializer';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-monthlymembershipsetup',
    templateUrl: 'monthlymembershipsetup.html',
})
export class MonthlyMembershipSetupPage {
    selectedClubKey: any;
    ParentClubKey: any;
  
    currencyDetails: any;
   
    MemberKey: any;
    Key: any;
    IsThereAnyActiveSetup = false;
   
    selectedMember: any[];
    AllSetups: any[];
    eachSetup: any;

    clubKey: any;
    amount;
    monthArr: any;
    PaymentOptionkey: any;
    setupKey: any;
    email: any;
    selectedmember:any;
    loading: any;
    constructor(public fb: FirebaseService,
        public toastCtrl: ToastController, 
        public alertCtrl: AlertController,
        public comonService: CommonService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: HttpClient,
        public loadingCtrl: LoadingController,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage,
    ) {
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
            this.eachSetup = this.navParams.get("setup")
            this.email = this.navParams.get("email")
            this.setupKey = this.navParams.get("setupKey")
            this.PaymentOptionkey = this.navParams.get("PaymentOptionkey")
            this.selectedmember = this.navParams.get('selectedmember')
            
            console.log(this.eachSetup)
        })
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
               // this.MemberKey = val.UserInfo[0].Key
                //this.getPrice(this.ParentClubKey);
                this.fetchMonth()
            }
          
        })
      
    }

    ionViewDidEnter() {    
    }
   
    fetchMonth(){
        try{
            let url = "https://activitypro-nest-261607.appspot.com/membership/monthlymembershipmonths?clubKey="+this.eachSetup.ClubKey+"&parentClubKey="+this.ParentClubKey
            this.http.get(url).subscribe(data =>{
                this.monthArr = data['data']
                this.monthArr.forEach(eachdata => {
                    eachdata['isSelect'] = false
                });
                
            })
        }catch(error){

        }
    }

   
    showToast(m: string, dur: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: dur,
            position: 'bottom'
        });
        toast.present();
    }

    save(){

        let selectedmonth = this.monthArr.filter(month => month.isSelect)
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
          });
      
        this.loading.present()
        try{
            let memberKeys = []
            this.selectedmember.forEach(eachMember => {
                memberKeys.push(eachMember.key)
            });
            let url = "https://activitypro-nest-261607.appspot.com/membership/assignmonthlymembership"
        
            this.http.post(url, {
                parentClubKey: this.ParentClubKey,
                clubKey: this.eachSetup.ClubKey,
                memberKeys: memberKeys,
                membershipSetupKey: this.setupKey,    
                startMonth: selectedmonth[0],
                email: this.email,
                paymentOptionKey: this.PaymentOptionkey   
            }).subscribe(data =>{
                this.loading.dismiss()
                console.log(data)
                if(data['status'] == 200){
                    this.showToast('membership assigned successfully...', 3000)
                    this.navCtrl.pop().then(() => this.navCtrl.pop()
                    )
                   
                }
                
            },
            error => {
                this.loading.dismiss()
                this.showToast(error.message, 3000)
            } 
            )
        }catch(error){
            this.loading.dismiss()
        }
    }
    
    selectMonth(mon){
        this.monthArr.forEach(month => {
            if(month.label){
                month.isSelect = false
            }
            if(mon.label == month.label){
                month.isSelect = true
            }
        });

    }

}
