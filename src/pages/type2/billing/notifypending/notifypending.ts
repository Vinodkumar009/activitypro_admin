


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
  selector: 'notifypending-page',
  templateUrl: 'notifypending.html',
  providers: [FirebaseService, CommonService]
})
export class NotifyPendingPage {


  memberList = [];
  parentClubKey = "";
  sessionDetails: any;
  selectedClub = "";
  clubDetails: any;
  parentClubDetails: any;
  emailObj = {
    Message: "Your payment is due. Please pay",
    Subject: "Payment Reminder"
  }
  // numberOfPeople = "0 People";

  tournament: any;
  parentClubName: any;
  MemberSpecific: any;
  pendingMembers: any;
  members = [];
  ClubKey: any;
  deviceTokens: any;
  currencyDetails: any;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController,
    private toastCtrl: ToastController, public sharedservice: SharedServices,
    public storage: Storage, public commonService: CommonService,
    public fb: FirebaseService, public platform: Platform, public params: NavParams,
    public viewCtrl: ViewController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.parentClubName = val.Name;
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.pendingMembers = this.params.get("PendingMembers");
      this.ClubKey = this.params.get("ClubKey");
    }).then(data => {
      this.getParentClubDets();
      // if (this.tournamentKey && this.parentClubKey) {
      this.getParentEmailId(this.pendingMembers)
      // }
    })
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })

    this.MemberSpecific = this.params.get('Member')

    console.log(this.MemberSpecific)
  }

  getParentClubDets(){
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubDetails = data[0];
    });
  }

  getParentEmailId(pendingMember): any {
    this.members = []
    pendingMember.forEach(member => {
      if(member.IsChild){
        this.fb.getAllWithQuery("Member/" + this.parentClubKey + "/" + this.ClubKey, { orderByKey: true, equalTo: member.ParentKey })
        .subscribe(data => {
          member['Data']= moment(member.BillDate).format('DD MMM')
          if (data.length > 0) {
            this.members.push({
              MemberEmail: data[0].EmailID,
              MemberName: member.MemberName,
              data:member
            });
            // return data[0].EmailID;
          }
        })
      }else{
        this.fb.getAllWithQuery("Member/" + this.parentClubKey + "/" + this.ClubKey, { orderByKey: true, equalTo: member.MemberKey })
        .subscribe(data => {
          member['Data']= moment(member.BillDate).format('DD MMM')
          if (data.length > 0) {
            this.members.push({
              MemberEmail: data[0].EmailID,
              MemberName: member.MemberName,
              data:member
            });
            // return data[0].EmailID;
          }
        })
      }
   
    });


  }
  dismiss() {
    this.navCtrl.pop()
  }
  sendEmailToMembers() {
   
    this.members.forEach(element => {
      element.message="Hi, "+element.data.MemberName+" your Purchase of "+element.data.SelectedBillType+" , Quantity of "+element.data.Quantity+" , charged of currency details "+element.data.TotalAmount+" on "+element.data.Date+" is pending "
      element.Subject = "New Bill For "+element.data.SelectedBillType
      this.sendEmails(element);
    });
  }
  sendEmails(member) {
    let emailObj = {
      CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
      CCName: this.parentClubName,
      FromEmail: "activitypro17@gmail.com",
      FromName: this.parentClubName,
      ImagePath: "https://firebasestorage.googleapis.com/v0/b/timekare-app.appspot.com/o/aboutus.png?alt=media&token=b196caf2-fda8-4aa7-864e-382e5ead397a",
      Members: member,
      Message: member.message,
      Subject: member.Subject,
      ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
      ToName: this.parentClubName,
    }


    let url = this.sharedservice.getEmailUrl();
    $.ajax({
      url: `${this.sharedservice.getnestURL()}/messeging/notificationemail`,
      data: emailObj,

      type: "POST",
      success: function (respnse) {
      },
      error: function (xhr, status) {
        console.log(xhr, status)
      }
    });
    this.showToast("Mail sent successfully", 5000);
    this.navCtrl.pop();


  }

  getDeviceTokens(pendingMember) {
    
    pendingMember.forEach(member => {
      this.deviceTokens=[]
      if(member.IsChild){
        this.fb.getAllWithQuery("/DeviceToken/Member/" + this.parentClubKey + "/" + this.ClubKey,
        { orderByKey: true, equalTo:member.ParentKey })
        .subscribe((data) => {
          if (data.length > 0) {
            console.log(data)
            data.forEach(eachMember => {
              this.commonService.convertFbObjectToArray(eachMember.Token)
                .forEach(eachDevice => {
                  this.deviceTokens.push({ MobileDeviceId: eachDevice.DeviceToken, ConsumerID: "", PlatformArn: "" });
                })
            })
            this.notifyNotification(this.deviceTokens,member)
          }
        });
      }else{
        this.fb.getAllWithQuery("/DeviceToken/Member/" + this.parentClubKey + "/" + this.ClubKey,
        { orderByKey: true, equalTo:member.MemberKey })
        .subscribe((data) => {
          if (data.length > 0) {
            console.log(data)
            data.forEach(eachMember => {
              this.commonService.convertFbObjectToArray(eachMember.Token)
                .forEach(eachDevice => {
                  this.deviceTokens.push({ MobileDeviceId: eachDevice.DeviceToken, ConsumerID: "", PlatformArn: "" });
                })
            })
            this.notifyNotification(this.deviceTokens,member)
          }
        });
      }
   
    });
  
 }

 notifyNotification(deviceTokens,member) { 
   let url = this.sharedservice.getEmailUrl();
   let pKey = this.sharedservice.getParentclubKey();
   let message = "Please pay for your recent purchase  for " +this.currencyDetails.CurrencySymbol+member.TotalAmount +" is pending";
   ;
   this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: this.parentClubKey });

   console.log({ URL: url, DeviceTokens: deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });
 }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }

}