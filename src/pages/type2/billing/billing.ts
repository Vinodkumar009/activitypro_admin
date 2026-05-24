


import { Storage } from '@ionic/storage';
// import { Platform, NavParams, ViewController } from "ionic-angular";
import { IonicPage, ToastController, AlertController, NavController, ActionSheetController ,FabContainer} from 'ionic-angular';
import { Component,ViewChild } from '@angular/core';
import { ModalController, ViewController, Platform, NavParams } from 'ionic-angular';
import * as $ from 'jquery';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import * as moment from 'moment';
@IonicPage()
@Component({
  selector: 'billing-page',
  templateUrl: 'billing.html',
  providers: [FirebaseService, CommonService]
})
export class BillingPage {
  @ViewChild('fab')fab : FabContainer;
  ActiveBills = 'Active'

  parentClubKey = "";
  parentClubName: any;
  selectedClubKey: any;
  Venues = [];
  currencyDetails: any;
  currentBills = [];
  pastBills = [];

  totalPastAmount = 0;
  duePastAmount = 0;
  totalCurrentAmount = 0;
  dueCurrentAmount = 0;
  pendingAmountMembers = [];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController,
    private toastCtrl: ToastController, public sharedservice: SharedServices,
    public storage: Storage, public commonService: CommonService,
    public fb: FirebaseService, public platform: Platform, public params: NavParams,
    public actionSheetCtrl: ActionSheetController,
    public viewCtrl: ViewController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.parentClubName = val.Name;
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getAllVenue(this.parentClubKey)
      }
    })
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })
    console.log(this.parentClubName, this.parentClubKey)
  }
  getAllVenue(ParentClubKey) {
    this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      this.Venues = [];
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {
          this.Venues.push(data[i]);
          this.selectedClubKey = data[i].$key
        }
      }
      this.getAllBills()
      console.log(this.Venues);
    });
  }

  ionViewDidEnter() {
    this.fab.close();
    this.getAllVenue(this.parentClubKey)
  }


  getAllBills() {

    // this.Venues.forEach(eachClub => {
    this.fb.getAll("Billing/" + this.parentClubKey + "/" + this.selectedClubKey + "/")
      .subscribe((data) => {
        this.currentBills = []
        this.pastBills = []
        this.pendingAmountMembers = []
        this.totalPastAmount = 0;
        this.duePastAmount = 0;
        this.totalCurrentAmount = 0;
        this.dueCurrentAmount = 0;
        data.forEach(eachMember => {
          this.commonService.convertFbObjectToArray(eachMember)
            .forEach(eachBill => {
              if (eachBill.IsActive) {
                if (eachBill.IsPaid == 'Due') {
                  this.pendingAmountMembers.push(eachBill)
                }
                if (this.currentMonth(eachBill)) {
                  this.currentBills.push(eachBill)
                } else {
                  this.pastBills.push(eachBill)
                }
              }
            })
        });
      });
    // });
  }


  currentMonth(eachBill): boolean {
    let billdate = moment(eachBill.BillDate).format("YYYY-MM")
    let thisMonth = moment().format("YYYY-MM")
    if (billdate != thisMonth) {
      this.totalPastAmount = this.totalPastAmount + eachBill.TotalAmount
      if (eachBill.IsPaid != 'Paid')
        this.duePastAmount = this.duePastAmount + eachBill.TotalAmount

      return false;
    } else {
      this.totalCurrentAmount = this.totalCurrentAmount + eachBill.TotalAmount
      if (eachBill.IsPaid != 'Paid')
        this.dueCurrentAmount = this.dueCurrentAmount + eachBill.TotalAmount
      return true;
    }
  }
  showOptions(bill) {
    let actionSheet;
    if (bill.IsPaid === 'Due') {
      actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'Update',
            icon: this.platform.is('android') ? 'ios-create-outline' : '',
            handler: () => {
              this.updateBill(bill);
            }
          }, {
            text: 'Delete',
            cssClass: 'dangerRed',
            icon: this.platform.is('android') ? 'trash' : '',
            handler: () => {
              let delalert = this.alertCtrl.create({
                title:"Delete Bill",
                message: ' Are you sure to delete this Bill ?',
                buttons: [
                  {
                    text: "No",
                    role: 'cancel'
                  },
                  {
                    text: 'Yes',
                    handler: data => {
                      this.deleteBill(bill)
                    }
                  }
                ]
              });
              delalert.present();
            }
          }
        ]
      });
      actionSheet.present();
    } else if (bill.IsPaid == 'Pending Verification') {
      actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'Update Bill',
            icon: this.platform.is('android') ? 'ios-create-outline' : '',
            handler: () => {
              this.updateBill(bill);
            }
          }, {
            text: 'Update Payment Status',
            icon: this.platform.is('android') ? 'ios-create-outline' : '',
            handler: () => {
              this.updatePaymentStatus(bill);
            }
          }, {
            text: 'Delete Bill',
            cssClass: 'dangerRed',
            icon: this.platform.is('android') ? 'trash' : '',
            handler: () => {
              let delalert = this.alertCtrl.create({
                title:"Delete Bill",
                message: ' Are you sure to delete this Bill ?',
                buttons: [
                  {
                    text: "No",
                    role: 'cancel'
                  },
                  {
                    text: 'Yes',
                    handler: data => {
                      this.deleteBill(bill)
                    }
                  }
                ]
              });
              delalert.present();
            }
          }
        ]
      });
      actionSheet.present();
    }
  }
  updatePaymentStatus(bill: any): any {
    if (bill.IsPaid === 'Pending Verification') {
      let paidAlert = this.alertCtrl.create({
        title: 'Update Payment Status',
        message: ' Are you sure to Update bill status to paid ?',
        buttons: [
          {
            text: "No",
            role: 'cancel'
          },
          {
            text: 'Yes',
            handler: data => {
              this.markAsPaid(bill)
            }
          }
        ]
      });
      paidAlert.present();;
    }
  }
  markAsPaid(bill) {
    this.fb.update(bill.Key, "Billing/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + bill.MemberKey, { IsPaid: 'Paid' });
    this.presentToast(bill.MemberName + "'s bill is marked as paid");
  }
  deleteBill(bill) {
    this.fb.update(bill.Key, "Billing/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + bill.MemberKey, { IsActive: false });
    this.presentToast('Bill successfully deleted');
    console.log(bill)
    //this.getAllVenue(this.parentClubKey)

  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  addBill() {
    this.navCtrl.push("AddBillingPage", { ClubKey: this.selectedClubKey })
  }
  updateBill(bill){
    this.navCtrl.push("AddBillingPage", { ClubKey: this.selectedClubKey, Bill:bill})
  }
  notifyPending() {
    this.navCtrl.push("NotifyPendingPage", { PendingMembers: this.pendingAmountMembers, ClubKey: this.selectedClubKey })
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}