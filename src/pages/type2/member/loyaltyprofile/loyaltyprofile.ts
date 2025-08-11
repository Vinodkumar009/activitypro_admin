import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../services/sharedservice';
import { VenueUser } from '../model/member';

/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-loyaltyprofile',
  templateUrl: 'loyaltyprofile.html',
})
export class LoyaltyProfile {
  member:VenueUser;
  selectedParentClubKey: any;
  currencyDetails: any;
  ParentClubAppIconURL: any;
  openReward = false;
  adjustCashPointsOpened: boolean = false;
  //  walletExists: boolean = false; //To check the wallet exist for a particular user
  parentClubWalletExists: boolean = false;

  LeagueType: boolean = true;
  TeamType: boolean = true;



  reward = {
    Comment: "",
    Point: 0,
    Amount: 0,
    Type: 0
  }

  cash = {
    Available_Balance: 0,
    Debit_Amount: 0,
    Type: "",
    Comment: "",
    Debit_Cash: 0,
  }

  ajdustCashInput = {
    memberId: "",
    amount: "",
    source: "",
    comments: ""
  }

  rewardAPIData = {
    TotalPoints: 0,
    BonusPoints: 0,
    BonusType: "",
    ActualAmount: 0,
    TypeCode: 0,
    TypeName: "",
    MemberKeys: "", // comma separated memberkeys
    Comments: "",
    PaymentTrainsactionID: "",
    Refference: "",
    PrimaryMemberKey: "",
    ParentClubKey: "",
    ClubKey: "",
    Transactionby: "",
    TransactionDate: "",
    Transactionbykey: ""
  }


  TypeList = [
    {
      DisplayName: 'Term Group Session',
      Name: 'TermGroupSession',
      IsShow: true,
      Code: 100
    },
    {
      DisplayName: 'Monthly Session',
      Name: 'MonthlySession',
      IsShow: true,
      Code: 101
    },
    {
      DisplayName: 'Weekly Session',
      Name: 'WeeklySession',
      IsShow: true,
      Code: 102
    },
    {
      DisplayName: 'Holiday Camp',
      Name: 'HolidayCamp',
      IsShow: true,
      Code: 103
    },

    {
      DisplayName: 'Tournament',
      Name: 'Tournament',
      IsShow: true,
      Code: 104
    },
    {
      DisplayName: 'School Session',
      Name: 'SchoolSession',
      IsShow: true,
      Code: 105
    },
    {
      DisplayName: 'Event',
      Name: 'Event',
      IsShow: true,
      Code: 106
    },
    {
      DisplayName: 'Membership',
      Name: 'Membership',
      IsShow: true,
      Code: 107
    },
    {
      DisplayName: 'Facility Booking',
      Name: 'FacilityBooking',
      IsShow: true,
      Code: 111
    },
    {
      DisplayName: 'Special Offer',
      Name: 'SpecialOffer',
      IsShow: true,
      Code: 108
    },
    {
      DisplayName: 'Others',
      Name: 'Others',
      IsShow: true,
      Code: 109
    },
    {
      DisplayName: 'Loyalty Conversion',
      Name: 'LoyaltyConversion',
      IsShow: false,
      Code: 110
    }
  ]
  loading;
  nestUrl: any;
  user: any;
  totalPointBalance = 0;
  totalWalletBalance = 0;
  displayPoint: any;
  loyaltySetup = [];
  transactionHistory = [];
  loyaltycardcolor = '#000';
  IsRewardAllowed: boolean = false;
  TypeListBackup = []
  debitPageOpened = false;
  DebitChecked = false;
  debitText = '';
  confirmText = '';
  CashChecked = false
  constructor(public events: Events, public http: HttpClient,
    public sharedModule: SharedServices, public storage: Storage,
     public fb: FirebaseService, public toastCtrl: ToastController, 
     public alertCtrl: AlertController, public commonService: CommonService,
      public navCtrl: NavController, public navParams: NavParams
    ) {
    this.member = this.navParams.get('member');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.user = val
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.nestUrl = this.sharedModule.getnestURL()
          this.selectedParentClubKey = club.ParentClubKey;
          this.getPCImageurl()
          this.getLoyaltyBalance()
          this.getLoyaltyTransactionHistory();
          this.rewardAllowed()
          this.getWallet() //this is to check parentclub setup has a wallet enable or not
          this.checkWalletForUser() //this is to check wallet has available for user or not
          // this.checkWalletTransactionForUser()
          this.TypeListBackup = this.TypeList.filter(type => type.IsShow)

        }
    })
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {});
  }
  isLoyaltyView: boolean; // Flag to show/hide the loyalty view
  // isCashView: boolean; // Flag to show/hide the cash view

  isCashView: boolean = true; // Default selected tab (true for Cash, false for Loyalty)

  changeType(isCash: boolean): void {
    this.isCashView = isCash;
  }


  ionViewDidLoad() {
    // this.checkWalletForParentClub();
    //  this.checkWalletForMember();
    this.isLoyaltyView = true;
  }



  showLoyalty() {
    this.isLoyaltyView = true;
    this.isCashView = false;
  }

  showCash() {
    this.isLoyaltyView = false;
    this.isCashView = true;
    this.checkWalletForUser()
  }

  getPCImageurl() {
    const $parentClubObs = this.fb.getAllWithQuery(`ParentClub/Type2/`, { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((pclub) => {
      $parentClubObs.unsubscribe();
      this.ParentClubAppIconURL = pclub[0]['ParentClubAppIconURL']
      if (pclub[0]['Theme']['LoyaltyCardTheme'])
        this.loyaltycardcolor = pclub[0]['Theme']['LoyaltyCardTheme']['bg-color']
      else {
        this.loyaltycardcolor = "#000000"
      }
    })
  }

  rewardpoints() {
    this.openReward = true;
    this.reward = {
      Comment: "",
      Point: 0,
      Amount: 0,
      Type: 0
    }
    console.log(this.reward)
  }

  adjustCashPoints() {
    this.navCtrl.push("AdjustcashpointPage");
  }



  rewardAllowed() {
    if (this.user.RoleType == "4" && this.user.UserType == "2") {
      this.fb.getAllWithQuery("Coach/Type2/" + this.selectedParentClubKey, { orderByChild: 'EmailID', equalTo: this.user.$key }).subscribe(data => {
        if (data.length > 0) {
          if (data[0].AllowLoyalty) {
            this.IsRewardAllowed = true;
          } else {
            this.IsRewardAllowed = false;
          }
        }
      })
    } else if (this.user.RoleType == "2" && this.user.UserType == "2") {
      this.IsRewardAllowed = true;
    }
  }

  getWallet() {
    this.fb.getAllWithQuery("StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey, { orderByKey: true, equalTo: this.member.clubkey }).subscribe((loyaltySetup) => {
      if (loyaltySetup.length > 0) {
        this.loyaltySetup = loyaltySetup[0]
        this.displayPoint = +loyaltySetup[0]['DisplayPointsonLoyaltyCard']
      } else {
        this.commonService.toastMessage('No Loyalty Setup Found', 3000)
      }
    })
  }

  calculateAmount(point) {
    if (Number.isInteger(+this.reward.Point) || this.reward.Point.toString() == "") {
      let PointConversionFactor = this.loyaltySetup['PointConversionFactor']
      this.reward.Amount = this.commonService.round(1 / +PointConversionFactor * this.reward.Point, 2)
    } else {
      this.reward.Point = 0
      this.commonService.commonAlter2('Incorrect Input', "Decimals are not allowed", () => { })
    }
  }

  calculate(point) {
    let PointConversionFactor = this.loyaltySetup['PointConversionFactor']
    return this.commonService.round(1 / +PointConversionFactor * point, 2).toFixed(2)
  }

  gettransactionDate(UTCdate) {
    return moment(UTCdate).format('DD MMM YYYY')
  }

  

  gotoDebitPage() {
    this.debitPageOpened = true
    this.openReward = true;
    this.reward = {
      Comment: "",
      Point: 0,
      Amount: 0,
      Type: 0
    }
  }




  callRewardPointApi() {
    if (this.reward.Type && this.reward.Point) {
      this.commonService.commonAlter('Reward Points', 'Are you sure ?', () => {
       this.commonService.showLoader("Please wait");
        this.rewardAPIData.TotalPoints = this.reward.Point
        this.rewardAPIData.ActualAmount = this.reward.Amount
        this.rewardAPIData.ClubKey = this.member.clubkey
        this.rewardAPIData.ParentClubKey = this.selectedParentClubKey
        this.rewardAPIData.MemberKeys = this.member.parentFirebaseKey
        this.rewardAPIData.Comments = this.reward.Comment
        this.rewardAPIData.TypeCode = this.reward.Type
        this.rewardAPIData.Transactionbykey = this.user.$key
        this.rewardAPIData.TransactionDate = new Date().toISOString()
        this.rewardAPIData.TypeName = this.TypeList.filter(type => type.Code == this.reward.Type)[0]['Name']
        this.rewardAPIData.PrimaryMemberKey = this.member.parentFirebaseKey
        if (this.user.RoleType == "2" && this.user.UserType == "2") {
          this.rewardAPIData.Transactionby = 'Admin'
        } else if (this.user.RoleType == "4" && this.user.UserType == "2") {
          this.rewardAPIData.Transactionby = 'Coach'
        }
        this.http.post(`${this.nestUrl}/loyalty/rewardpoints_v2`, this.rewardAPIData)
          .subscribe((res: any) => {
            this.commonService.hideLoader();
            if (res) {
              this.commonService.toastMessage('Loyalty Point Awarded Successfully', 2000)
              this.getLoyaltyBalance()
              this.getLoyaltyTransactionHistory()
              this.openReward = false
            }
          }, err => {
            this.commonService.hideLoader();
          })
      })
    } else if (!this.reward.Type) {
      this.commonService.toastMessage('Select Type', 2000, ToastMessageType.Error);
    } else if (!this.reward.Point) {
      this.commonService.toastMessage('Select Point', 2000, ToastMessageType.Error);
    }
  }

  getDisplayName(code) {
    return this.TypeList.filter(type => type.Code == +code)[0]['DisplayName']
  }

  getLoyaltyTransactionHistory() {
    // this.memberKey = '-MN2PHs_uXWut_HIIj34'
    this.http.get(`${this.nestUrl}/loyalty/transactions/${this.member.parentFirebaseKey}`).subscribe((res) => {
      if (res['data']) {
        this.transactionHistory = res['data']
      }
      },err => {

      })
  }
  getCashDate(date) {
    return moment.utc(date).local().format('DD-MMM-YYYY hh:mm a')
  }

  getLoyaltyBalance() {
    this.commonService.showLoader('Please wait');
    //this.memberKey = '-MN2PHs_uXWut_HIIj34'
    this.http.get(`${this.nestUrl}/loyalty/${this.member.parentFirebaseKey}`).subscribe((res) => {
      this.commonService.hideLoader();
      if (res['data']) {
        this.totalPointBalance = +res['data']['updatedBalance']
      }
    },
      err => {
        this.commonService.hideLoader()
        this.totalPointBalance = 0

        console.log("total balance for user:", this.totalPointBalance)
        // this.cashLastUpdated = "N/A"
      })
  }

  // getWalletBalance() {
  //   //  this.commonService.showLoader('Please wait');
  //   //this.memberKey = '-MN2PHs_uXWut_HIIj34'
  //   this.http.get(`http://localhost:3000/wallet/-LqfFPegGuLnezIQ_q5v`).subscribe((res) => {
  //     this.commonService.hideLoader();
  //     if (res['data']) {
  //       this.totalWalletBalance = +res['data']['updatedBalance']
  //     }
  //   },
  //     err => {
  //       //this.commonService.hideLoader()
  //       this.totalWalletBalance = 0

  //       console.log("total wallet balance for user:", this.totalWalletBalance)
  //       // this.cashLastUpdated = "N/A"
  //     })
  // }

  async checkWalletForUser() {
    try {
      const response = await this.http.get(`${this.nestUrl}/wallet/${this.member.parentFirebaseKey}`).toPromise();
      const data = response['data'];
      if (data) {
        // this.totalWalletBalance = +data.updatedBalance;
        this.totalWalletBalance = parseFloat(data.updatedBalance);
        this.totalWalletBalance = Number(this.totalWalletBalance.toFixed(2));
        this.checkWalletTransactionForUser();
      } else {
        this.totalWalletBalance = 0;
        this.commonService.toastMessage("Wallet not available for the user",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
      console.log("Total wallet balance for user:", this.totalWalletBalance);
    } catch (error) {
      this.totalWalletBalance = 0;
      //console.error("Error fetching wallet balance:", error);
      if(error.status === 404)this.commonService.toastMessage("Wallet not found for user",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }

  txHistoryForWallet: any[];
  async checkWalletTransactionForUser() {
    try {
      const response = await this.http.get(`${this.nestUrl}/wallet/transactions/${this.member.parentFirebaseKey}`).toPromise();
      const data = response['data'];
      if (Array.isArray(data)) {
        this.txHistoryForWallet = data; // Save the transaction data to the variable 'transaction'
        console.log("data of wallet transaction of users:", this.txHistoryForWallet)
        console.log("Number of transactions for user:", this.txHistoryForWallet.length);
      } else {
        console.error("Invalid response format: Expected an array");
      }
    } catch (error) {
      // Handle error gracefully
      console.error("Error fetching  user transaction:", error);
    }
  }


  callDebitPointApi() {
    if (!this.DebitChecked) {
      this.commonService.toastMessage('Select debit points', 2000, ToastMessageType.Error);
    } else if (this.debitText != 'DEBIT') {
      this.commonService.toastMessage("Type 'DEBIT' in the text box", 2000, ToastMessageType.Error);
    } else if (!this.reward.Type) {
      this.commonService.toastMessage('Select Type', 2000, ToastMessageType.Error);
    }
    else if (this.reward.Point > this.totalPointBalance) {
      this.commonService.toastMessage("Your total balance is " + this.totalPointBalance, 2000, ToastMessageType.Error);
    }
    else if (this.reward.Point) {
      this.commonService.showLoader("Please wait");
      this.rewardAPIData.TotalPoints = this.reward.Point
      this.rewardAPIData.ActualAmount = this.reward.Amount
      this.rewardAPIData.ClubKey = this.member.clubkey
      this.rewardAPIData.ParentClubKey = this.selectedParentClubKey
      this.rewardAPIData.MemberKeys = this.member.parentFirebaseKey
      this.rewardAPIData.Comments = this.reward.Comment
      this.rewardAPIData.TypeCode = this.reward.Type
      this.rewardAPIData.Transactionbykey = this.user.$key
      this.rewardAPIData.TransactionDate = new Date().toISOString()
      this.rewardAPIData.TypeName = this.TypeList.filter(type => type.Code == this.reward.Type)[0]['Name']
      this.rewardAPIData.PrimaryMemberKey = this.member.parentFirebaseKey
      if (this.user.RoleType == "2" && this.user.UserType == "2") {
        this.rewardAPIData.Transactionby = 'Admin'
      } else if (this.user.RoleType == "4" && this.user.UserType == "2") {
        this.rewardAPIData.Transactionby = 'Coach'
      }
      this.http.post(`${this.nestUrl}/loyalty/debitpoints`, this.rewardAPIData)
        .subscribe((res: any) => {
          this.commonService.hideLoader();
          if (res) {
            this.commonService.toastMessage('Loyalty Point Debited Successfully', 2000)
            this.getLoyaltyBalance()
            this.getLoyaltyTransactionHistory()
            this.openReward = false
          }
        }, err => {
          this.commonService.hideLoader();
        })

    } else if (!this.reward.Point) {
      this.commonService.toastMessage('Select Point', 2000, ToastMessageType.Error);
    }
  }

  // checkWalletForParentClub() {
  //   const url = `http://localhost:3000/wallet/checkwallet/${this.selectedParentClubKey}`;


  //   this.http.get<WalletApiResponse>(url).subscribe(
  //     (response) => {
  //       // this.walletExists = true;
  //       console.log('GET request successful for ', response);
  //       this.commonService.toastMessage(
  //         "Parentclub wallet fetched successfully",
  //         2500,
  //         ToastMessageType.Success,
  //         ToastPlacement.Bottom
  //       );
  //       // Assuming the response contains information about whether the wallet exists
  //       const walletExists = response?.walletExists;
  //       if (walletExists) {
  //         this.adjustCashPointsOpened = true;
  //       } else {
  //         this.commonService.toastMessage(
  //           'Wallet for parent club is not available',
  //           2500,
  //           ToastMessageType.Error,
  //           ToastPlacement.Bottom
  //         );
  //       }
  //       // this.checkWalletForMember();
  //     },
  //     (error) => {
  //       console.log('Error checking parent club wallet:', error);
  //       this.commonService.toastMessage(
  //         'Error checking parent club wallet',
  //         2500,
  //         ToastMessageType.Error,
  //         ToastPlacement.Bottom
  //       );
  //     }
  //   );
  // }

  // openAdjustCashPoints() {
  //   // Check if the wallet for the parent club exists before opening the Adjust Cash section
  //   this.checkWalletForParentClub();
  // }


  checkWalletForParentClub() {
    const url = `${this.nestUrl}/wallet/checkwallet/${this.selectedParentClubKey}`;
    this.http.get<WalletApiResponse>(url).subscribe(
      (response) => {
        console.log('GET request successful for ', response);
      },
      (error) => {
        console.log('Error checking parent club wallet:', error);
        this.commonService.toastMessage('Wallet is not available,Please enable wallet from setup',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    );
  }

  openAdjustCashPoints(totalWalletBalance: number) {
    console.log("Cash Point Page Opened");
    this.adjustCashPointsOpened = true;
    this.openReward = true;
    this.cash = {
      Available_Balance: totalWalletBalance,
      Debit_Amount: 0,
      Type: "",
      Comment: "",
      Debit_Cash: 0,
    };
  }

  checkWalletForMember() {
    const url = `${this.nestUrl}/wallet/${this.member.parentFirebaseKey}`
    this.http.get(url).subscribe(
      (response) => {
        //   this.walletExists = true;
      },
      (error) => {
        console.error(error);
      }
    );

  }


  callAdjustCashPoint() {
    if (!this.CashChecked) {
      this.commonService.toastMessage('Select debit amount', 2000, ToastMessageType.Error);
    } else if (this.confirmText != 'CONFIRM') {
      this.commonService.toastMessage("Type 'CONFIRM' in the text box", 2000, ToastMessageType.Error);
    } else if (!this.cash.Type) {
      this.commonService.toastMessage('Select Type', 2000, ToastMessageType.Error);
    } else if (this.cash.Debit_Amount > this.cash.Available_Balance) {
      this.commonService.toastMessage("Your debit amount cannot be more than available Balance ", 2000, ToastMessageType.Error);
    }
    else {
      this.commonService.showLoader("Please wait");
      this.ajdustCashInput.amount = String(this.cash.Debit_Amount);
      this.ajdustCashInput.source = (this.cash.Type);
      this.ajdustCashInput.memberId = this.member.parentFirebaseKey;
      this.ajdustCashInput.comments = this.cash.Comment;

      //Now after giving all relevant input,we are sending http post request
      this.http.post(`${this.nestUrl}/wallet/spendWalletPoints`, this.ajdustCashInput).subscribe(
        (response: any) => {
          this.commonService.hideLoader();
          if (response) {
            this.commonService.toastMessage('Wallet cash spent successfully', 2500);
            
            this.checkWalletForUser();
            this.openReward = false
            console.log('Response:', response);
          }
        },
        (error) => {
          this.commonService.hideLoader();
          console.error('Error:', error);
          this.commonService.toastMessage('Wallet cash spent failed', 2500);
        }
      );
    }
  }

  intializeCash(){
    this.adjustCashPointsOpened = false;
    this.openReward = false;
    this.cash = {
      Available_Balance: 0,
      Debit_Amount: 0,
      Type: "",
      Comment: "",
      Debit_Cash: 0,
    };
  }

  getTransactionIcon(transactionType: number): string {
    return transactionType === 2 ? 'assets/imgs/premium.svg' : 'assets/imgs/redeem-points.svg';
  }

  getTransactionType(transactionType: number): string {
    return transactionType === 2 ? 'Reward' : 'Redeem';
  }





}

interface WalletApiResponse {
  walletExists: boolean;
  // Add other properties if needed
}


