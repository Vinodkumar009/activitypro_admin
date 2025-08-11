import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import * as $ from "jquery";
import moment from 'moment'

// import { CommonService } from '../../../services/common.service';
// import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-updatepayment',
    templateUrl: 'updatepayment.html',
})
export class UpdatePayment {
    ParentClubKey: any;
    currencycode: any;
    currencyDetails: any;
    membership: any;
    member: any;
    paymentDetails = {
        PaymentAmount: 0,
        PaymentMode: '',
        PaymentStatus: '',
        Comments: '',
        Discount: 0,
        DiscountType: ''
    }
    MemberShipPayment = {
        extraCharge: 0,
        amount: 0,
        description: '',
        currency: '',
        source: '',
        parentclubKey: '',
        clubKey: '',
        activityKey: '',
        setupKey: '',
        memberShipInfo: [],
    }
    PaymentModel = {
        MemberShipPayment:{},
        PaymentUpdate:{}
    }
    memberofSameMembership: any;
    nestUrl: string;
    isDicountfetch: boolean = false;
    loadingController: any;
    totalAmount: number = 0;

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public navParam: NavParams,

        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        private platform: Platform, storage: Storage,
        public loadingCtrl: LoadingController,
        public http: HttpClient,
        public sharedservice: SharedServices,
        private toastCtrl: ToastController, public comonService: CommonService
    ) {
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.currencycode = val.Currency;
            }
            this.nestUrl = this.sharedservice.getnestURL();
            this.membership = this.navParam.get('membership')
            this.member = this.navParam.get('member')
            this.memberofSameMembership = this.membership.memberPresent.filter(eachMember => eachMember.primaryMembershipKey === this.member.primaryMembershipKey)
            this.getDiscounts()
            this.totalAmount = +this.member.Amount + +this.member.AdminFees    
        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })

    }


    validateAmount(e) {

    }

    async updatePaymentInfo() {
        try {
            if (this.validate()) {
                this.loadingController = this.loadingCtrl.create({
                    content: 'Please wait, Dont press back or close button...'
                });
                this.loadingController.present();
                this.MemberShipPayment.description = 'Membership Payment for ' + this.member['DisplayName']
                this.MemberShipPayment.amount = this.paymentDetails.PaymentAmount
                this.MemberShipPayment.clubKey = this.membership.ClubKey
                this.MemberShipPayment.setupKey = this.membership.SetupKey
                this.MemberShipPayment.parentclubKey = this.ParentClubKey
                this.MemberShipPayment.extraCharge = 0.00
                this.MemberShipPayment.currency = '_blank'
                this.MemberShipPayment.source = '_blank'
                this.MemberShipPayment.activityKey = '_blank'
                let activemember = { FirstName: '', LastName: '', EmailID: '', key: '', Key: '',MemberKey:'' }
               
                
                let eachmembership = { eachDiscount:0,DiscountType:'', IsRenewed:'', SetupKey:'', SetupName:'', PaymentOptions:'', activeMembers:[]} 
                eachmembership['eachDiscount'] = this.paymentDetails.Discount
                eachmembership['DiscountType'] = this.paymentDetails.DiscountType
                eachmembership['IsRenewed'] = this.member.IsRenewed
                eachmembership['SetupKey'] = this.member.SetupKey
                eachmembership['SetupName'] = this.member.SetupName
                eachmembership['PaymentOptions'] = this.member.PaymentOptions

                this.memberofSameMembership.forEach(member => {
                    activemember = {
                        FirstName: member.DisplayName.split(' ')[0],
                        LastName: member.DisplayName.split(' ')[1],
                        EmailID: member.EmailID,
                        key: member.MemberKey,
                        Key: member.MembershipAssignedKey,
                        MemberKey: member.MemberKey
                    }

                    eachmembership['activeMembers'].push(activemember)
                });
                this.MemberShipPayment.memberShipInfo.push(eachmembership)
                let payment = {
                    PaymentAmount: this.paymentDetails.PaymentAmount,
                    PaymentMode: this.paymentDetails.PaymentMode,
                    PaymentStatus: this.paymentDetails.PaymentStatus,
                    Comments: this.paymentDetails.Comments,
                }
                this.PaymentModel.PaymentUpdate = payment
                this.PaymentModel.MemberShipPayment = this.MemberShipPayment
                let response = await this.callupdatepayment()
                this.comonService.toastMessage('Payment successful', 3000, ToastMessageType.Success, ToastPlacement.Bottom, true);
                this.loadingController.dismiss();
                this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-4));
            } else {

            }
        } catch (err) {
            this.loadingController.dismiss();
            this.comonService.toastMessage(err, 3000)
        }

    }

    validate() {
        if (!this.paymentDetails.PaymentAmount) {
            this.comonService.toastMessage("Payment Amount can't be blank", 2000)
            return false

        }

        else if (!this.paymentDetails.PaymentMode) {
            this.comonService.toastMessage("Payment Mode can't be blank", 2000)
            return false
        }
        else if (!this.paymentDetails.PaymentStatus) {
            this.comonService.toastMessage("Payment Status can't be blank", 2000)
            return false
        }
        else if (!this.paymentDetails.Comments) {
            this.comonService.toastMessage("Payment Comments can't be blank", 2000)
            return false
        }
        else
            return true
    }

    callupdatepayment() {
        return new Promise((resolve, reject) => {
            //this.nestUrl = "https://activitypro-nest.appspot.com"
            $.ajax({
                url: `${this.nestUrl}/membership/adminpaymentupdate`,
                type: "POST",
                data: this.PaymentModel,
                success: function (res) {
                    // res = JSON.parse(res);
                    if (res['type'] == "SUCCESS") {
                        resolve(res)
                    } else {
                        reject(res)
                    }
                },
                error: (err) => {
                    reject(err)
                }
            });
        })
    }

    cancel() {
        this.paymentDetails = {
            PaymentAmount: 0,
            PaymentMode: '',
            PaymentStatus: '',
            Discount: 0,
            Comments: '',
            DiscountType: ''
        }
    }

    showToast(m: string, dur: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: dur,
            position: 'bottom'
        });
        toast.present();
    }

    calAmount()
    {
        this.paymentDetails.PaymentAmount = this.totalAmount - +this.paymentDetails.Discount
    }

    getDiscounts() {
        try {

            this.http.get(`${this.nestUrl}/membership/discount?paymentOptiuonType=${this.member.PaymentOptions}&setupKey=${this.member.SetupKey}&clubKey=${this.membership.ClubKey}&parentClubKey=${this.ParentClubKey}`).subscribe((discountObj: any) => {
                //this.Discounts = discountObj.data;
                this.isDicountfetch = true
                if (discountObj.data.length > 0) {
                    this.paymentDetails.Discount = +discountObj.data[0]['value']
                    this.paymentDetails.DiscountType = discountObj.data[0]['name']
                    this.paymentDetails.PaymentAmount = +this.totalAmount - +this.paymentDetails.Discount
                }
            }, (err) => {
                this.isDicountfetch = true
                console.log(JSON.stringify(err));
            });

        } catch (err) {

        }

        //this.nodeUrl = "https://1ed4bb79.ngrok.io";

    }

}
// obj.eachDiscount;
// obj.activeMembers
// obj.DiscountType;
// obj.IsRenewed;
// obj.PaymentOptions;obj.SetupName; obj.SetupKey;obj.PaymentOptions;
// memberShipInfo[0]["activeMembers"][0]["FirstName"]
