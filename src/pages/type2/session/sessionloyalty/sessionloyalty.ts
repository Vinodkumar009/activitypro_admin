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
  selector: 'sessionloyalty-page',
  templateUrl: 'sessionloyalty.html'
})

export class SessionLoyalty {
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
    Transactionbykey: "",
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
      DisplayName: 'Term Group Session',
      Name: 'TermGroupSession',
      Code: 100
    },
    {
      DisplayName: 'Monthly Session',
      Name: 'MonthlySession',
      Code: 101
    },
    {
      DisplayName: 'Weekly Session',
      Name: 'WeeklySession',
      Code: 102
    },
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
  coachInfo: any;
  clubName: any;
  selectedMember = []
  monthStatus = '';
  monthlyMember: any;
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
          this.clubName = this.navParams.get("clubName");   
          this.monthStatus = this.navParams.get('monthStatus');  
          this.monthlyMember = this.navParams.get('monthlyMember')
          const coach$Obs = this.fb.getAllWithQuery(`Coach/Type2/${this.SessionDetials.ParentClubKey}`, { orderByKey: true, equalTo: this.SessionDetials.CoachKey }).subscribe((data: any) => {
            coach$Obs.unsubscribe();
            this.coachInfo = data[0];
          })
          this.sessionType = this.TypeList.filter(type => type.Code == +this.SessionDetials.PaymentOption)[0].Name
        
          this.Member = this.cm.convertFbObjectToArray(this.SessionDetials.Member).filter(member => member.IsActive && member.AmountPayStatus && member.MonthlySession == undefined)
          if (this.monthStatus){
            this.monthlyMember.forEach(member => {
              member['IsSelect'] = false
              member['Loyaltyrefund'] = 0
            });
          }
          this.Member.forEach(member => {
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
    this.selectedMember = this.Member.filter(member => member.IsSelect)
    if (this.monthStatus){
      this.selectedMember = this.monthlyMember.filter(member => member.IsSelect)
    }
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getWallet() {
   const wallet$Obs = this.fb.getAllWithQuery("StandardCode/Wallet/LoyaltyPoint/" + this.SessionDetials.ParentClubKey, { orderByKey: true, equalTo: this.SessionDetials.ClubKey }).subscribe((loyaltySetup) => {
    wallet$Obs.unsubscribe();
      if (loyaltySetup.length > 0 && loyaltySetup[0].IsEnable) {
        this.loyaltySetup = loyaltySetup[0]
        if (this.monthStatus){
          this.monthlyMember.forEach(eachMember => {
            if(eachMember.MonthlySession[this.monthStatus].AmountPayStatus == 'Paid')
              eachMember.Loyaltyrefund = this.loyaltySetup['Reward'][this.SessionDetials.ActivityKey][this.sessionType]['StandardPoint'] * eachMember.MonthlySession[this.monthStatus].AmountPaid
            else
              eachMember.Loyaltyrefund = 0
          });
        }

        this.Member.forEach(eachMember => {
          if(eachMember.AmountPaid)
            eachMember.Loyaltyrefund = this.loyaltySetup['Reward'][this.SessionDetials.ActivityKey][this.sessionType]['StandardPoint'] * eachMember.AmountPaid
          else
            eachMember.Loyaltyrefund = 0
        });

      } else {
        this.cm.toastMessage('No Loyalty Setup Found', 3000)
      }
    })
  }

  addmin(starTime: string, min): string {
    min = parseInt(min);
    let result: string = "";
    let startHour = parseInt(starTime.split(":")[0]);
    let startMin = parseInt(starTime.split(":")[1]);
    let res = startMin + min;
    if (res >= 60) {
        let temp: any = res - 60;
        if (String(temp).length == 1) {
            temp = 0 + "" + temp;
        }
        if (startHour == 24) {
            return '01' + ":" + temp;
        } else {
            ++startHour;
            return startHour + ":" + temp;
        }
    } else {
        return startHour + ":" + res;
    }

}

  callRewardPointApi() {
    if (this.loyaltySetup){
      this.cm.commonAlter('Reward Points', 'Are you sure ?', () => {
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
        
        this.rewardAPIData.Members = []
        this.rewardAPIData.ClubKey = this.SessionDetials.ClubKey
        this.rewardAPIData.ParentClubKey = this.SessionDetials.ParentClubKey
        this.rewardAPIData.TransactionDate = new Date().toISOString()
        this.rewardAPIData.Transactionbykey = this.user.$key
        if (this.user.RoleType == "2" && this.user.UserType == "2") {
          this.rewardAPIData.Transactionby = 'Admin'
        } else if (this.user.RoleType == "4" && this.user.UserType == "2") {
          this.rewardAPIData.Transactionby = 'Coach'
        }
        this.rewardAPIData.Refference = this.SessionDetials.$key+":"+this.SessionDetials.SessionName
        this.selectedMember.forEach(eachMember => {
          if(eachMember.IsSelect){
            let AmountPaid = this.cm.round(1 / +this.loyaltySetup['PointConversionFactor'] * eachMember.Loyaltyrefund, 2)
            let obj = {
              MemberKeys : eachMember.Key,
              TypeCode : this.SessionDetials.PaymentOption,
              TypeName : this.sessionType,
              BonusPoints: 0,
              BonusType: "",
              Comments : `Points refunded to ${eachMember.FirstName} ${eachMember.LastName}`,
              PrimaryMemberKey : eachMember.IsChild ? eachMember.ParentKey : eachMember.Key,
              TotalPoints : eachMember.Loyaltyrefund,
              ActualAmount : AmountPaid,
            }
            this.rewardAPIData.Members.push(obj)
          }
        });
  
        
        this.http.post(`${this.nestUrl}/loyalty/rewardpointsbulk_v2`, this.rewardAPIData)
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
