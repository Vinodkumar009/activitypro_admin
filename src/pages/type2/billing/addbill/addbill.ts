


import { Storage } from '@ionic/storage';
// import { Platform, NavParams, ViewController } from "ionic-angular";
import { IonicPage, ToastController, AlertController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ModalController, ViewController, Platform, NavParams } from 'ionic-angular';
import * as $ from 'jquery';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'addbill-page',
  templateUrl: 'addbill.html',
  providers: [FirebaseService, CommonService]
})
export class AddBillingPage {


  parentClubKey = "";
  parentClubName: any;
  selectedClubKey: any;
  Venues = [];
  currencyDetails: any;
  clubKey: any;
  selectedVenue: any;
  selectedActivityKey: any;
  Activities: any[];
  bill = {
    Key: '',
    BillDate:moment().format('YYYY-MM-DD'),
    SelectedBillType: '',
    BillAmount: '',
    DiscountAmount: '',
    Quantity: 1,
    Comments: '',
    ActivityKey: '',
    MemberName: '',
    MemberKey: '',
    ParentKey: '',
    IsChild: false,
    IsActive: true,
    IsPaid: 'Due',
    TotalAmount: ''
  };
  allMemebers = [];
  members = [];
  memberDisplay = [];
  existingMembers = [];
  membersArr = [];
  selectedMembers: any;
  billing = 'firstpage';
  selectedMember = '';
  sendNotification = false;
  sendEmail = true;
  deviceTokens = [];
  selectedClub: any;
  membersEmail: any;
  dataExixsts = false;
  parentClubDetails:any;
  today = moment().format('YYYY-MM-DD');
  constructor(public navCtrl: NavController, public alertCtrl: AlertController,
    private toastCtrl: ToastController, public sharedservice: SharedServices,
    public storage: Storage, public commonService: CommonService,
    public fb: FirebaseService, public platform: Platform, public navParams: NavParams,
    public viewCtrl: ViewController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.parentClubName = val.Name;
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getAllVenue(this.parentClubKey)
      }
    }).then(data => {
      this.getParentClubDets();
      this.clubKey = this.navParams.get("ClubKey")
      if (this.navParams.get("Bill")) {
        this.dataExixsts = true;
        this.billing = 'secondpage'
        this.bill = this.navParams.get("Bill")
      }
      this.selectVenue(this.clubKey)
    })
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })

    console.log(this.parentClubName, this.parentClubKey, this.clubKey)
  }

  getParentClubDets(){
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubDetails = data[0];
    });
  }
  getAllVenue(ParentClubKey) {
    this.Venues = [];
    this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {
          this.Venues.push(data[i]);
        }
      }
      console.log(this.Venues);
    });
  }
  getAllActivity(clubKey) {
    this.fb.getAllWithQuery("Activity/" + this.parentClubKey + "/" + clubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      this.Activities = [];
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {
          this.Activities.push(data[i]);
          // this.selectedActivityKey = data[i].$key
          this.bill.ActivityKey = data[i].$key
        }
      }
      console.log(this.Venues);
    });
  }
  selectVenue(event) {
    this.selectedClubKey = event;
    this.Venues.forEach(element => {
      if (element.$key == this.selectedClubKey)
        this.selectedClub = element.ClubName
    });
    this.getAllActivity(this.selectedClubKey)
    this.getMemberLists(this.selectedClubKey)
  }
  selectActivity(event) {
    // this.selectedActivityKey = event;
    this.bill.ActivityKey = event;
    console.log(this.selectedClubKey)
  }
  updatePayable() {
    this.bill.BillAmount = parseFloat( this.bill.BillAmount).toFixed(2)
    if(this.bill.DiscountAmount == "NaN"){
      this.bill.DiscountAmount = "0"
    }
    this.bill.DiscountAmount = parseFloat( this.bill.DiscountAmount).toFixed(2)
    if (this.bill.BillAmount != '' && this.bill.DiscountAmount != '')
      this.bill.TotalAmount = ((parseFloat( this.bill.BillAmount) * this.bill.Quantity) - parseFloat( this.bill.DiscountAmount)).toFixed(2)
  }
  getMemberLists(selectedClubKey) {
    this.members = [];
    this.memberDisplay = [];
    this.existingMembers = [];


    this.fb.getAll("/Member/" + this.parentClubKey + "/" + selectedClubKey).subscribe((data) => {
      if (data.length > 0) {

        //    this.members = data;
        for (let i = 0; i < data.length; i++) {
          let temp = this.membersArr.find(actmbr => actmbr.Key == data[i].$key)
          if (temp === undefined) {
            if (data[i].FirstName != undefined) {
              let age = (new Date().getFullYear() - new Date(data[i].DOB).getFullYear());
              if (isNaN(age)) {
                data[i].Age = "N.A";
              } else {
                data[i].Age = age;
              }
              data[i].DisplayName = data[i].FirstName + " " + data[i].LastName;
              if (data[i].CreateDate) {
                let date = new Date(parseInt(data[i].CreateDate, 10));
                data[i].DOJ = moment(date).format("YYYY-MM");
                // data[i].dateofJ=moment(Doj).format("YYYY-MM")
              }

              this.memberDisplay.push(data[i]);
              this.members.push(data[i]);

            }
          } else {
            this.existingMembers.push(data[i])
          }
        }

        this.allMemebers = this.members;
      }
    });

  }
  selecteMembers(member) {
    if (!member.isSelect) {
      this.selectedMembers.push(member)
    } else {
      this.selectedMembers = this.selectedMembers.filter(item => item.$key !== member.$key)
    }
    console.log(this.selectedMembers, 'GroupKey ')
  }
  getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.memberDisplay = this.members.filter((item) => {
        if (item.DisplayName != undefined) {
          return (item.DisplayName.toLowerCase().indexOf(val.toLowerCase()) > -1);
          //return item;
        }
      })
    }
  }

  initializeItems() {
    this.members = this.allMemebers;
  }
  selectMembers(member) {
    // this.selectedMember = member.DisplayName
    this.bill.MemberKey = member.$key
    this.bill.MemberName = member.DisplayName
    if (member.IsChild) {
      this.bill.IsChild = true
      this.bill.ParentKey = member.ParentKey
    }
  }
  next() {
    if (this.bill.MemberKey != '') {
      this.billing = 'secondpage'
    } else {
      this.presentToast('Please Choose a Member');
    }
  }
  back() {
    this.billing = 'firstpage'
  }
  createBill() {
    if (this.validate()) {
      console.log(this.bill, this.selectedMember)
      if (this.dataExixsts) {
        let billKey = this.bill.Key
        delete this.bill.Key
        this.fb.update(billKey, "Billing/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.bill.MemberKey, { IsPaid: 'Paid' });
        this.presentToast('Bill Updated for ' + this.bill.MemberName);
        this.navCtrl.pop()

      } else {
        delete this.bill.Key
        if (this.bill.IsChild) {
          this.fb.saveReturningKey("Billing/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.bill.ParentKey + "/", this.bill);
        } else {
          this.fb.saveReturningKey("Billing/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.bill.MemberKey + "/", this.bill);
        }

        this.presentToast('Bill Generated for ' + this.bill.MemberName);
        console.log(this.bill)
        this.navCtrl.pop()
      }


      if (this.sendEmail) {
        this.notifyEmail()
      }
      if (this.sendNotification) {
        this.getDeviceTokens()
      }
    }
  }
  changeNotification() {
    this.sendNotification = !this.sendNotification
  }
  changeEmail() {
    this.sendEmail = !this.sendEmail
  }
  validate(): boolean {
    if (this.bill == undefined) {
      this.presentToast('Enter Bill Details');
      return false;

    } else if (this.bill.BillDate == "" || this.bill.BillDate == undefined) {
      this.presentToast('Enter Date');
      return false;
    } else if (this.bill.SelectedBillType == "" || this.bill.SelectedBillType == undefined) {
      this.presentToast('Enter Type');
      return false;
    } else if (this.bill.BillAmount == "" || this.bill.BillAmount == undefined || this.bill.BillAmount == '0') {
      this.presentToast('Enter Amount');
      return false;
    } else {
      return true;
    }
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }

  notifyEmail() {
    this.membersEmail = []
    this.fb.getAllWithQuery("Member/" + this.parentClubKey + "/" + this.selectedClubKey, { orderByKey: true, equalTo: this.bill.MemberKey })
      .subscribe(data => {
        if (data.length > 0) {
          this.membersEmail.push({
            MemberEmail: data[0].EmailID,
            MemberName: this.bill.MemberName,
          });
          // return data[0].EmailID;
        }
      })
  }
  sendEmails(member) {
    let Datex = moment(this.bill.BillDate).format('DD MMM')
    let emailObj = {
      CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
      CCName: this.parentClubName,
      FromEmail: "activitypro17@gmail.com",
      FromName: this.parentClubName,
      ImagePath: "https://firebasestorage.googleapis.com/v0/b/timekare-app.appspot.com/o/aboutus.png?alt=media&token=b196caf2-fda8-4aa7-864e-382e5ead397a",
      Members: this.membersEmail,
      Message: "Hi, " + this.bill.MemberName + " your Purchase of " + this.bill.SelectedBillType + " , Quantity of " + this.bill.Quantity + " , charged of currency details " + this.bill.TotalAmount + " on " + Datex + " is pending. ",

      Subject: "New Bill for "+ this.bill.SelectedBillType,
      ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
      ToName: this.parentClubName,
    }


    let url = this.sharedservice.getEmailUrl();
    $.ajax({
      //url + "umbraco/surface/ActivityProSurface/SendEmailNotification/"
      url: `${this.sharedservice.getnestURL()}/messeging/notificationemail`,
      data: emailObj,

      type: "POST",
      success: function (respnse) {
      },
      error: function (xhr, status) {
        console.log(xhr, status)
      }
    });
  }
  getDeviceTokens() {
    this.deviceTokens = []
    this.fb.getAllWithQuery("/DeviceToken/Member/" + this.parentClubKey + "/" + this.selectedClubKey,
      { orderByKey: true, equalTo: this.bill.MemberKey })
      .subscribe((data) => {
        if (data.length > 0) {
          console.log(data)
          data.forEach(eachMember => {
            this.commonService.convertFbObjectToArray(eachMember.Token)
              .forEach(eachDevice => {
                this.deviceTokens.push({ MobileDeviceId: eachDevice.DeviceToken, ConsumerID: "", PlatformArn: "" });
              })
          })
          this.notifyNotification()
        }
      });
  }

  notifyNotification() {
    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = "Please pay for your recent purchase at " + this.selectedClub + " for " + this.currencyDetails.CurrencySymbol + this.bill.TotalAmount;
    ;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });

    console.log({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });
  }
}