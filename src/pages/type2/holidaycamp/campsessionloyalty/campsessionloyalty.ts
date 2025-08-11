import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';
import { Storage } from '@ionic/storage'
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
@IonicPage()
@Component({
  selector: 'campsessionloyalty-page',
  templateUrl: 'campsessionloyalty.html'
})

export class CampSessionLoyalty {
  themeType: number;
  parentClubKey: any;
  clubKey: any;
  CoachKey: any;
  SessionKey: any;
  rewardAPIData = {

    PaymentTrainsactionID: "",
    Refference: "",
    ParentClubKey: "",
    ClubKey: "",
    Transactionby: "",
    TransactionDate: "",
    Members:[]
  }
  members: {
    TotalPoints: 0,
    BonusPoints: 0,
    BonusType: "",
    ActualAmount: 0,
    TypeCode: 0,
    PrimaryMemberKey: "",
    TypeName: "",
    MemberKeys: "", // comma separated memberkeys
    Comments: "",
  }
  TypeList = [
    {
      DisplayName: 'Holiday Camp',
      Name: 'HolidayCamp',
      Code: 103
    }
  ]
  SessionDetials: any;
  Member: any;
  currencyDetails: any;
  loading: any;
  loyaltySetup = {};
  sessionType = '';
  user: any;
  nestUrl: any;
  isReview = false;
  campDetails
  selectedMember = []
  SessionDate: string;

  constructor(public fb: FirebaseService, storage: Storage,
    public cm: CommonService, public navParams: NavParams,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    public http: HttpClient, public loadingCtrl: LoadingController) {

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.user = val
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.themeType = sharedservice.getThemeType();
          this.SessionDetials = navParams.get('sessionDetails');
          this.campDetails = navParams.get('CampDetails');
          this.SessionDate = moment(this.SessionDetials.SessionDate).format("DD MMM");

          this.sessionType = this.TypeList[0].Name   
          this.SessionDetials.Members.forEach(member => {
            member['IsSelect'] = false
            member['Loyaltyrefund'] = 0
          });   
          this.nestUrl = sharedservice.getnestURL()
          this.getWallet()
        }
    })

    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    
    }).catch(error => {
    });

  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  updateReview(){
    this.isReview = true
    this.selectedMember = this.SessionDetials.Members.filter(member => member.IsSelect)
    
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getWallet() {
    const loyalty$Obs = this.fb.getAllWithQuery("StandardCode/Wallet/LoyaltyPoint/" + this.campDetails.ParentClubKey, { orderByKey: true, equalTo: this.campDetails.ClubKey }).subscribe((loyaltySetup) => {
      loyalty$Obs.unsubscribe();
      if (loyaltySetup.length > 0 && loyaltySetup[0].IsEnable) {
        this.loyaltySetup = loyaltySetup[0]
        let activityKey = Object.keys(this.campDetails.Activity)[0]
        this.SessionDetials.Members.forEach(eachMember => {
          if(eachMember.AmountPaid)
            eachMember.Loyaltyrefund = this.loyaltySetup['Reward'][activityKey][this.sessionType]['StandardPoint'] * +eachMember.AmountPaid
          else
            eachMember.Loyaltyrefund = 0
        });

      } else {
        this.cm.toastMessage('No Loyalty Setup Found', 3000)
      }
    })
  }


  callRewardPointApi() {
    if (this.loyaltySetup){
      this.cm.commonAlter('Reward Points', 'Are you sure ?', () => {
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
        this.rewardAPIData.Members = []
        this.rewardAPIData.ClubKey = this.campDetails.ClubKey
        this.rewardAPIData.ParentClubKey = this.campDetails.ParentClubKey
        this.rewardAPIData.TransactionDate = new Date().toISOString()
        if (this.user.RoleType == "2" && this.user.UserType == "2") {
          this.rewardAPIData.Transactionby = 'Admin'
        } else if (this.user.RoleType == "4" && this.user.UserType == "2") {
          this.rewardAPIData.Transactionby = 'Coach'
        }
        this.rewardAPIData.Refference = this.SessionDetials.Key+":"+this.SessionDetials.SessionName
        this.selectedMember.forEach(eachMember => {
          if(eachMember.IsSelect){
            let obj = {
              MemberKeys : eachMember.Key, 
              TypeCode :  103,
              TypeName : this.sessionType,
              BonusPoints: 0,
              BonusType: "",
              Comments : `Points refunded to ${eachMember.FirstName} ${eachMember.LastName}`,
              PrimaryMemberKey : eachMember.IsChild ? eachMember.ParentKey : eachMember.Key,
              TotalPoints : eachMember.Loyaltyrefund,
              ActualAmount : eachMember.AmountPaid,
            }
            this.rewardAPIData.Members.push(obj)
          }
        });
  
        //this.nestUrl = "https://activitypro-nest.appspot.com"
        this.http.post(`${this.nestUrl}/loyalty/rewardpointsbulk`, this.rewardAPIData)
          .subscribe((res: any) => {
            this.loading.dismiss()
            if (res) {
              this.cm.toastMessage('Loyalty Points Awarded Successfully', 2000)
              this.navCtrl.pop()
            }
          }, err => {
            this.loading.dismiss()
          })
      })
    }else{
      this.cm.toastMessage('No loyalty setup', 3000, ToastMessageType.Error)
    }
  }

}
