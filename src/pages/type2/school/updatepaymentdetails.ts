import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { ISession_MemberEnrols, SchoolDetails } from './schoolsession.model';
import { PaymentStatus, PaymentTypes } from "../../../shared/constants/payment.constants"
import { SessionPaymentUpdateInput } from './dto/school_ses_payment.dto';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import * as moment from 'moment';
@IonicPage()
@Component({
  selector: 'updatepaymentdetails-page',
  templateUrl: 'updatepaymentdetails.html',
  providers:[GraphqlService]
})

export class UpdatePaymentDetails {
  parentClubKey: any;
  themeType: number;
  selectedMemberDetails: ISession_MemberEnrols;
  selectedSessionDetails: SchoolDetails;

  paymentDetails = {
    PaymentAmount: '',
    PaymentMode: '',
    PaymentStatus: '',
    Comments: 'Payment received. Thanks!'
  }
  paymentGatewayKey: any;
  paymentTransactionKey: any;

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

  payment_mode: number;
  
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



  constructor(public alertCtrl: AlertController, 
    public navParams: NavParams, storage: Storage,
     public fb: FirebaseService, public navCtrl: NavController, 
     public sharedservice: SharedServices, 
     public popoverCtrl: PopoverController,
     private commonService:CommonService,
     private graphqlService: GraphqlService) {
    this.themeType = sharedservice.getThemeType();
    this.selectedMemberDetails = <ISession_MemberEnrols>navParams.get('SelectedMember');
    this.selectedSessionDetails = <SchoolDetails>navParams.get('SessionDetails');
    
    ;
//|| Number(this.selectedMemberDetails.amount_pay_status) != PaymentStatus.DUE
    if (Number(this.selectedMemberDetails.amount_pay_status)!== 0) {
      this.payment_update_input.user_payment.amount = this.selectedMemberDetails.payment.amount_paid;
      this.payment_update_input.user_payment.payment_mode = this.selectedMemberDetails.payment.paidby;
      //this.payment_mode = this.PaymentMethod[this.selectedMemberDetails.payment.paidby.toUpperCase()]
      this.payment_update_input.user_payment.comments = this.selectedMemberDetails.payment.admin_comments || "";
    } else {
      this.payment_update_input.user_payment.comments = "Payment received. Thanks!"
      this.payment_update_input.user_payment.amount = this.selectedMemberDetails.amount_due;
    }
    this.payment_update_input.user_payment.payment_status = Number(this.selectedMemberDetails.amount_pay_status);
    this.payment_update_input.user_payment.enrollementId = this.selectedMemberDetails.id;


    // if (this.selectedSessionDetails.$key == undefined) {
    //   this.selectedSessionDetails.$key = this.selectedSessionDetails.Key;
    // }
    // if (this.selectedMemberDetails.AmountPayStatus == "Due") {
    //   this.paymentDetails.PaymentAmount = this.selectedMemberDetails.AmountDue;
    // } else {
    //   this.paymentDetails.PaymentAmount = this.selectedMemberDetails.AmountPaid;
    // }
    

    // if(this.selectedMemberDetails.AmountPayStatus!= "Due"){
    //   this.paymentDetails.PaymentMode = this.selectedMemberDetails.PaidBy;
    // }

    // if (this.selectedMemberDetails.AmountPayStatus == "Due") {
    //   this.paymentDetails.PaymentStatus = "";
    // }
    // else if (this.selectedMemberDetails.AmountPayStatus == "Pending Verification") {
    //   this.paymentDetails.PaymentStatus = "Pending Verification";
    // } else {
    //   this.paymentDetails.PaymentStatus = "Paid";
    // }



    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.payment_update_input.UpdatedBy = val.$key;
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
          }
        },
        {
          text: 'Yes',
          handler: () => {
           //call the update payment
           this.updatePayment();
          }
        }
      ]
    });
    confirm.present();
  }

  updatePayment() {
    this.payment_update_input.user_payment.payment_mode = Number(this.payment_update_input.user_payment.payment_mode);
    this.payment_update_input.user_payment.payment_status = Number(this.payment_update_input.user_payment.payment_status);
    if(this.paymentStatus()){
      this.commonService.showLoader("Please wait");
      const payment_update_mutation = gql`
      mutation updateSchoolSessionPaymentAdmin($payment_update_input: SchoolSessionPaymentInput_V3!) {
        updateSchoolSessionPaymentAdmin(schoolSessionPaymentUpdateInput: $payment_update_input)
      }` 
      
      const variables = {payment_update_input:this.payment_update_input}
  
      this.graphqlService.mutate(payment_update_mutation,variables,0).subscribe(
        result => {
          this.commonService.hideLoader();
          // Handle the result
          this.commonService.toastMessage("Payment updated successfully", 2500,ToastMessageType.Success);
          this.commonService.updateCategory("update_scl_session_list");
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
  updatePaymentValidation() {
    this.paymentDetails.PaymentAmount = this.paymentDetails.PaymentAmount.trim();
    if (this.paymentDetails.PaymentAmount == undefined || this.paymentDetails.PaymentAmount == "") {
      let message = "Please contact support, Unable to update.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }

  }
  validateInput() {
    if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
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


  

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }


}
