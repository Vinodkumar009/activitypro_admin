import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage'
import { IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { FirebaseService } from '../../../../../services/firebase.service';
import { SharedServices } from '../../../../services/sharedservice';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
@IonicPage()
@Component({
  selector: 'sessionweeklyloyalty-page',
  templateUrl: 'sessionweeklyloyalty.html'
})

export class SessionWeeklyLoyalty {
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
    Members:[],
    Transactionbykey:""
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
  monthly = false;
  sessionList: any;
  memberLists: any;
  Session: any;
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
          this.SessionDetials = navParams.get('SesDetails');
          this.clubName = this.navParams.get("clubName");   
          this.monthly = this.navParams.get('monthly'); 
          
          this.sessionList = navParams.get('SessionList');
          this.memberLists = navParams.get('MemberList');
          this.Session = navParams.get('SessionDetails');//individual session
          const coach$Obs = this.fb.getAllWithQuery(`Coach/Type2/${this.SessionDetials.ParentClubKey}`, { orderByKey: true, equalTo: this.SessionDetials.CoachKey }).subscribe((data: any) => {
            coach$Obs.unsubscribe();
            this.coachInfo = data[0];
          })
          this.Session.Members = this.cm.sortingObjects(this.Session.Members, "UserName").filter(session => session['IsActive']);
          this.sessionType = this.TypeList.filter(type => type.Code == +this.SessionDetials.PaymentOption)[0].Name
          this.Session.Members.forEach(member => {
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
    this.selectedMember = this.Session.Members.filter(member => member.IsSelect)
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getWallet() {
    const wallet$Obs = this.fb.getAllWithQuery("StandardCode/Wallet/LoyaltyPoint/" + this.SessionDetials.ParentClubKey, { orderByKey: true, equalTo: this.SessionDetials.ClubKey }).subscribe((loyaltySetup) => {
      wallet$Obs.unsubscribe();
      if (loyaltySetup.length > 0 && loyaltySetup[0].IsEnable) {
        this.loyaltySetup = loyaltySetup[0]
        this.Session.Members.forEach(eachMember => {
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
        this.rewardAPIData.Refference = this.SessionDetials.$key+":"+this.Session.Key+":"+this.Session.SessionName
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
