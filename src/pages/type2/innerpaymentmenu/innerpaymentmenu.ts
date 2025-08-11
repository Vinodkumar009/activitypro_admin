// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, Platform, LoadingController, AlertController  } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';

// import { PaymentDetails } from './paymentdetails';

import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'innerpaymentmenu-page',
  templateUrl: 'innerpaymentmenu.html'
})

export class InnerPaymentMenu {
  currentFinacialYearTermList= [];
  financialYear1Key: any;
  financialYear1: any;
  termKey = "";
  themeType: number;
  isAndroid: boolean = false;

  reportType = "Overall";
  loading: any;
  coachKey: any;
  parentClubKey: any;

  obj = {
    Message: ''
  }
  sessionFolder = [];
  clubs = [];
  selectedClub = "";
  selectedCurrentClub = "";
  coaches = [];
  selectedCoach = "";
  selectedCurrentCoach = "";
  memberList = [];
  sessionDetails = [];
  sessionDetailsCurrentTerm = [];
  amountPaid = "0.00";
  amountDue = "0.00";
  currentAmountPaid = "0.00";
  currentAmountDue = "0.00";
  duecount: number;
  paidcount: number;
  sessionImgurl="";
  membershipImgurl:string="";

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, platform: Platform, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.sessionImgurl="https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fgroupsession.svg?alt=media&token=1f19b4aa-5051-4131-918d-4fa17091a7f9";
    this.membershipImgurl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fmembership.svg?alt=media&token=824fa9dd-a964-4eb9-a8f3-7ab8864c0a48";
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }

    })

  }
  goTo(obj) {
    if (obj.component != "Setup") {
      this.navCtrl.push(obj.component);
    } else {
      this.navCtrl.push("Setup");
    }
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  gotoSessionPayment(){
    this.navCtrl.push("Payment");
  }
  gotoHolidayCampPayment(){
    this.navCtrl.push("HolidaycamppaymentreportPage");
  }
	goToSchoolsessionPaymentDetails(){
		this.navCtrl.push("SchoolpaymentreportPage",{
      parentClubKey:this.parentClubKey
    });
  }
  gotoWalletPayment(){
    this.navCtrl.push("CashWalletReport")
  }
  gotoCourtBookingPayment(){
    this.navCtrl.push("FacilityReportPage");
  }
  gotoMembershipPayment(){
    //this.showAlert("Membership"); 
    this.navCtrl.push("MembershipreportPage");
  }

  gotokidssubscriptions(){
    this.navCtrl.push("Apkidsubscriptions");
  }

  showAlert(text:string) {
    const alert = this.alertCtrl.create({
      title: text,
      subTitle: 'Coming Soon!',
      buttons: ['OK']
    });
    alert.present();
  }

}