import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { GraphqlService } from '../../../services/graphql.service';
import { TermSessionDets, TermSessionMembers } from './model/session_details.model';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { SessionPaymentUpdateInput } from '../school/dto/school_ses_payment.dto';
@IonicPage()
@Component({
  selector: 'updatepaymentdetailsforgroup-page',
  templateUrl: 'updatepaymentdetailsforgroup.html'
})

export class Type2PaymentDetailsForGroup {
  TermSessionDets
  parentClubKey: any;
  themeType: number;
  payment_update_input:SessionPaymentUpdateInput = {
    orderId:"",
    UpdatedBy: "",
    user_payment:{
      enrollementId: "",
      transactionId:"",
      payment_mode:0,
      payment_status:0,
      comments: "",
      amount: "",
      payment_date: moment().format('YYYY-MM-DD'),
    }
  }

  PaymentMethod = {
    CASH:0,
    ONLINE:1,
    BACS:2,
    CHILDCAREVOUCHER:3,
    WALLET:4,
    CHEQUE:5,
  }

  PaymentStatus = {
    DUE:0,
    PAID:1,
    PENDINGVERIFICATION:3,
  }
  
  paymentDetails = {
    PaymentAmount: '',
    PaymentMode: '',
    PaymentStatus: '',
    Comments: 'Thankyou'
  }
  paymentGatewayKey: any;
  paymentTransactionKey: any;
  tokens = [];
  payment_mode: number;
  selectedInstallment: any;
  selectedInstallmentDetailsOfSelectedMember: any;
  userData: any;
  selectedMemberDetails: TermSessionMembers;
  selectedSessionDetails: TermSessionDets;
  constructor(
    private commonService: CommonService, 
    public alertCtrl: AlertController, public navParams: NavParams,
      public storage: Storage,
      public fb: FirebaseService, 
      public navCtrl: NavController, 
      public sharedservice: SharedServices, 
      public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService,
    ) {
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();

    this.selectedMemberDetails = <TermSessionMembers>navParams.get('SelectedMember');
    this.selectedSessionDetails = <TermSessionDets>navParams.get('SessionDetails');

    if (this.selectedMemberDetails.amount_pay_status!=0) {
      this.payment_update_input.user_payment.amount = parseFloat(this.selectedMemberDetails.amount_paid).toFixed(2);
      this.payment_update_input.user_payment.payment_mode = Number(this.selectedMemberDetails.paidby);
      //this.payment_mode = amount_pay_status
      //this.PaymentMethod[this.selectedMemberDetails.paidby.toUpperCase()]
      this.payment_update_input.user_payment.comments = this.selectedMemberDetails.admin_comments || "";
    } else {
      this.payment_update_input.user_payment.comments = "Payment received. Thanks!"
      this.payment_update_input.user_payment.amount = parseFloat(this.selectedMemberDetails.amount_due).toFixed(2);
    }
    //this.payment_update_input.user_payment.payment_status = this.PaymentStatus[this.selectedMemberDetails.amount_pay_status.toUpperCase()]
    this.payment_update_input.user_payment.payment_status = this.selectedMemberDetails.amount_pay_status;
    this.payment_update_input.user_payment.enrollementId = this.selectedMemberDetails.session_member_id;

    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.payment_update_input.UpdatedBy = this.sharedservice.getLoggedInId();
      }
    });
   

    //this.getDeviceTokenOfSelectedMember();
    this.paymentDetails.Comments = "Payment received. Thanks!";
    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    
  }


  cancel() {
    this.navCtrl.pop();
  }

  // if(!this.validateAmount(this.paymentDetails.PaymentAmount)) {
  //     let message = "Please enter correct email id";
  //     this.showToast(message, 5000);
  //     return false;
  // }

  validateAmount(ev: any) {
    ///^[-+]?[0-9]+\.[0-9]+$/;
    var re: any = /^[0-9]+\.[0-9]+$/;
    console.log(ev.target.value);
    console.log(re.test(ev.target.value));
    if (!re.test(ev.target.value)) {
      return false;
    }else{
      return true;
    }
  }

  confirmationPaymentAlert() {
    let confirm = this.alertCtrl.create({
      title: 'Update Payment',
      message: 'Are you sure you want to update the payment details?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            //Are you sure you want to update the payment details?
            this.updatePaymentInPostgre();
          }
        }
      ]

    });
    confirm.present();
  }

  updatePaymentInfo(){
    this.paymentDetails.PaymentAmount = parseFloat(this.paymentDetails.PaymentAmount).toFixed(2);
    let member = this.selectedMemberDetails;
    if (this.validateInput()) {}      
  }

  paymentStatus() {
    if (this.payment_update_input.user_payment.amount == undefined || this.payment_update_input.user_payment.amount == "") {
      this.commonService.toastMessage("Please enter the amount", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    if (this.payment_update_input.user_payment.payment_mode == undefined) {
      this.commonService.toastMessage("Please select payment mode", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.payment_update_input.user_payment.payment_status == undefined) {
      this.commonService.toastMessage("Please select payment status", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    // else if (this.payment_update_input.user_payment.payment_status == PaymentStatus.PENDINGVERIFICATION) {
    //   this.commonService.toastMessage("Payment status should be paid", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //   return false;
    // }
    else if (this.payment_update_input.user_payment.comments == "") {
      this.commonService.toastMessage("Please enter comments", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }
  }

  validateInput() {
    if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }
 }

 

//updating the session in postgre
updatePaymentInPostgre(){
    this.payment_update_input.user_payment.payment_mode = Number(this.payment_update_input.user_payment.payment_mode);
    this.payment_update_input.user_payment.payment_status = Number(this.payment_update_input.user_payment.payment_status);
    if(this.paymentStatus()){
      this.commonService.showLoader("Please wait");
      const payment_update_mutation = gql`
      mutation updateSessionPaymentAdmin($payment_update_input: SessionPaymentInput_V3!) {
        updateSessionPaymentAdmin(sessionPaymentUpdateInput: $payment_update_input)
      }` 
      
      const variables = {payment_update_input:this.payment_update_input}
  
      this.graphqlService.mutate(payment_update_mutation,variables,0).subscribe(
        result => {
          this.commonService.hideLoader();
          // Handle the result
          this.commonService.toastMessage("Payment updated successfully", 2500,ToastMessageType.Success);
          this.navCtrl.pop();                        
        },
        error => {
          // Handle errors
          this.commonService.hideLoader();
          console.error(error);
          this.commonService.toastMessage("Payment updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
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

  confirmAlert() {

    let confirm = this.alertCtrl.create({
      subTitle: "Notification",
      message: 'Do you want to send a notification?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.navCtrl.push("Type2PaymentConfirmationNotification", {
              Tokens: this.tokens,
              MemberDetails: this.selectedMemberDetails,
              SessionDetails: this.selectedSessionDetails,
              PaymentType: this.paymentDetails.PaymentMode,
              Purpose: "SessionPayment"
            });

          }
        }
      ]
    });
    confirm.present();
  }



  // getParentClubNotification() {


  //   this.fb.getAllWithQuery("/NotificationCenterSetup/ParentClub/" + this.selectedParentClubKey, { orderByKey: true }).subscribe((data) => {
  //     this.parentClubNotificationSetup = data;
  //   });
  // }


  getDeviceTokenOfSelectedMember() {
    let mKey = "";
    // if (this.selectedMemberDetails.ParentKey = "") {
    //   mKey = this.selectedMemberDetails.Key;
    // } else {
    //   mKey = this.selectedMemberDetails.ParentKey;
    // }
    // // this.fb.getAllWithQuery("DeviceToken/Member/" + this.me)
    // this.fb.getAllWithQuery("/DeviceToken/Member/" + this.selectedMemberDetails.ParentClubKey + "/" + this.selectedMemberDetails.ClubKey + "/" + this.selectedMemberDetails.Key + "/Token", { orderByKey: true }).subscribe((data) => {
    //   this.tokens = data;
    // });
  }


}
