import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { GraphqlService } from '../../../../services/graphql.service';
import moment from 'moment';
import { LeagueParticipantModel, LeaguesForParentClubModel } from '../models/league.model';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';
import { HttpService } from '../../../../services/http.service';
import { error } from 'console';
import { CatandType } from '../models/location.model';

/**
 * Generated class for the LeaguepaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leaguepayment',
  templateUrl: 'leaguepayment.html',
  providers: [HttpService]
})
export class LeaguepaymentPage {

  maxDate: any;
  minDate: any;
  parentClubKey: any;
  price_confirm: string = "";
  themeType: number;
  userData: any;
  selectedMemberDetails: LeagueParticipantModel;
  selectedLeagueDetails: LeaguesForParentClubModel;

  paymentMode: CatandType[]

  parentClubId: string = "";

  payment_update_input: LeaguePaymentInput_V3 = {
    user_postgre_metadata: new UserPostgreMetadataField,
    orderId: '',
    UpdatedBy: '',
    user_payment: new LeagueUserPaymentStatusUpdate,
    user_device_metadata: new UserDeviceMetadataField
  }

  commonInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    league_id: ""

  }

  PaymentMethod = {
    CASH: 0,
    ONLINE: 1,
    BACS: 2,
    CHILDCAREVOUCHER: 3,
    WALLET: 4,
    CHEQUE: 5,
  }

  PaymentStatus = {
    DUE: 0,
    PAID: 1,
    PENDINGVERIFICATION: 3,
  }

  paymentDetails = {
    PaymentAmount: '',
    PaymentMode: '',
    PaymentStatus: '',
    Comments: 'Thankyou'
  }

  constructor(
    private commonService: CommonService,
    public alertCtrl: AlertController, public navParams: NavParams,
    public storage: Storage,
    public fb: FirebaseService,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
  ) {
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();

    this.selectedMemberDetails = <LeagueParticipantModel>navParams.get('SelectedMember');
    this.selectedLeagueDetails = <LeaguesForParentClubModel>navParams.get('SessionDetails');
    this.commonInput.league_id = this.selectedLeagueDetails.id;

    this.payment_update_input.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2
    this.payment_update_input.user_device_metadata = {
      UserAppType: 0,
      UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
    }

    if (this.selectedMemberDetails.amount_pay_status != 0) {
      this.payment_update_input.user_payment.amount = parseFloat(this.selectedMemberDetails.paid_amount).toFixed(2);
      this.payment_update_input.user_payment.payment_mode = Number(this.selectedMemberDetails.paidby);

      this.payment_update_input.user_payment.comments = "";
    } else {
      this.payment_update_input.user_payment.comments = "Payment received. Thanks!"
      this.payment_update_input.user_payment.amount = parseFloat(this.selectedMemberDetails.amount_due).toFixed(2);
    }
    //this.payment_update_input.user_payment.payment_status = this.PaymentStatus[this.selectedMemberDetails.amount_pay_status.toUpperCase()]
    this.payment_update_input.user_payment.payment_status = this.selectedMemberDetails.amount_pay_status;
    this.payment_update_input.user_payment.enrollementId = this.selectedMemberDetails.id;

    this.parentClubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();

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
    this.getPaymentMode();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeaguepaymentPage');
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

  updatePaymentInfo() {
    this.paymentDetails.PaymentAmount = parseFloat(this.paymentDetails.PaymentAmount).toFixed(2);
    let member = this.selectedMemberDetails;
    if (this.validateInput()) { }
  }

  getPaymentMode() {
    this.httpService.post(`league/getPaymentMethods`, this.commonInput).subscribe((res: any) => {
      this.paymentMode = res["data"];
    }, (error) => {
      this.commonService.toastMessage("Payment mode fetch failed", 2500, ToastMessageType.Error)
    }
    )
  }



  updatePaymentInPostgre() {
    this.payment_update_input.user_payment.payment_mode = Number(this.payment_update_input.user_payment.payment_mode);
    this.payment_update_input.user_payment.payment_status = Number(this.payment_update_input.user_payment.payment_status);
    if (this.paymentStatus()) {
      this.commonService.showLoader("Please wait");
      const payment_update_mutation = gql`
      mutation updateLeaguePaymentAdmin($leaguePaymentUpdateInput: LeaguePaymentInput_V3!) {
        updateLeaguePaymentAdmin(leaguePaymentUpdateInput: $leaguePaymentUpdateInput)
      }`

      const variables = { leaguePaymentUpdateInput: this.payment_update_input }

      this.graphqlService.mutate(payment_update_mutation, variables, 0).subscribe(
        result => {
          this.commonService.hideLoader();
          // Handle the result
          this.commonService.toastMessage("Payment updated successfully", 2500, ToastMessageType.Success);
          this.navCtrl.pop();
        },
        error => {
          // Handle errors
          this.commonService.hideLoader();
          console.error(error);
          this.commonService.toastMessage("Payment updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
    }
  }

  validateInput() {
    if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
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
  paymentStatus() {
    if (this.payment_update_input.user_payment.amount == undefined || this.payment_update_input.user_payment.amount == "") {
      this.commonService.toastMessage("Please enter the amount", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    if (this.payment_update_input.user_payment.payment_mode == undefined) {
      this.commonService.toastMessage("Please select payment mode", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if (this.payment_update_input.user_payment.payment_status == undefined) {
      this.commonService.toastMessage("Please select payment status", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    // else if (this.payment_update_input.user_payment.payment_status == PaymentStatus.PENDINGVERIFICATION) {
    //   this.commonService.toastMessage("Payment status should be paid", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //   return false;
    // }
    else if (this.payment_update_input.user_payment.comments == "") {
      this.commonService.toastMessage("Please enter comments", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }
  }




  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }


}

export class LeaguePaymentInput_V3 {
  user_postgre_metadata: UserPostgreMetadataField
  user_device_metadata: UserDeviceMetadataField
  orderId: string
  UpdatedBy: string
  user_payment: LeagueUserPaymentStatusUpdate
}

export class UserPostgreMetadataField {
  UserParentClubId: string
}

export class UserDeviceMetadataField {
  UserAppType: number
  UserDeviceType: number
}


export class LeagueUserPaymentStatusUpdate {
  enrollementId: string
  transactionId: string
  payment_mode: number
  payment_status: number
  comments: string
  amount: string
  payment_date: string
}

