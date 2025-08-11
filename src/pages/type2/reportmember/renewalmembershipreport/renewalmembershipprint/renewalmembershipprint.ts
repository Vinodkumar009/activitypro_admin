// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../../../services/firebase.service';
import { Component } from '@angular/core';
import { ToastController, NavParams, NavController, PopoverController, LoadingController, ActionSheetController } from 'ionic-angular';
import { SharedServices } from '../../../../services/sharedservice';
import { CommonService } from '../../../../../services/common.service';

// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
// import { Type2ChoiceProperty } from './choiceproperty';
import * as $ from 'jquery';


import { IonicPage } from 'ionic-angular';
import { relativeTimeThreshold } from 'moment';
@IonicPage()
@Component({
  selector: 'renewalmembershipprint-page',
  templateUrl: 'renewalmembershipprint.html'
})

export class RenewalMembershipPrintPage {
  TotalSetup: any[];
  theNoOfDaysRemaining: number;
  showMembershipRenewalModal: boolean;
  renewalArr = [];
  loading: any;
  activeMembeships: any[];
  ParentClubKey: any;
  themeType: number;
  Venues: any[];
  ClubName: any;
  parentClubImage: any;
  parentClubName: any;
  parentClubMail: any;
  userObj: any = "";
  desireparentMembersArr: any;
  deviceTokens=[];
  message: any;

  constructor(public toastCtrl: ToastController, public commonService: CommonService, public loadingCtrl: LoadingController, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.themeType = sharedservice.getThemeType();
    this.renewalArr = navParams.get("renewalArr")
    this.ClubName = navParams.get("ClubName")
    this.renewalArr.forEach(eachrenew => {
      eachrenew.IsSelect = false;
    })
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.userObj = val;
        this.getParentClubDetails();
        this.getDeviceTokenOfCoachAndAdmin()
        //this.getShowMembership()
        //this.getAllVenue(this.ParentClubKey)

      }
      //this.loading.dismiss().catch(() => { });
    })
  }


  makeAllTrue() {
    this.renewalArr.forEach(eachrenew => {
      eachrenew.IsSelect = !eachrenew.IsSelect;
    })
  }
  getAge(info) {
    if (info != undefined && info != '') {
      let year = info.split("-")[0];
      let currentYear = new Date().getFullYear();
      return (Number(currentYear) - Number(year));
    } else {
      return 'N.A'
    }
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getParentClubDetails() {
    this.fb.getAll("/ParentClub/Type2/").subscribe((data) => {
      if (data.length > 0) {
        let allParentClubs = data;
        for (let i = 0; i < allParentClubs.length; i++) {
          if (allParentClubs[i].$key == this.ParentClubKey) {
            this.parentClubImage = allParentClubs[i].ParentClubAppIconURL;
            this.parentClubName = allParentClubs[i].ParentClubName;
            this.parentClubMail = allParentClubs[i].ParentClubAdminEmailID;
            break;
          }
        }
        //this.parentClubImage = '<img src="' +this.parentClubImage+ '">';
        //this.parentClubImage = '<img src="https://www.tennislinq.com/data/user/club/140tennisclub.jpg">';

      }
    });
  }
  getDeviceTokenOfCoachAndAdmin(){
    this.deviceTokens = []
      this.fb.getAllWithQuery("/DeviceToken/ParentClub/" + this.ParentClubKey, { orderByKey: true }).subscribe((AdminTokenResponse) => {
        AdminTokenResponse.forEach(token=>{
         this.deviceTokens.push({ MobileDeviceId: token.DeviceToken, ConsumerID: "", PlatformArn: "" });
        })
      });
    
  }
  sendMailToParentClub() {
    let sentEmailAddresss = ""
    this.message = ''
    let index =0;
    this.desireparentMembersArr = []
    if (this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8) {
      sentEmailAddresss = this.userObj.EmailID;
    } else {
      sentEmailAddresss = this.parentClubMail;
    }
    let emailObj = {
      IsFirstName: true,
      IsLastName: true,
      IsPhone: false,
      IsEmailId: true,
      IsAge: true,
      ParentClubName: this.parentClubName,
      ParentClubEmail: sentEmailAddresss,
      //ParentClubEmail: "barun.mishra@kare4u.in",
      ImagePath: this.parentClubImage,
      ClubName: this.ClubName,
      Members: []
    }

    let selectedRenewArr = this.renewalArr.filter(renew => { return renew.IsSelect })
  
    selectedRenewArr.forEach(eachrenew => {
      
      //let preparedMemberObj = { FirstName: '', LastName: '', EmailId: '', Age: '', NoOfDaysLeft:'', MembershipName:'' };
      let preparedMemberObj = { FirstName: '', LastName: '', EmailId: '', Age: '' };
      eachrenew.FirstName = eachrenew.DisplayName.split(" ")[0]
      eachrenew.LastName = eachrenew.DisplayName.split("  ")[1]
      preparedMemberObj.FirstName = eachrenew.FirstName;
      preparedMemberObj.LastName = eachrenew.LastName;
      preparedMemberObj.EmailId = eachrenew.EmailID;
      // preparedMemberObj.MembershipName = eachrenew.Name;

      // preparedMemberObj.NoOfDaysLeft = eachrenew.NoOfDaysLeft;
      preparedMemberObj.Age = <string>this.getAge(eachrenew.DOB);
      this.desireparentMembersArr.push(preparedMemberObj);
      this.message = this.message+`<p> ${index++} : ${eachrenew.DisplayName} has ${eachrenew.NoOfDaysLeft} days left for expriry of ${eachrenew.Name}. </p>`
     
    })
    emailObj.Members = this.desireparentMembersArr;

    console.log(this.message)
    this.presentActionSheet(emailObj);
  }
  presentActionSheet(obj) {

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Send Report',
      buttons: [
        {
          text: 'PDF',
          handler: () => {
            this.sendPDF(obj)
          }
        }, {
          text: 'Excel',
          handler: async () => {
            try {
              let res = await this.sendXLS(obj);
              let message = "Email sent successfully...";
              this.showToast(message, 5000);
            } catch (err) {
              this.showToast('Failed to send email,please try again.', 3000);
            }
          }

        },
        {
          text: 'Notification',
          handler: async () => {
            try {
              let res = await this.SendNotification(this.message);
              let message = "Notification sent successfully...";
              this.showToast(message, 5000);
            } catch (err) {
              this.showToast('Failed to send notification,please try again.', 3000);
            }
          }

        },

        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }
  sendPDF(emailObj) {
    let url = this.sharedservice.getEmailUrl();
    $.ajax({
      url: url+"umbraco/surface/ActivityProSurface/CreatePdf/",
      //url: "http://54.225.106.22:8081/umbraco/surface/ActivityProSurface/CreatePdf/",
      data: emailObj,
      type: "POST",
      success: function (response) {
      }, error: function (error, xhr) {
      }
    });
    let message = "Email sent successfulllly...";
    this.showToast(message, 3000);
    //this.navCtrl.push("Type2ReportMember");
  }

  SendNotification(message) {
    let url = this.sharedservice.getEmailUrl();
    return new Promise(async(res, rej)=>{
      try{$.ajax({
        url: "http://54.225.106.22:8081/umbraco/surface/ActivityProSurface/CreatePlatformEndpointAndPushNotification/",
       // url: url + "umbraco/surface/ActivityProSurface/CreatePlatformEndpointAndPushNotification/",
        data: {
          MembersTokenDetails: this.deviceTokens,
          Message: message,
          Subject: "Pending Membership Renewal List",
          ParentclubKey: this.ParentClubKey
        },
        type: "POST",
        success: function (response) {
          res(response)
        }, error: function (error, xhr) {
          rej(error);
        }
      });
    }
      catch(err){
        rej(err)
      }
    }) 
  }

  sendXLS(emailObj) {
    return new Promise(async (res, rej) => {
      try {
        let sentObj = {
          toAddress: emailObj.ParentClubEmail,
         // toAddress: "hemanjanarahi97@gmail.com",
          fromAddress: 'activitypro17@gmail.com',
          ccAddress: '',
          bccAddress: '',
          attachmentType: 'XLS',
          attachmentName: `Member_report@${this.ClubName + new Date().getTime()}`,
          attachmentData: emailObj.Members,
          aplicationType: 'Activitypro',
          subject: `Member Report of ${this.ClubName}`,
          msgBody: `<p> Hello ${this.ClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
        }
        $.ajax({
          url: `${this.sharedservice.getnestURL()}/superadmin/attachmentemail`,
          data: sentObj,
          type: "POST",
          success: function (response) {
            res(response)
          }, error: function (error, xhr) {
            rej(error);
          }
        });
        this.navCtrl.pop()
      } catch (err) {
        rej(err)
      }
    })

  }

  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: 'bottom'
    });
    toast.present();
  }
}




