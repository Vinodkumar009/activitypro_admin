import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastController } from 'ionic-angular';
// import { Dashboard } from './../../dashboard/dashboard';



import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'updatepaymentdetailsforgroupcoach-page',
  templateUrl: 'updatepaymentdetailsforgroupcoach.html'
})

export class CoachPaymentDetailsForGroup {
  parentClubKey: any;
  themeType: number;
  selectedMemberDetails: any;
  selectedSessionDetails: any;

  paymentDetails = {
    PaymentAmount: '',
    PaymentMode: '',
    PaymentStatus: '',
    Comments: ''
  }
  userData: any;

  constructor(private toastCtrl: ToastController, public alertCtrl: AlertController, public navParams: NavParams, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();

    this.selectedMemberDetails = navParams.get('SelectedMember');
    this.selectedSessionDetails = navParams.get('SessionDetails');

    this.paymentDetails.PaymentAmount = this.selectedMemberDetails.TotalFeesAmount;
    this.paymentDetails.PaymentMode = this.selectedMemberDetails.PaidBy;
    if (this.selectedMemberDetails.AmountPayStatus == "Due") {
      this.paymentDetails.PaymentStatus = "";
    }
    else if (this.selectedMemberDetails.AmountPayStatus == "Pending Verification") {
      this.paymentDetails.PaymentStatus = "Pending Verification";
    } else {
      this.paymentDetails.PaymentStatus = "Paid";
    }

    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
      // this.loading.dismiss().catch(() => { });
    })
  }

  cancel() {
    this.navCtrl.pop();
  }
 

  updatePaymentInfo() {
    let confirm = this.alertCtrl.create({
      title: 'Update Payment',
      message: 'Are you sure you want to update the payment details?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            //Are you sure you want to update the payment details?
            this.paymentDetails.PaymentAmount = parseFloat(this.paymentDetails.PaymentAmount).toFixed(2);
            let member = this.selectedMemberDetails;


            // console.log(this.paymentDetails);

            if (this.validateInput()) {
              if (this.paymentDetails.PaymentStatus == "") {
                //update data in session folder
                this.fb.update(member.Key, "/Session/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + this.selectedSessionDetails.CoachKey + "/" + this.selectedSessionDetails.SessionType + "/" + this.selectedSessionDetails.$key + "/Member/", { AmountDue: this.paymentDetails.PaymentAmount, TotalFeesAmount: this.paymentDetails.PaymentAmount, OtherComments: this.paymentDetails.Comments });
                //update data in coach folder

                this.fb.update(member.Key, "/Coach/Type2/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.CoachKey + "/Session/" + this.selectedSessionDetails.$key + "/Member/", { TotalFeesAmount: this.paymentDetails.PaymentAmount, AmountDue: this.paymentDetails.PaymentAmount, OtherComments: this.paymentDetails.Comments });

                //update data in member folder

                this.fb.update(this.selectedSessionDetails.$key, "/Member/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + member.Key + "/Session/", { SessionFee: this.paymentDetails.PaymentAmount, TotalFeesAmount: this.paymentDetails.PaymentAmount, AmountDue: this.paymentDetails.PaymentAmount, OtherComments: this.paymentDetails.Comments });


                // keep comments in folder
                // Comment during coach updating the cash payment
                this.fb.saveReturningKey("/Session/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + this.selectedSessionDetails.CoachKey + "/" + this.selectedSessionDetails.SessionType + "/" + this.selectedSessionDetails.$key + "/Member/" + member.Key + "/CommentsByAdmin/", { Comments: this.paymentDetails.Comments });

                this.fb.saveReturningKey("/Member/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + member.Key + "/Session/" + this.selectedSessionDetails.$key + "/CommentsByAdmin/",
                  { Comments: this.paymentDetails.Comments });

                this.fb.saveReturningKey("/Coach/Type2/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.CoachKey + "/Session/" + this.selectedSessionDetails.$key + "/Member/" + member.Key +
                  "/CommentsByAdmin/", { Comments: this.paymentDetails.Comments });

                let message = "Payment info has been updated successfully.";
                this.showToast(message, 8000);
                this.navCtrl.pop();
                this.navCtrl.pop();
              }
              else {
                if (this.paymentStatus()) {
                  //updating the PaymentGatewayInfo table 
                  //ispaid and TransactionNo updation
                  this.fb.update(member.TransactionNo, "/PaymentGatewayInfo/Session/", { IsPaid: true, TransactionNo: member.TransactionNo });
                  this.fb.getAll("/PaymentGatewayInfo/Session/" + member.TransactionNo + "/SessionDetails").subscribe((data) => {
                    if (data.length > 0) {
                      for (let i = 0; i < data.length; i++) {
                        if (data[i].SessionKey == this.selectedSessionDetails.$key) {
                          this.fb.update(data[i].$key, "/PaymentGatewayInfo/Session/" + member.TransactionNo + "/SessionDetails", { IsPaid: true, TransactionNo: member.TransactionNo });
                        }
                      }
                    }
                  });
                  //update data in session folder
                  this.fb.update(member.Key, "/Session/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + this.selectedSessionDetails.CoachKey + "/" + this.selectedSessionDetails.SessionType + "/" + this.selectedSessionDetails.$key + "/Member/", { AmountPayStatus: this.paymentDetails.PaymentStatus, OtherComments: this.paymentDetails.Comments, IsVerified: true });

                  //update data in coach folder
                  this.fb.update(member.Key, "/Coach/Type2/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.CoachKey + "/Session/" + this.selectedSessionDetails.$key + "/Member/", { AmountPayStatus: this.paymentDetails.PaymentStatus, OtherComments: this.paymentDetails.Comments, IsVerified: true });

                  //update data in member folder
                  this.fb.update(this.selectedSessionDetails.$key, "/Member/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + member.Key + "/Session/", { AmountPayStatus: this.paymentDetails.PaymentStatus, OtherComments: this.paymentDetails.Comments, IsVerified: true });

                  // keep comments in folder
                  // Comment during coach updating the cash payment
                  this.fb.saveReturningKey("/Session/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + this.selectedSessionDetails.CoachKey + "/" + this.selectedSessionDetails.SessionType + "/" + this.selectedSessionDetails.$key + "/Member/" + member.Key + "/CommentsByAdmin/", { Comments: this.paymentDetails.Comments });

                  this.fb.saveReturningKey("/Member/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + member.Key + "/Session/" + this.selectedSessionDetails.$key + "/CommentsByAdmin/",
                    { Comments: this.paymentDetails.Comments });

                  this.fb.saveReturningKey("/Coach/Type2/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.CoachKey + "/Session/" + this.selectedSessionDetails.$key + "/Member/" + member.Key +
                    "/CommentsByAdmin/", { Comments: this.paymentDetails.Comments });
                  //console.log("/Member/" + this.selectedSessionDetails.ParentClubKey + "/" + this.selectedSessionDetails.ClubKey + "/" + member.Key + "/Session/" + this.selectedSessionDetails.$key + "/CommentsByAdmin/");
                  let message = "Payment info has been updated successfully.";
                  this.showToast(message, 8000);
                  this.navCtrl.pop();
                  this.navCtrl.pop();
                }
              }

            }
          }
        }
      ]
    });
    confirm.present();
  }
  paymentStatus() {
    if (this.paymentDetails.PaymentStatus == "Pending Verification") {
      let message = "Payment status is already pending verification.";
      this.showToast(message, 5000);
      return false;
    }
    else {
      return true;
    }

  }

  validateInput() {

    if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.showToast(message, 5000);
      return false;
    }
    else {
      return true;
    }
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }


  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }


}




