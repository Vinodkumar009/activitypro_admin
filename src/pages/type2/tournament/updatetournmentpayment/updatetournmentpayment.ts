import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
/**
 * Generated class for the UpdatetournmentpaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-updatetournmentpayment',
  templateUrl: 'updatetournmentpayment.html',
})
export class Updatetournmentpayment {
  selectedMember: any;
  TourmentDets: any;
  paymentDetails = {
    PaymentAmount: '',
    PaymentMode: '',
    PaymentStatus: '',
    Comments: 'Thank you'
  }
  userData: any;
  nestUrl: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private toastCtrl: ToastController, public alertCtrl: AlertController, public fb: FirebaseService, private commonService: CommonService, public sharedservice: SharedServices, public http: HttpClient,) {
    this.selectedMember = this.navParams.get("SelectedMember");
    this.TourmentDets = this.navParams.get("TournmentDetails");
    this.userData = sharedservice.getUserData();
    this.nestUrl = sharedservice.getnestURL();
    if(this.selectedMember.AmountPayStatus!="Due"){
      this.paymentDetails.PaymentStatus = this.selectedMember.AmountPayStatus;
      this.paymentDetails.PaymentMode = this.selectedMember.PaymentGatewayInfo.PaymentMode;
    }
    this.paymentDetails.PaymentAmount = this.selectedMember.AmountPayStatus!="Due" ? this.selectedMember.AmountPaid:this.selectedMember.AmountDue;
    // console.log(this.selectedMember);
    // console.log(this.TourmentDets);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdatetournmentpaymentPage');
  }

  cancel() {
    this.navCtrl.pop();
  }


  validateAmount(ev: any) {
    ///^[-+]?[0-9]+\.[0-9]+$/;
    var re: any = /^[0-9]+\.[0-9]+$/;
    console.log(ev.target.value);
    console.log(re.test(ev.target.value));
    if (!re.test(ev.target.value)) {
      return false;
    } else {
      return true;
    }
  }





  updatePaymentInfo() {
    let name = this.selectedMember.FirstName + " " + this.selectedMember.LastName;
    let paidalert = this.alertCtrl.create({
      title: 'Update Payment',
      message: `Are you sure you want to update the payment details?`,
      buttons: [
        {
          text: "No",
          role: 'cancel'

        },
        {
          text: 'Yes',
          handler: data => {
            if (this.validateInput()) {
              this.update();
            }
          }
        }
      ]
    });
    paidalert.present();

  }

  update() {
    let now = new Date();
    let orderNo = this.TourmentDets.ParentClubKey + ((now.getDate()).toString() + (now.getMonth() < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1) + now.getFullYear().toString().substr(-2) + now.getTime());
    let url = this.sharedservice.getEmailUrl();
    let discountsGiven = '0';

    const PaymentObjModal = {
      ParentclubKey: this.TourmentDets.ParentClubKey,
      TourmentKey: this.TourmentDets.$key,
      MemberKey: this.selectedMember.Key,
      MemberClubKey: this.selectedMember.ClubKey,
      TotalAmount: this.paymentDetails.PaymentAmount,
      SubTotalAmount: this.selectedMember.TotalFeesAmount,
      PaymentStatus: this.paymentDetails.PaymentStatus,
      AmountPaid: this.paymentDetails.PaymentAmount,
      IsPaid: true,
      TransactionNo: "",
      PaymentMode: this.paymentDetails.PaymentMode,
      // OrderNo: orderNo,
      // PaymentOption: this.paymentDetails.PaymentMode == "Cash" ? 101 : 100 //cash 101, //bacs 100
    }
    if (this.validateInput()) {
      this.commonService.showLoader("Please wait");
      //this.nestUrl = "https://activitypro-nest-261607.appspot.com";
      //this.nestUrl = "https://activitypro-nest.appspot.com"
      //this.nestUrl = "http://localhost:3000";
      this.http.post(`${this.nestUrl}/turnament/updatepaymenybyadmin`, PaymentObjModal)
        .subscribe((res: any) => {
          this.commonService.hideLoader();
          if (res) {
            this.commonService.toastMessage("Payment updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.navCtrl.pop();
          }
        }, err => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Payment updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        });
    }


  }

  validateInput() {
    if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }else if (this.paymentDetails.PaymentMode == "") {
      let message = "Please select paymentmode.";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }
  }


}
